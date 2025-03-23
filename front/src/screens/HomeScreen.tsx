import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Animated, Dimensions } from 'react-native';
import { Text, FAB, Card, useTheme, IconButton, ActivityIndicator, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchSubscriptions, deleteSubscription } from '../redux/slices/subscriptionsSlice';
import SubscriptionCard from '../components/SubscriptionCard';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList, Subscription } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

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
  const { subscriptions, loading } = useAppSelector((state) => {
    console.log('État actuel des abonnements:', state.subscriptions);
    return state.subscriptions;
  });

  // Charger les abonnements au montage du composant
  useEffect(() => {
    const loadData = async () => {
      if (user?._id) {
        try {
          console.log('Chargement des abonnements pour l\'utilisateur:', user._id);
          await dispatch(fetchSubscriptions(user._id));
        } catch (error) {
          console.error('Erreur lors du chargement des abonnements:', error);
        }
      }
    };
    loadData();
  }, [user?._id, dispatch]);

  // Fonction de rafraîchissement
  const handleRefresh = useCallback(async () => {
    if (user?._id) {
      try {
        await dispatch(fetchSubscriptions(user._id));
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
      }
    }
  }, [user?._id, dispatch]);

  console.log('Rendu du HomeScreen avec', subscriptions.length, 'abonnements');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Mes abonnements</Text>
          <Text style={styles.subtitle}>
            {subscriptions.length} abonnement{subscriptions.length > 1 ? 's' : ''} actif{subscriptions.length > 1 ? 's' : ''}
          </Text>
        </View>
        <IconButton
          icon="refresh"
          size={24}
          onPress={handleRefresh}
          iconColor={theme.colors.primary}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : subscriptions.length === 0 ? (
        <View style={styles.emptyState}>
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
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard
              subscription={item}
              onRefresh={handleRefresh}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#377AF2',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#377AF2',
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
  },
});

export default HomeScreen;
