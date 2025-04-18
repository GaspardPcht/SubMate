import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated, Platform, Text } from 'react-native';
import { Text as PaperText, Surface, useTheme, IconButton } from 'react-native-paper';
import StatCard from '../components/StatCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchSubscriptions } from '../redux/slices/subscriptionsSlice';
import { CategoryKey } from '../constants/categories';
import { RESPONSIVE, SPACING } from '../constants/dimensions';

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
  music: { name: 'Musique', icon: 'music', color: '#F24B37' },
  gaming: { name: 'Gaming', icon: 'gamepad-variant', color: '#37F2A8' },
  fitness: { name: 'Fitness', icon: 'dumbbell', color: '#F2B237' },
  insurance: { name: 'Assurance', icon: 'shield-check', color: '#9437F2' },
  education: { name: 'Éducation', icon: 'school', color: '#F237E7' },
  software: { name: 'Logiciels', icon: 'application', color: '#37E4F2' },
  utilities: { name: 'Services', icon: 'cog', color: '#8CF237' },
  other: { name: 'Autres', icon: 'dots-horizontal', color: '#666666' },
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
      music: 0,
      gaming: 0,
      fitness: 0,
      insurance: 0,
      education: 0,
      software: 0,
      utilities: 0,
      other: 0,
    };

    subscriptions.forEach(sub => {
      const monthlyPrice = sub.billingCycle === 'monthly' ? sub.price : sub.price / 12;
      categories[sub.category] += monthlyPrice;
    });

    // Filtrer et ne garder que les catégories avec des dépenses
    return Object.entries(categories)
      .filter(([_, value]) => value > 0) // Ne garde que les catégories avec des dépenses
      .map(([key, value]) => ({
        category: key as CategoryKey,
        amount: value,
        ...CATEGORIES[key as keyof typeof CATEGORIES],
      }))
      .sort((a, b) => b.amount - a.amount); // Trie par montant décroissant
  }, [subscriptions]);

  const renderStatCard = (title: string, value: string, icon: IconName) => (
    <StatCard title={title} value={value} icon={icon} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <PaperText style={styles.title}>Gestion du Budget</PaperText>
        
          </View>

          <View style={styles.statsContainer}>
            {renderStatCard(
              'Mensuel',
              `${totalMonthly.toFixed(2)}€`,
              'cash-multiple'
            )}
            {renderStatCard(
              'Annuel',
              `${yearlyTotal.toFixed(2)}€`,
              'calendar-check'
            )}
          </View>

          <Surface style={styles.chartCard} elevation={3}>
            <View style={styles.chartCardContent}>
              <PaperText style={styles.chartTitle}>Répartition des dépenses</PaperText>
              {subscriptions.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <MaterialCommunityIcons name="chart-pie" size={48} color={theme.colors.primary} />
                  <PaperText style={styles.emptyStateText}>Pas encore d'abonnements</PaperText>
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
              <PaperText style={styles.categoriesTitle}>Catégorisation des dépenses</PaperText>
              {categorizedExpenses.map((category) => (
                <View key={category.category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <MaterialCommunityIcons 
                      name={category.icon as any} 
                      size={24} 
                      color={category.color} 
                    />
                    <PaperText style={styles.categoryName}>{category.name}</PaperText>
                  </View>
                  <View style={styles.categoryAmount}>
                    <PaperText style={styles.categoryValue}>{category.amount.toFixed(2)}€</PaperText>
                    <PaperText style={styles.categoryPercentage}>
                      {((category.amount / totalMonthly) * 100).toFixed(1)}%
                    </PaperText>
                  </View>
                </View>
              ))}
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
  scrollViewContent: {
    paddingBottom: RESPONSIVE.tabBarHeight + RESPONSIVE.bottomSafeArea + SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
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