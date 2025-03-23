import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Subscription } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { deleteSubscription } from '../redux/slices/subscriptionSlice';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';

interface SubscriptionCardProps {
  subscription: Subscription;
  onRefresh: () => Promise<void>;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onRefresh }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  console.log('Rendu de SubscriptionCard:', {
    subscription,
    user: user?._id
  });

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
      await dispatch(deleteSubscription({ 
        subscriptionId: subscription._id, 
        userId: user._id 
      })).unwrap();
      
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Abonnement supprimé avec succès'
      });
      
      await onRefresh();
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      });
    }
  };

  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.subscriptionName}>{subscription.name}</Text>
          <Text style={styles.subscriptionPrice}>
            {subscription.price}€ / {subscription.billingCycle.toLowerCase() === 'monthly' || subscription.billingCycle === 'Mensuel' ? 'mois' : 'an'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <Icon name="close-circle" size={24} color="#666" />
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