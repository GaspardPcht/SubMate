import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated, Platform } from 'react-native';
import { Text, Surface, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchSubscriptions } from '../redux/slices/subscriptionsSlice';

type BillingCycle = 'monthly' | 'yearly';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const CHART_COLORS = [
  '#377AF2', // Bleu principal
  '#F24B37', // Rouge
  '#37F2A8', // Vert
  '#F2B237', // Orange
  '#9437F2', // Violet
  '#F237E7', // Rose
  '#37E4F2', // Cyan
  '#8CF237', // Vert clair
];

const CATEGORIES = {
  streaming: { name: 'Streaming', icon: 'play-circle', color: '#377AF2' },
  services: { name: 'Services', icon: 'cog', color: '#F24B37' },
  gaming: { name: 'Gaming', icon: 'gamepad-variant', color: '#37F2A8' },
  fitness: { name: 'Fitness', icon: 'dumbbell', color: '#F2B237' },
  other: { name: 'Autres', icon: 'dots-horizontal', color: '#9437F2' },
};

const BudgetScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { subscriptions, user } = useAppSelector((state) => ({
    subscriptions: state.subscriptions.subscriptions,
    user: state.auth.user
  }));
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleRefresh = async () => {
    if (user?._id) {
      await dispatch(fetchSubscriptions(user._id)).unwrap();
    }
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const chartData = useMemo(() => {
    const monthlyData = subscriptions.map((sub, index) => ({
      name: sub.name,
      price: sub.billingCycle === 'monthly' ? sub.price : sub.price / 12,
      color: CHART_COLORS[index % CHART_COLORS.length],
      legendFontColor: '#666',
    }));

    return monthlyData;
  }, [subscriptions]);

  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'monthly') {
        return total + sub.price;
      } else {
        return total + (sub.price / 12);
      }
    }, 0);
  }, [subscriptions]);

  const yearlyTotal = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (sub.billingCycle === 'yearly') {
        return total + sub.price;
      } else {
        return total + (sub.price * 12);
      }
    }, 0);
  }, [subscriptions]);

  const categorizedExpenses = useMemo(() => {
    const categories = {
      streaming: 0,
      services: 0,
      gaming: 0,
      fitness: 0,
      other: 0,
    };

    subscriptions.forEach(sub => {
      const monthlyPrice = sub.billingCycle === 'monthly' ? sub.price : sub.price / 12;
      if (sub.name.toLowerCase().includes('netflix') || sub.name.toLowerCase().includes('spotify') || sub.name.toLowerCase().includes('prime')) {
        categories.streaming += monthlyPrice;
      } else if (sub.name.toLowerCase().includes('cloud') || sub.name.toLowerCase().includes('storage') || sub.name.toLowerCase().includes('backup')) {
        categories.services += monthlyPrice;
      } else if (sub.name.toLowerCase().includes('playstation') || sub.name.toLowerCase().includes('xbox') || sub.name.toLowerCase().includes('nintendo')) {
        categories.gaming += monthlyPrice;
      } else if (sub.name.toLowerCase().includes('gym') || sub.name.toLowerCase().includes('fitness') || sub.name.toLowerCase().includes('sport')) {
        categories.fitness += monthlyPrice;
      } else {
        categories.other += monthlyPrice;
      }
    });

    return Object.entries(categories).map(([key, value]) => ({
      category: key,
      amount: value,
      ...CATEGORIES[key as keyof typeof CATEGORIES],
    }));
  }, [subscriptions]);

  const budgetGoal = 100; // Exemple de budget mensuel cible
  const progress = (totalMonthly / budgetGoal) * 100;

  const renderStatCard = (title: string, value: string, icon: IconName) => (
    <Surface style={styles.statCard} elevation={3}>
      <View style={styles.statCardContent}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Gestion du Budget</Text>
            <IconButton
              icon="refresh"
              size={24}
              onPress={handleRefresh}
              iconColor={theme.colors.primary}
            />
          </View>

          <View style={styles.statsContainer}>
            {renderStatCard(
              'Total Mensuel',
              `${totalMonthly.toFixed(2)}€`,
              'cash-multiple'
            )}
            {renderStatCard(
              'Total Annuel',
              `${yearlyTotal.toFixed(2)}€`,
              'calendar-check'
            )}
          </View>

          <Surface style={styles.chartCard} elevation={3}>
            <View style={styles.chartCardContent}>
              <Text style={styles.chartTitle}>Répartition des dépenses</Text>
              {subscriptions.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <MaterialCommunityIcons name="chart-pie" size={48} color={theme.colors.primary} />
                  <Text style={styles.emptyStateText}>Pas encore d'abonnements</Text>
                </View>
              ) : (
                <View style={styles.chartContainer}>
                  <View style={styles.chartWrapper}>
                    <View style={styles.pieContainer}>
                      <PieChart
                        data={chartData}
                        width={Dimensions.get('window').width * 0.5}
                        height={160}
                        chartConfig={{
                          color: (opacity = 1) => `rgba(55, 122, 242, ${opacity})`,
                          barPercentage: 0.7,
                          useShadowColorFromDataset: false,
                          decimalPlaces: 0,
                          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor="price"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute
                        hasLegend={false}
                        center={[Dimensions.get('window').width * 0.12, 0]}
                        avoidFalseZero={true}
                      />
                    </View>
                    <View style={styles.legendContainer}>
                      {chartData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                          <Text style={styles.legendText} numberOfLines={1}>{`${item.name} (${(item.price).toFixed(2)}€)`}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Surface>

          <Surface style={styles.categoriesCard} elevation={3}>
            <View style={styles.categoriesCardContent}>
              <Text style={styles.categoriesTitle}>Catégorisation des dépenses</Text>
              {categorizedExpenses.map((category) => (
                <View key={category.category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <MaterialCommunityIcons 
                      name={category.icon as any} 
                      size={24} 
                      color={category.color} 
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryAmount}>
                    <Text style={styles.categoryValue}>{category.amount.toFixed(2)}€</Text>
                    <Text style={styles.categoryPercentage}>
                      {((category.amount / totalMonthly) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Surface>

          <Surface style={styles.budgetCard} elevation={3}>
            <View style={styles.budgetCardContent}>
              <Text style={styles.budgetTitle}>Objectif budgétaire mensuel</Text>
              <View style={styles.budgetProgressContainer}>
                <View style={styles.budgetProgressBar}>
                  <View 
                    style={[
                      styles.budgetProgressFill,
                      { width: `${Math.min(progress, 100)}%` }
                    ]} 
                  />
                </View>
                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetCurrent}>{totalMonthly.toFixed(2)}€</Text>
                  <Text style={styles.budgetGoal}>sur {budgetGoal}€</Text>
                </View>
              </View>
              <Text style={[
                styles.budgetStatus,
                { color: progress > 100 ? '#F24B37' : '#37F2A8' }
              ]}>
                {progress > 100 
                  ? `Dépassement de ${(progress - 100).toFixed(1)}%` 
                  : `${(100 - progress).toFixed(1)}% restants`}
              </Text>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#377AF2',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  statCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  chartCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  pieContainer: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  legendContainer: {
    flex: 1,
    backgroundColor: 'rgba(55, 122, 242, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(55, 122, 242, 0.2)',
    padding: 12,
    marginLeft: 16,
    alignSelf: 'center',
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  categoriesCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  categoriesCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    marginLeft: 12,
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  budgetCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  budgetCardContent: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  budgetProgressContainer: {
    marginBottom: 8,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    backgroundColor: '#377AF2',
    borderRadius: 4,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  budgetCurrent: {
    fontSize: 16,
    fontWeight: '500',
  },
  budgetGoal: {
    fontSize: 16,
    color: '#666',
  },
  budgetStatus: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default BudgetScreen; 