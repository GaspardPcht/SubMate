import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Subscription } from '../types';
import { removeSubscription } from '../store/subscriptionStore';

interface SubscriptionCardProps {
  subscription: Subscription;
  onRefresh: () => Promise<void>;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onRefresh }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/subs/delete/${subscription._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: subscription.userId }),
      });

      const data = await response.json();
      if (data.result) {
        removeSubscription(subscription._id);
        onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.subscriptionName}>{subscription.name}</Text>
          <Text style={styles.subscriptionPrice}>
            {subscription.price}€ / {subscription.billingCycle === 'monthly' ? 'mois' : 'an'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
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