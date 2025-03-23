import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Text, FAB, useTheme, IconButton, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchSubscriptions } from '../redux/slices/subscriptionsSlice';
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

  // Trier les abonnements par date de renouvellement
  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const dateA = new Date(a.nextBillingDate);
      const dateB = new Date(b.nextBillingDate);
      const today = new Date();
      
      // Calculer la différence en jours entre aujourd'hui et la date de renouvellement
      const diffA = Math.ceil((dateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const diffB = Math.ceil((dateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Si les deux dates sont passées, les mettre à la fin
      if (diffA < 0 && diffB < 0) {
        return dateB.getTime() - dateA.getTime(); // Les plus récentes d'abord
      }
      
      // Si une seule date est passée, la mettre à la fin
      if (diffA < 0) return 1;
      if (diffB < 0) return -1;
      
      // Pour les dates futures, trier par proximité
      return diffA - diffB;
    });
  }, [subscriptions]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Mes abonnements</Text>
          <Text style={styles.subtitle}>
            {sortedSubscriptions.length} abonnement{sortedSubscriptions.length > 1 ? 's' : ''} actif{sortedSubscriptions.length > 1 ? 's' : ''}
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
      ) : sortedSubscriptions.length === 0 ? (
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
          data={sortedSubscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard
              subscription={item}
              onRefresh={handleRefresh}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun abonnement</Text>
              </View>
            )
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.getParent()?.navigate('AddSubscription')}
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
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#377AF2',
    textAlign: 'center',
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
