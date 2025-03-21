import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../types';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { subscriptions } = useAppSelector((state) => state.subscriptions);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={initials}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.firstname} {user?.lastname}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalCount}</Text>
            <Text style={styles.statLabel}>Abonnements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.monthlyTotal}€</Text>
            <Text style={styles.statLabel}>Total mensuel</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.yearlyTotal}€</Text>
            <Text style={styles.statLabel}>Total annuel</Text>
          </View>
        </View>

        <List.Section>
          <List.Subheader>Paramètres</List.Subheader>
          <List.Item
            title="Modifier le profil"
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={() => {}}
          />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => {}}
          />
          <List.Item
            title="Aide et support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
          />
        </List.Section>
      </View>

      <View style={styles.bottomContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#ff4444"
        >
          Se déconnecter
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  bottomContainer: {
    padding: 20,
    borderTopColor: '#eee',
  },
  logoutButton: {
    borderColor: '#ff4444',
  },
});

export default ProfileScreen; 