import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../redux/hooks';
import { PieChart } from 'react-native-chart-kit';

const BudgetScreen: React.FC = () => {
  const { subscriptions } = useAppSelector((state) => state.subscriptions);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gestion du Budget</Text>
        <Text style={styles.subtitle}>Total mensuel: {totalMonthly.toFixed(2)}€</Text>
        
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="price"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
            center={[10, 10]}
          />
        </View>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BudgetScreen; 