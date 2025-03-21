import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Home'>;
};

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSubscriptions = async (): Promise<void> => {
    // TODO: Implémenter la logique de chargement des abonnements avec le backend
    // Pour l'instant, on utilise des données de test
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        name: 'Netflix',
        price: 15.99,
        billingCycle: 'Mensuel',
      },
      {
        id: '2',
        name: 'Spotify',
        price: 9.99,
        billingCycle: 'Mensuel',
      },
    ];

    setTimeout(() => {
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const renderSubscription = ({ item }: { item: Subscription }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.subscriptionName}>{item.name}</Text>
        <Text style={styles.subscriptionPrice}>{item.price}€ / {item.billingCycle}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mes abonnements</Text>
        <FlatList
          data={subscriptions}
          renderItem={renderSubscription}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </View>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 