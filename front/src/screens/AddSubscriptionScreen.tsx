import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { TextInput, Button, Text, useTheme, Card, IconButton, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addSubscription } from '../redux/slices/subscriptionsSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const theme = useTheme();
  const [formState, setFormState] = useState(initialState);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.subscriptions);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date): void => {
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

  const renderInput = (label: string, value: string, onChangeText: (text: string) => void, props = {}) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Surface style={styles.inputSurface} elevation={2}>
        <TextInput
          label={label}
          value={value}
          onChangeText={onChangeText}
          mode="flat"
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          {...props}
        />
      </Surface>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header} elevation={0}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={theme.colors.primary}
        />
        <Text style={styles.title}>Ajouter un abonnement</Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {renderInput('Nom de l\'abonnement', formState.name, (value) => setFormState(prev => ({ ...prev, name: value })), {})}
          {renderInput('Prix', formState.price, (value) => setFormState(prev => ({ ...prev, price: value })), { keyboardType: 'decimal-pad' })}

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Fréquence de facturation</Text>
              <View style={styles.billingCycleContainer}>
                <Button
                  mode={formState.billingCycle === 'monthly' ? 'contained' : 'outlined'}
                  onPress={() => setFormState(prev => ({ ...prev, billingCycle: 'monthly' }))}
                  style={[styles.billingCycleButton, formState.billingCycle === 'monthly' && styles.activeButton]}
                  icon="calendar-month"
                  labelStyle={styles.buttonLabel}
                >
                  Mensuel
                </Button>
                <Button
                  mode={formState.billingCycle === 'yearly' ? 'contained' : 'outlined'}
                  onPress={() => setFormState(prev => ({ ...prev, billingCycle: 'yearly' }))}
                  style={[styles.billingCycleButton, formState.billingCycle === 'yearly' && styles.activeButton]}
                  icon="calendar-year"
                  labelStyle={styles.buttonLabel}
                >
                  Annuel
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Prochain paiement</Text>
              <DateTimePicker
                value={formState.nextBillingDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.datePicker}
              />
            </Card.Content>
          </Card>
        </Animated.View>
      </ScrollView>

      <Surface style={styles.bottomBar} elevation={0}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={!formState.name || !formState.price}
          icon="plus"
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}
        >
          Ajouter l'abonnement
        </Button>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#377AF2',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputSurface: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#377AF2',
  },
  billingCycleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  billingCycleButton: {
    flex: 1,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#377AF2',
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 16,
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: '#377AF2',
    borderWidth: 0,
    marginBottom: 30,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddSubscriptionScreen; 