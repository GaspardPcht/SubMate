import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Subscription } from '../types';
import { removeSubscription } from '../store/subscriptionStore';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useStore } from '@nanostores/react';
import { $user } from '../store/userStore';

interface SubscriptionCardProps {
  subscription: Subscription;
  onRefresh: () => Promise<void>;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onRefresh }) => {
  const user = useStore($user);

  const handleDelete = async () => {
    if (!user?._id) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Vous devez être connecté pour supprimer un abonnement'
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/subs/delete/${subscription._id}/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.result) {
        removeSubscription(subscription._id);
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Succès',
          textBody: 'Abonnement supprimé avec succès'
        });
        await onRefresh();
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erreur',
          textBody: data.error || 'Erreur lors de la suppression'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Erreur lors de la suppression de l\'abonnement'
      });
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