import React, { useMemo } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, Button, Avatar, List, Card, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const { subscriptions } = useAppSelector((state) => state.subscriptions);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const stats = useMemo(() => {
    const totalCount = subscriptions.length;
    const monthlyTotal = subscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + sub.price;
      } else {
        // Pour les abonnements annuels, on divise par 12 pour avoir le coût mensuel
        return total + (sub.price / 12);
      }
    }, 0);
    const yearlyTotal = subscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'yearly') {
        return total + sub.price;
      } else {
        // Pour les abonnements mensuels, on multiplie par 12 pour avoir le coût annuel
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

  const renderStatCard = (title: string, value: string, icon: IconName) => (
    <Card style={styles.statCard}>
      <Card.Content style={styles.statCardContent}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Mon Profil</Text>
          <View style={styles.header}>
            <Avatar.Text
              size={100}
              label={initials}
              style={[styles.avatar, { backgroundColor: '#377AF2' }]}
              color={theme.colors.surface}
            />
            <Text style={styles.name}>{user?.firstname} {user?.lastname}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <View style={styles.statsContainer}>
            {renderStatCard(
              'Abonnements',
              stats.totalCount.toString(),
              'credit-card-multiple'
            )}
            {renderStatCard(
              'Mensuel',
              `${stats.monthlyTotal}€`,
              'cash-multiple'
            )}
            {renderStatCard(
              'Annuel',
              `${stats.yearlyTotal}€`,
              'calendar-check'
            )}
          </View>

          <Card style={styles.settingsCard}>
            <Card.Content>
              <Text style={styles.settingsTitle}>Paramètres</Text>
              <List.Item
                title="Modifier le profil"
                left={props => <List.Icon {...props} icon="account-edit" />}
                onPress={() => {}}
                style={styles.listItem}
              />
              <List.Item
                title="Notifications"
                left={props => <List.Icon {...props} icon="bell" />}
                onPress={() => {}}
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
    backgroundColor: '#fff',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
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
});

export default ProfileScreen; 