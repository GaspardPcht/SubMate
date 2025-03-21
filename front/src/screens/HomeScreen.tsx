import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, Subscription } from '../types';

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Home'>;
};

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    billingCycle: 'monthly',
    nextBillingDate: '2024-04-15',
  },
  {
    id: '2',
    name: 'Spotify',
    price: 9.99,
    billingCycle: 'monthly',
    nextBillingDate: '2024-04-20',
  },
];

interface SubscriptionCardProps {
  subscription: Subscription;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription }) => (
  <Card style={styles.card}>
    <Card.Content>
      <Text style={styles.subscriptionName}>{subscription.name}</Text>
      <Text style={styles.subscriptionPrice}>
        {subscription.price}€ / {subscription.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}
      </Text>
      <Text style={styles.nextBilling}>
        Prochain paiement : {new Date(subscription.nextBillingDate).toLocaleDateString()}
      </Text>
    </Card.Content>
  </Card>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Abonnements</Text>
        <Searchbar
          placeholder="Rechercher"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredSubscriptions}
        renderItem={({ item }) => <SubscriptionCard subscription={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Add')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  nextBilling: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 