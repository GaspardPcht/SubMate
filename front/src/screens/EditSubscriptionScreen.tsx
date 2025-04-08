import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton } from 'react-native-paper';
import { Subscription } from '../types';
import { BillingCycle } from '../types/subscription';
import { CATEGORIES } from '../constants/categories';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch } from '../redux/hooks';
import { updateSubscription } from '../redux/slices/subscriptionsSlice';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';

type EditSubscriptionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditSubscription'>;

interface EditSubscriptionScreenRouteParams {
  subscription: Subscription;
}

export const EditSubscriptionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<EditSubscriptionScreenNavigationProp>();
  const route = useRoute();
  const { subscription } = route.params as EditSubscriptionScreenRouteParams;
  const dispatch = useAppDispatch();

  const [editedSubscription, setEditedSubscription] = useState<Subscription | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (subscription) {
      setEditedSubscription({ ...subscription });
      setSelectedDate(new Date(subscription.nextBillingDate));
    }
  }, [subscription]);

  const handleSave = async () => {
    if (editedSubscription && selectedDate) {
      try {
        const updatedSubscription = {
          ...editedSubscription,
          nextBillingDate: selectedDate.toISOString()
        };
        
        await dispatch(updateSubscription({
          userId: editedSubscription.userId,
          subscription: updatedSubscription
        })).unwrap();

        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Succès',
          textBody: 'Abonnement mis à jour avec succès'
        });
        
        navigation.goBack();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erreur',
          textBody: 'Impossible de mettre à jour l\'abonnement'
        });
      }
    }
  };

  if (!editedSubscription) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={theme.colors.primary}
        />
        <Text style={styles.title}>Modifier l'abonnement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <TextInput
            label="Nom"
            value={editedSubscription.name}
            onChangeText={(text) => setEditedSubscription({ ...editedSubscription, name: text })}
            style={styles.input}
            mode="flat"
            theme={theme}
          />

          <TextInput
            label="Prix"
            value={editedSubscription.price.toString()}
            onChangeText={(text) => setEditedSubscription({ ...editedSubscription, price: parseFloat(text) || 0 })}
            keyboardType="numeric"
            style={styles.input}
            mode="flat"
            theme={theme}
            right={<TextInput.Affix text="€" />}
          />

          <Text style={styles.sectionTitle}>Catégorie</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            <View style={[styles.categoryDot, { backgroundColor: CATEGORIES[editedSubscription.category].color }]} />
            <Text style={styles.categoryText}>{CATEGORIES[editedSubscription.category].name}</Text>
            <IconButton
              icon="chevron-down"
              size={24}
              iconColor="#666"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <View style={styles.billingCycleContainer}>
            <Text style={styles.sectionTitle}>Cycle de facturation</Text>
            <View style={styles.cycleButtons}>
              <TouchableOpacity
                style={[
                  styles.cycleButton,
                  editedSubscription.billingCycle === 'monthly' && styles.cycleButtonActive
                ]}
                onPress={() => setEditedSubscription({ ...editedSubscription, billingCycle: 'monthly' })}
              >
                <Text style={[
                  styles.cycleButtonText,
                  editedSubscription.billingCycle === 'monthly' && styles.cycleButtonTextActive
                ]}>Mensuel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cycleButton,
                  editedSubscription.billingCycle === 'yearly' && styles.cycleButtonActive
                ]}
                onPress={() => setEditedSubscription({ ...editedSubscription, billingCycle: 'yearly' })}
              >
                <Text style={[
                  styles.cycleButtonText,
                  editedSubscription.billingCycle === 'yearly' && styles.cycleButtonTextActive
                ]}>Annuel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateInput}
          >
            <Text style={styles.sectionTitle}>Date de renouvellement</Text>
            <TextInput
              value={selectedDate ? selectedDate.toLocaleDateString('fr-FR') : ''}
              editable={false}
              style={styles.input}
              mode="flat"
              theme={theme}
              right={<TextInput.Icon icon="calendar" />}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setSelectedDate(date);
                }
              }}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Annuler
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSave}
          style={[styles.button, styles.saveButton]}
          labelStyle={styles.buttonLabel}
        >
          Enregistrer
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#377AF2',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  chevronIcon: {
    margin: 0,
  },
  dateInput: {
    marginBottom: 16,
  },
  billingCycleContainer: {
    marginBottom: 16,
  },
  cycleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cycleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cycleButtonActive: {
    backgroundColor: '#377AF2',
    borderColor: '#377AF2',
  },
  cycleButtonText: {
    fontSize: 16,
    color: '#666',
  },
  cycleButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#377AF2',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 