import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addSubscription } from '../redux/slices/subscriptionSlice';

type AddSubscriptionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Add'>;
};

const initialState = {
  name: '',
  price: '',
  billingCycle: 'monthly' as 'monthly' | 'yearly',
  nextBillingDate: new Date(),
};

const AddSubscriptionScreen: React.FC<AddSubscriptionScreenProps> = ({ navigation }) => {
  const [formState, setFormState] = useState(initialState);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.subscriptions);

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormState(prev => ({ ...prev, nextBillingDate: selectedDate }));
    }
  };

  const resetForm = () => {
    setFormState(initialState);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!user?._id) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Vous devez être connecté pour ajouter un abonnement'
      });
      return;
    }

    try {
      await dispatch(addSubscription({
        name: formState.name,
        price: Number(formState.price),
        billingCycle: formState.billingCycle,
        nextBillingDate: formState.nextBillingDate.toISOString(),
        userId: user._id
      })).unwrap();

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Abonnement ajouté avec succès'
      });
      resetForm();
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout de l\'abonnement'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Ajouter un abonnement</Text>

          <TextInput
            label="Nom de l'abonnement"
            value={formState.name}
            onChangeText={(value) => setFormState(prev => ({ ...prev, name: value }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Prix"
            value={formState.price}
            onChangeText={(value) => setFormState(prev => ({ ...prev, price: value }))}
            mode="outlined"
            style={styles.input}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Fréquence de facturation</Text>
          <SegmentedButtons
            value={formState.billingCycle}
            onValueChange={(value) => setFormState(prev => ({ ...prev, billingCycle: value as 'monthly' | 'yearly' }))}
            buttons={[
              { value: 'monthly', label: 'Mensuel' },
              { value: 'yearly', label: 'Annuel' },
            ]}
            style={styles.segmentedButtons}
          />

          <Text style={styles.label}>Prochain paiement</Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            {formState.nextBillingDate.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={formState.nextBillingDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={loading}
            disabled={!formState.name || !formState.price}
          >
            Ajouter
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 15,
  },
  dateButton: {
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 10,
  },
});

export default AddSubscriptionScreen; 