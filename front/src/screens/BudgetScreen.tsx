import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchSubscriptions } from '../redux/slices/subscriptionSlice';

type BillingCycle = 'monthly' | 'yearly';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

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
    const monthlyData = subscriptions.map(sub => ({
      name: sub.name,
      price: sub.billingCycle === 'monthly' ? sub.price : sub.price / 12,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      legendFontColor: '#7F7F7F',
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
    <Card style={styles.statCard}>
      <Card.Content style={styles.statCardContent}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </Card.Content>
    </Card>
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

          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Répartition des dépenses</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={chartData}
                  width={Dimensions.get('window').width - 80}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    strokeWidth: 2,
                  }}
                  accessor="price"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  hasLegend={true}
                  center={[10, 10]}
                />
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.subscriptionsCard}>
            <Card.Content>
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
                    name={sub.billingCycle === 'monthly' ? 'calendar-month' : 'calendar-year' as IconName}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
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
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionsCard: {
    elevation: 2,
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
});

export default BudgetScreen; 