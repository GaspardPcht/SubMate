import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Subscription } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { deleteSubscription } from '../redux/slices/subscriptionsSlice';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';

interface SubscriptionCardProps {
  subscription: Subscription;
  onRefresh: () => Promise<void>;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onRefresh }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  console.log('SubscriptionCard - subscription:', subscription);
  console.log('SubscriptionCard - nextBillingDate:', subscription.nextBillingDate);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    console.log('Date formatée:', formattedDate);
    return formattedDate;
  };

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
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={styles.letterIcon}>
              {subscription.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.subscriptionName}>{subscription.name}</Text>
            <Text style={styles.subscriptionPrice}>
              {subscription.price}€ / {subscription.billingCycle.toLowerCase() === 'monthly' || subscription.billingCycle === 'Mensuel' ? 'mois' : 'an'}
            </Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.renewalDate}>
            Renouvellement
          </Text>
          <Text style={[styles.renewalDateValue, { color: theme.colors.primary }]}>
            {formatDate(subscription.nextBillingDate)}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleDelete}
          style={[styles.deleteButton, { backgroundColor: '#ff4444' + '15' }]}
        >
          <Icon name="delete-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#666',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  renewalDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  renewalDateValue: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 12,
    alignSelf: 'center',
  },
  letterIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#377AF2',
  },
});

export default SubscriptionCard; 