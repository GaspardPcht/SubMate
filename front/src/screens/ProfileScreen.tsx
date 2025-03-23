import React, { useMemo, useEffect } from 'react';
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
import { registerForPushNotifications, scheduleAllSubscriptionReminders, cancelAllScheduledNotificationsAsync } from '../services/notificationService';

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
  const { notificationsEnabled, reminderDays } = useAppSelector((state) => state.userPreferences);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
    const updateNotifications = async () => {
      if (notificationsEnabled) {
        await scheduleAllSubscriptionReminders(subscriptions, reminderDays);
      } else {
        await cancelAllScheduledNotificationsAsync();
      }
    };

    updateNotifications();
  }, [notificationsEnabled, subscriptions, reminderDays]);

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
      const newState = !notificationsEnabled;
      console.log('Changement de l\'état des notifications vers:', newState);
      
      if (newState) {
        // Si on active les notifications, on demande d'abord la permission
        const token = await registerForPushNotifications();
        if (!token) {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Erreur',
            textBody: 'Impossible d\'activer les notifications. Veuillez vérifier vos paramètres.'
          });
          return;
        }
      }

      // Mettre à jour les préférences dans le backend
      await dispatch(saveUserPreferences({ notificationsEnabled: newState })).unwrap();
      
      // Mettre à jour le state local
      dispatch(toggleNotifications());
      
      if (newState) {
        // Programmer les rappels si on active les notifications
        await scheduleAllSubscriptionReminders(subscriptions, reminderDays);
      } else {
        // Annuler tous les rappels si on désactive les notifications
        await cancelAllScheduledNotificationsAsync();
      }

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: `Notifications ${newState ? 'activées' : 'désactivées'}`
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Impossible de mettre à jour les préférences de notifications'
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
                title="Notifications de rappel"
         
                left={props => <List.Icon {...props} icon="bell" />}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleToggleNotifications}
                    color={theme.colors.primary}
                    style={styles.switch}
                  />
                )}
                style={styles.listItem}
              />
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
  switch: {
    marginRight: -8,
  },
});

export default ProfileScreen; 