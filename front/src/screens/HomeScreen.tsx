import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '@nanostores/react';
import { $user } from '../store/userStore';
import { $subscriptions, setSubscriptions } from '../store/subscriptionStore';
import SubscriptionCard from '../components/SubscriptionCard';

const HomeScreen = () => {
  const user = useStore($user);
  const subscriptions = useStore($subscriptions);

  useEffect(() => {
    if (user?._id) {
      loadSubscriptions();
    }
  }, [user?._id]);

  const loadSubscriptions = async () => {
    try {
      const response = await fetch(`http://localhost:3000/subs/user/${user?._id}`);
      const data = await response.json();
      if (data.result) {
        setSubscriptions(data.subs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mes abonnements</Text>
        <FlatList
          data={subscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard subscription={item} onRefresh={loadSubscriptions} />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
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
});

export default HomeScreen;
