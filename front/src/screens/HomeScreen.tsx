import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchSubscriptions } from '../redux/slices/subscriptionSlice';
import SubscriptionCard from '../components/SubscriptionCard';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';

type HomeScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { subscriptions, loading } = useAppSelector((state) => state.subscriptions);

  const loadSubscriptions = useCallback(async () => {
    if (user?._id) {
      await dispatch(fetchSubscriptions(user._id)).unwrap();
    }
  }, [user?._id, dispatch]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mes abonnements</Text>
        <FlatList
          data={subscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard 
              subscription={item} 
              onRefresh={loadSubscriptions}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadSubscriptions}
        />
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('Add')}
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#377AF2',
  },
});

export default HomeScreen;
