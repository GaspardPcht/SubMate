import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types';
import { useStore } from '@nanostores/react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { $user } from '../store/userStore';


type AddScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Add'>;
};

const AddScreen: React.FC<AddScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useStore($user);

  const handleSubmit = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    const response = await fetch('http://localhost:3000/subs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        price: parseFloat(price),
        billingCycle,
        nextBillingDate: nextBillingDate.toISOString(),
        userId: user._id
      }),
    });

    const data = await response.json();
    if (data.result) {
      navigation.navigate('Home');
    }
    setLoading(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNextBillingDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Ajouter un abonnement</Text>

        <TextInput
          label="Nom"
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
          keyboardType="numeric"
        />

        <View style={styles.billingCycleContainer}>
          <Text style={styles.label}>Cycle de facturation</Text>
          <View style={styles.billingCycleButtons}>
            <Button
              mode={billingCycle === 'monthly' ? 'contained' : 'outlined'}
              onPress={() => setBillingCycle('monthly')}
              style={styles.billingCycleButton}
            >
              Mensuel
            </Button>
            <Button
              mode={billingCycle === 'yearly' ? 'contained' : 'outlined'}
              onPress={() => setBillingCycle('yearly')}
              style={styles.billingCycleButton}
            >
              Annuel
            </Button>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          Prochaine facturation : {nextBillingDate.toLocaleDateString()}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={nextBillingDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={loading}
          disabled={!name || !price || !user?._id}
        >
          Ajouter
        </Button>
      </ScrollView>
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
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  billingCycleContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  billingCycleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billingCycleButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    marginTop: 10,
  },
});

export default AddScreen; 