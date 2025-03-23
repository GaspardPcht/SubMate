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
            <View style={styles.chartContent}>
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

          <Surface style={styles.subscriptionsCard} elevation={3}>
            <View style={styles.subscriptionsContent}>
              <Text style={styles.subscriptionsTitle}>Abonnements actifs</Text>
              {subscriptions.map((sub) => (
                <View key={sub._id} style={styles.subscriptionItem}>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionName}>{sub.name}</Text>
                    <Text style={styles.subscriptionPrice}>
                      {sub.billingCycle === 'monthly' ? `${sub.price}€/mois` : `${sub.price}€/an`}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={sub.billingCycle === 'monthly' ? 'calendar-month' : 'calendar' as IconName}
                    size={24}
                    color={theme.colors.primary}
                  />
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
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  statCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  chartContent: {
    padding: 16,
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
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  subscriptionsCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  subscriptionsContent: {
    padding: 16,
  },
  subscriptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  camenbert: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
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