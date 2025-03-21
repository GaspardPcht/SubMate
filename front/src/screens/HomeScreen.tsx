import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Animated, Dimensions } from 'react-native';
import { Text, FAB, Card, useTheme, IconButton, ActivityIndicator, Surface } from 'react-native-paper';
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
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const loadSubscriptions = useCallback(async () => {
    console.log('Chargement des abonnements...');
    console.log('User ID:', user?._id);
    
    if (user?._id) {
      try {
        const result = await dispatch(fetchSubscriptions(user._id)).unwrap();
        console.log('Abonnements chargés:', result);
      } catch (error) {
        console.error('Erreur lors du chargement des abonnements:', error);
      }
    } else {
      console.log('Pas d\'ID utilisateur disponible');
    }
  }, [user?._id, dispatch]);

  useEffect(() => {
    console.log('HomeScreen monté');
    console.log('État actuel des abonnements:', subscriptions);
    
    if (user?._id) {
      console.log('Démarrage du chargement des abonnements');
      loadSubscriptions();
    }
  }, [user?._id]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyState, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Surface style={styles.emptyStateCard} elevation={0}>
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
      </Surface>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Surface style={styles.headerCard} elevation={0}>
        <View style={styles.headerContent}>
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
            style={styles.refreshButton}
          />
        </View>
      </Surface>
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
                outputRange: [50 * (index + 1), 0],
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
      {renderHeader()}
      <FlatList
        data={subscriptions}
        renderItem={renderSubscriptionCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadSubscriptions}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => <View style={styles.footer} />}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.getParent()?.navigate('Add')}
        color={theme.colors.surface}
        elevation={4}
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
    paddingBottom: 8,
  },
  headerCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#377AF2',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  refreshButton: {
    borderRadius: 12,
  },
  list: {
    flexGrow: 1,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateCard: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#377AF2',
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
