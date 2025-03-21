import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Subscription {
  _id: string;
  name: string;
  price: number;
  billingCycle: string;
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onDelete }) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.subscriptionName}>{subscription.name}</Text>
          <Text style={styles.subscriptionPrice}>
            {subscription.price}€ / {subscription.billingCycle}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(subscription._id)}>
          <Icon name="close-circle" size={24} color="#000" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 15,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});

export default SubscriptionCard; 