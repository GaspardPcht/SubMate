import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, Subscription } from '../types';
import { AlertNotificationRoot } from 'react-native-alert-notification';
type AddSubscriptionScreenProps = {
  navigation: BottomTabNavigationProp<MainTabParamList, 'Add'>;
};

const AddSubscriptionScreen: React.FC<AddSubscriptionScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);


  const handleDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNextBillingDate(selectedDate);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    const response = await fetch('http://localhost:3000/subs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, price, billingCycle }),
    });
    const data = await response.json();
    if (data.result) {
      navigation.navigate('Home');
    } else {
      <AlertNotificationRoot>
          title="Erreur"
          textBody={data.error}
          type="danger"
      </AlertNotificationRoot>
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Ajouter un abonnement</Text>

          <TextInput
            label="Nom de l'abonnement"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Prix"
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            style={styles.input}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Fréquence de facturation</Text>
          <SegmentedButtons
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
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
            {nextBillingDate.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={nextBillingDate}
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
            disabled={!name || !price}
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