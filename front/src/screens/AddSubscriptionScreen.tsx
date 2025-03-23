import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addSubscription, fetchSubscriptions } from '../redux/slices/subscriptionsSlice';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const calculateNextBillingDate = (selectedDate: Date, cycle: 'monthly' | 'yearly'): Date => {
    const nextDate = new Date(selectedDate);
    
    // Si la date sélectionnée est aujourd'hui ou dans le passé
    if (nextDate <= new Date()) {
      if (cycle === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }
    
    return nextDate;
  };

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    // Sur Android, on ferme toujours le picker après la sélection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    // Si l'utilisateur a annulé la sélection
    if (event.type === 'set' && selectedDate) {
      const nextBillingDate = calculateNextBillingDate(selectedDate, formState.billingCycle);
      setFormState(prev => ({ ...prev, nextBillingDate }));
    }
  };

  const handleCycleChange = (cycle: 'monthly' | 'yearly') => {
    const nextBillingDate = calculateNextBillingDate(formState.nextBillingDate, cycle);
    setFormState(prev => ({ ...prev, billingCycle: cycle, nextBillingDate }));
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
      // Convertir la virgule en point pour le prix
      const formattedPrice = formState.price.replace(',', '.');
      const numericPrice = parseFloat(formattedPrice);

      if (isNaN(numericPrice)) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erreur',
          textBody: 'Le prix doit être un nombre valide'
        });
        return;
      }

      const result = await dispatch(addSubscription({
        name: formState.name,
        price: numericPrice,
        billingCycle: formState.billingCycle,
        nextBillingDate: formState.nextBillingDate.toISOString(),
        userId: user._id
      })).unwrap();

      console.log('Abonnement ajouté avec succès:', result);

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Abonnement ajouté avec succès'
      });

      // Rafraîchir la liste des abonnements
      await dispatch(fetchSubscriptions(user._id));

      resetForm();
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'abonnement:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout de l\'abonnement'
      });
    }
  };

  const renderInput = (label: string, value: string, onChangeText: (text: string) => void, props = {}) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.inputOutline}
        theme={{
          colors: {
            primary: theme.colors.primary,
            onSurfaceVariant: '#666',
          },
        }}
        {...props}
      />
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
          {renderInput('Prix', formState.price, (value) => {
            const sanitizedValue = value.replace(/[^0-9,.]/g, '');
            const formattedValue = sanitizedValue.replace(/([,.])[^,.]*([,.])/g, '$1');
            setFormState(prev => ({ ...prev, price: formattedValue }));
          }, { 
            keyboardType: 'decimal-pad',
            right: <TextInput.Affix text="€" />
          })}

          <Surface style={styles.card} elevation={0}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Fréquence de facturation</Text>
              <View style={styles.billingCycleContainer}>
                <Button
                  mode={formState.billingCycle === 'monthly' ? 'contained' : 'outlined'}
                  onPress={() => handleCycleChange('monthly')}
                  style={[styles.billingCycleButton, formState.billingCycle === 'monthly' && styles.activeButton]}
                  icon="calendar-month"
                  labelStyle={styles.buttonLabel}
                >
                  Mensuel
                </Button>
                <Button
                  mode={formState.billingCycle === 'yearly' ? 'contained' : 'outlined'}
                  onPress={() => handleCycleChange('yearly')}
                  style={[styles.billingCycleButton, formState.billingCycle === 'yearly' && styles.activeButton]}
                  icon="calendar"
                  labelStyle={styles.buttonLabel}
                >
                  Annuel
                </Button>
              </View>
            </View>
          </Surface>

          <Surface style={styles.card} elevation={0}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Prochain paiement</Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {formState.nextBillingDate.toLocaleDateString('fr-FR')}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={formState.nextBillingDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </Surface>
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
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderRadius: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 0,
        shadowColor: 'transparent',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  cardContent: {
    padding: 16,
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
  dateButton: {
    marginBottom: 16,
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