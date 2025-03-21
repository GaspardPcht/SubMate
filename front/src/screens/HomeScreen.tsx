import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Animated, Dimensions } from 'react-native';
import { Text, FAB, Card, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchSubscriptions } from '../redux/slices/subscriptionSlice';
import SubscriptionCard from '../components/SubscriptionCard';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { subscriptions, loading } = useAppSelector((state) => state.subscriptions);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadSubscriptions = useCallback(async () => {
    if (user?._id) {
      await dispatch(fetchSubscriptions(user._id)).unwrap();
    }
  }, [user?._id, dispatch]);

  useEffect(() => {
    loadSubscriptions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [loadSubscriptions]);

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <MaterialCommunityIcons 
        name="credit-card-multiple"
        size={64} 
        color={theme.colors.primary} 
      />
      <Text style={styles.emptyStateText}>
        Vous n'avez pas encore d'abonnements
      </Text>
      <Text style={styles.emptyStateSubText}>
        Cliquez sur le bouton + pour ajouter votre premier abonnement
      </Text>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <View>
        <Text style={styles.title}>Mes abonnements</Text>
        <Text style={styles.subtitle}>
          {subscriptions.length} abonnement{subscriptions.length > 1 ? 's' : ''} actif{subscriptions.length > 1 ? 's' : ''}
        </Text>
      </View>
      <IconButton
        icon="refresh"
        size={24}
        onPress={loadSubscriptions}
        iconColor={theme.colors.primary}
      />
    </Animated.View>
  );

  const renderSubscriptionCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <SubscriptionCard 
        subscription={item} 
        onRefresh={loadSubscriptions}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={subscriptions}
        renderItem={renderSubscriptionCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadSubscriptions}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => <View style={styles.footer} />}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.getParent()?.navigate('Add')}
        color={theme.colors.surface}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  list: {
    flexGrow: 1,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    height: 80,
  },
});

export default HomeScreen;
