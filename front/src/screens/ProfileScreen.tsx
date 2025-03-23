import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, Button, Avatar, List, Card, useTheme, IconButton, Switch, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { toggleNotifications, loadUserPreferences, saveUserPreferences } from '../redux/slices/userPreferencesSlice';
import { fetchSubscriptions } from '../redux/slices/subscriptionsSlice';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Subscription } from '../types';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { scheduleAllSubscriptionReminders, cancelAllScheduledNotifications, testNotification } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { subscriptions, loading, error } = useAppSelector((state) => state.subscriptions);
  const { notificationsEnabled, reminderDays } = useAppSelector((state) => {
    console.log('État des préférences:', state.userPreferences);
    return state.userPreferences;
  });
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [loadingToggle, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Chargement des données du profil...');
        if (user?._id) {
          console.log('ID utilisateur:', user._id);
          const result = await dispatch(fetchSubscriptions(user._id));
          console.log('Résultat du chargement des abonnements:', result);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (notificationsEnabled) {
      scheduleAllSubscriptionReminders();
    } else {
      cancelAllScheduledNotifications();
    }
  }, [notificationsEnabled]);

  const stats = useMemo(() => {
    const totalCount = subscriptions.length;
    const monthlyTotal = subscriptions.reduce((total: number, sub: Subscription) => {
      if (sub.billingCycle === 'monthly') {
        return total + sub.price;
      } else {
        return total + (sub.price / 12);
      }
    }, 0);
    const yearlyTotal = subscriptions.reduce((total: number, sub: Subscription) => {
      if (sub.billingCycle === 'yearly') {
        return total + sub.price;
      } else {
        return total + (sub.price * 12);
      }
    }, 0);

    return {
      totalCount,
      monthlyTotal: monthlyTotal.toFixed(2),
      yearlyTotal: yearlyTotal.toFixed(2)
    };
  }, [subscriptions]);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
  };

  const initials = useMemo(() => {
    if (!user?.firstname || !user?.lastname) return '';
    return `${user.firstname[0]}${user.lastname[0]}`;
  }, [user?.firstname, user?.lastname]);

  const handleToggleNotifications = async () => {
    try {
      setLoading(true);
      if (notificationsEnabled) {
        await cancelAllScheduledNotifications();
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Succès',
          textBody: 'Notifications désactivées'
        });
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Erreur',
            textBody: 'Les permissions de notification sont requises'
          });
          return;
        }
        await scheduleAllSubscriptionReminders();
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Succès',
          textBody: 'Notifications activées'
        });
      }
      dispatch(toggleNotifications());
    } catch (error) {
      console.error('Erreur lors de la modification des notifications:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Impossible de modifier les notifications'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await testNotification();
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Notification de test envoyée'
      });
    } catch (error) {
      console.error('Erreur lors du test de notification:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Impossible d\'envoyer la notification de test'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Avatar.Text
              size={100}
              label={initials.toUpperCase()}
              style={[styles.avatar, { backgroundColor: '#377AF2' }]}
              color={theme.colors.surface}
            />
            <Text style={styles.name}>{user?.firstname} {user?.lastname}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <Card style={styles.statsCard}>
            <Card.Content>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={24} color={theme.colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                  <Button
                    mode="contained"
                    onPress={() => user?._id && dispatch(fetchSubscriptions(user._id))}
                    style={styles.retryButton}
                  >
                    Réessayer
                  </Button>
                </View>
              ) : (
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="credit-card-multiple" size={24} color={theme.colors.primary} />
                    <Text style={styles.statValue}>{stats.totalCount}</Text>
                    <Text style={styles.statLabel}>Abonnements</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="cash-multiple" size={24} color={theme.colors.primary} />
                    <Text style={styles.statValue}>{stats.monthlyTotal}€</Text>
                    <Text style={styles.statLabel}>Mensuel</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
                    <Text style={styles.statValue}>{stats.yearlyTotal}€</Text>
                    <Text style={styles.statLabel}>Annuel</Text>
                  </View>
                </View>
              )}
            </Card.Content>
          </Card>

          <View style={styles.divider} />

          <Card style={styles.settingsCard}>
            <Card.Content>
              <Text style={styles.settingsTitle}>Paramètres</Text>
              <List.Item
                title="Modifier le profil"
                left={props => <List.Icon {...props} icon="account-edit" />}
                onPress={() => navigation.getParent()?.navigate('EditProfile')}
                style={styles.listItem}
              />
              <List.Item
                title="Notifications"
                description="Recevoir des rappels pour les débits d'abonnements"
                left={props => <List.Icon {...props} icon="bell-outline" />}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleToggleNotifications}
                    color={theme.colors.primary}
                    disabled={loading}
                  />
                )}
              />
              {/* <Button
                mode="outlined"
                onPress={handleTestNotification}
                style={styles.button}
                icon="bell-ring"
              >
                Tester les notifications
              </Button> */}
              <List.Item
                title="Aide et support"
                left={props => <List.Icon {...props} icon="help-circle" />}
                onPress={() => {}}
                style={styles.listItem}
              />
            </Card.Content>
          </Card>

          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={theme.colors.error}
            icon="logout"
          >
            Se déconnecter
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  settingsCard: {
    elevation: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
  logoutButton: {
    borderColor: '#ff4444',
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 4,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 8,
  },
  retryButton: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
});

export default ProfileScreen; 