import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Avatar, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, User } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ProfileScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Profile'>;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // TODO: Remplacer par les vraies données de l'utilisateur
  const user: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    totalSubscriptions: 5,
    monthlyTotal: 49.95,
  };

  const handleLogout = async (): Promise<void> => {
    // TODO: Implémenter la logique de déconnexion avec le backend
    // Pour l'instant, on simule une déconnexion réussie
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user.name.split(' ').map(n => n[0]).join('')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.totalSubscriptions}</Text>
          <Text style={styles.statLabel}>Abonnements</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.monthlyTotal}€</Text>
          <Text style={styles.statLabel}>Total mensuel</Text>
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

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor="#ff4444"
      >
        Se déconnecter
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  logoutButton: {
    margin: 20,
    borderColor: '#ff4444',
  },
});

export default ProfileScreen; 