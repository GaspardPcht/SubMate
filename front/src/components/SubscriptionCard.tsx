import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal } from 'react-native';
import { Card, Text, useTheme, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Subscription } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { deleteSubscription, updateSubscriptionDate } from '../redux/slices/subscriptionsSlice';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';

interface SubscriptionCardProps {
  subscription: Subscription;
  onRefresh: () => Promise<void>;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onRefresh }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const checkAndUpdateDate = async () => {
      const currentDate = new Date(subscription.nextBillingDate);
      const today = new Date();
      
      // Si la date de renouvellement est passée
      if (currentDate < today && user?._id) {
        try {
          await dispatch(updateSubscriptionDate({
            subscriptionId: subscription._id,
            userId: user._id,
            subscription: subscription
          })).unwrap();
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la date:', error);
        }
      }
    };

    checkAndUpdateDate();
  }, [subscription.nextBillingDate]);

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

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
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
    <>
      <Card style={styles.card} elevation={2}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftContent}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <Text style={styles.letterIcon}>
                {subscription.name ? subscription.name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.subscriptionName}>{subscription.name}</Text>
              <Text style={styles.subscriptionPrice}>
                {subscription.price}€ / {subscription.billingCycle === 'monthly' ? 'mois' : 'an'}
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
            onPress={handleDeletePress}
            style={[styles.deleteButton, { backgroundColor: '#ff4444' + '15' }]}
          >
            <Icon name="delete-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmation de suppression</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer l'abonnement "{subscription.name}" ?
            </Text>
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setShowDeleteModal(false)}
                style={styles.modalButton}
              >
                Annuler
              </Button>
              <Button 
                mode="contained" 
                onPress={handleConfirmDelete}
                style={[styles.modalButton, styles.deleteModalButton]}
                textColor="white"
              >
                Supprimer
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  deleteModalButton: {
    backgroundColor: '#ff4444',
  },
});

export default SubscriptionCard; 