import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types';
import SubscriptionCard from '../components/SubscriptionCard';
import { $user } from '../store/userStore';
import { useStore } from '@nanostores/react';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Home'>;
};

interface Subscription {
  _id: string;
  name: string;
  price: number;
  billingCycle: string;     
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useStore($user);


  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async (): Promise<void> => {
    const response = await fetch(`http://localhost:3000/subs/${user?._id}`);
    const data = await response.json();
    if (data.result) {
      setSubscriptions(data.subs);
    } else {
      console.log(data.error);
    }

    setTimeout(() => {
      setSubscriptions(data.subs);
      setLoading(false);
    }, 1000);
  };


  const handleDelete = async (_id: string) => {
    const response = await fetch(`http://localhost:3000/subs/delete/${_id}/${user?._id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (data.result) {
      setSubscriptions(data.subs);
      loadSubscriptions();
    } else {
      console.log(data.error);
    }
  };

  const renderSubscription = ({ item }: { item: Subscription }) => (
    <SubscriptionCard
      subscription={item}
      onDelete={handleDelete}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mes abonnements</Text>
        <FlatList
          data={subscriptions}
          renderItem={renderSubscription}
          keyExtractor={(item) => item._id}
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
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#377AF2',
    borderRadius: 100,
  },
});

export default HomeScreen;
