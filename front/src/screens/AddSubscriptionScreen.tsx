import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, Platform, Pressable } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton, Surface, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addSubscription, fetchSubscriptions } from '../redux/slices/subscriptionsSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/categories';
import { CategoryKey } from '../constants/categories';

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
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [category, setCategory] = useState<CategoryKey>('other');
  const [showCategories, setShowCategories] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
        userId: user._id,
        category: category
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
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          mode="outlined"
          outlineStyle={{
            borderRadius: 10,
            borderWidth: 1,
            backgroundColor: 'white',
          }}
          outlineColor="#e0e0e0"
          activeOutlineColor="#377AF2"
          style={{
            backgroundColor: 'white',
            height: 40,
          }}
          contentStyle={{
            paddingHorizontal: 6,
            fontSize: 14,
          }}
          {...props}
        />
      </View>
    </Animated.View>
  );

  const toggleCategories = () => {
    setShowCategories(!showCategories);
    Animated.spring(slideAnim, {
      toValue: showCategories ? 0 : 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  const handleCategorySelect = (key: CategoryKey) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCategory(key);
    toggleCategories();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.header} elevation={0}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={theme.colors.primary}
        />
        <Text style={styles.title}>Nouvel abonnement</Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            <Pressable 
              onPress={toggleCategories}
              style={[
                styles.selectedCategory,
                showCategories && styles.selectedCategoryActive
              ]}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: CATEGORIES[category].color + '15' }]}>
                <MaterialCommunityIcons 
                  name={CATEGORIES[category].icon as any} 
                  size={20} 
                  color={CATEGORIES[category].color}
                />
              </View>
              <Text style={[
                styles.selectedCategoryText,
                showCategories && styles.selectedCategoryTextActive
              ]}>
                {CATEGORIES[category].name}
              </Text>
              <Animated.View style={{
                transform: [{
                  rotate: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg']
                  })
                }]
              }}>
                <MaterialCommunityIcons 
                  name="chevron-down" 
                  size={20} 
                  color="#666"
                />
              </Animated.View>
            </Pressable>
          </View>

          {showCategories && (
            <Animated.View 
              style={[
                styles.categoriesList,
                { 
                  opacity: slideAnim,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0]
                    })
                  }]
                }
              ]}
            >
              {Object.entries(CATEGORIES).map(([key, { name, icon, color }]) => (
                <Animated.View
                  key={key}
                  style={{ transform: [{ scale: scaleAnim }] }}
                >
                  <Pressable
                    onPress={() => handleCategorySelect(key as CategoryKey)}
                    style={[
                      styles.categoryItem,
                      category === key && styles.categoryItemSelected
                    ]}
                  >
                    <View style={[styles.categoryIconContainer, { backgroundColor: color + '15' }]}>
                      <MaterialCommunityIcons 
                        name={icon as any} 
                        size={20} 
                        color={color}
                      />
                    </View>
                    <Text style={[
                      styles.categoryItemText,
                      category === key && styles.categoryItemTextSelected
                    ]}>
                      {name}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {renderInput('Nom de l\'abonnement', formState.name, (value) => setFormState(prev => ({ ...prev, name: value })), {
            placeholder: 'Ex: Netflix, Spotify...',
            right: <TextInput.Icon icon="tag" color="#377AF2" />,
            style: { fontSize: 14 }
          })}
          
          {renderInput('Prix', formState.price, (value) => {
            const sanitizedValue = value.replace(/[^0-9,.]/g, '');
            const formattedValue = sanitizedValue.replace(/([,.])[^,.]*([,.])/g, '$1');
            setFormState(prev => ({ ...prev, price: formattedValue }));
          }, { 
            keyboardType: 'decimal-pad',
            right: <TextInput.Icon icon="currency-eur" color="#377AF2" />,
            style: { fontSize: 14 }
          })}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fréquence de facturation</Text>
            <View style={styles.billingCycleContainer}>
              <Pressable
                onPress={() => handleCycleChange('monthly')}
                style={[
                  styles.billingCycleButton,
                  formState.billingCycle === 'monthly' && styles.billingCycleButtonActive
                ]}
              >
                <MaterialCommunityIcons 
                  name="calendar-month" 
                  size={20} 
                  color={formState.billingCycle === 'monthly' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.billingCycleText,
                  formState.billingCycle === 'monthly' && styles.billingCycleTextActive
                ]}>
                  Mensuel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleCycleChange('yearly')}
                style={[
                  styles.billingCycleButton,
                  formState.billingCycle === 'yearly' && styles.billingCycleButtonActive
                ]}
              >
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={20} 
                  color={formState.billingCycle === 'yearly' ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.billingCycleText,
                  formState.billingCycle === 'yearly' && styles.billingCycleTextActive
                ]}>
                  Annuel
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prochain paiement</Text>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={formState.nextBillingDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            ) : (
              <>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                  <Text style={styles.dateButtonText}>
                    {formState.nextBillingDate.toLocaleDateString('fr-FR')}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={formState.nextBillingDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </>
            )}
          </View>
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
          Ajouter
        </Button>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    fontWeight: '600',
    marginLeft: 8,
    color: '#377AF2',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  inputIcon: {
    marginLeft: 4,
    color: '#377AF2',
  },
  billingCycleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  billingCycleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  billingCycleButtonActive: {
    backgroundColor: '#377AF2',
    borderColor: '#377AF2',
  },
  billingCycleText: {
    fontSize: 14,
    color: '#666',
  },
  billingCycleTextActive: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  submitButton: {
    borderRadius: 10,
    backgroundColor: '#377AF2',
    borderWidth: 0,
    marginBottom: 20,
    shadowColor: '#377AF2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonContent: {
    paddingVertical: 6,
  },
  submitButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 8,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCategoryActive: {
    borderColor: '#377AF2',
    backgroundColor: '#f8f9fa',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryTextActive: {
    color: '#377AF2',
    fontWeight: '500',
  },
  categoriesList: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  categoryItemSelected: {
    backgroundColor: 'rgba(55, 122, 242, 0.05)',
  },
  categoryItemText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  categoryItemTextSelected: {
    color: '#377AF2',
    fontWeight: '500',
  },
});

export default AddSubscriptionScreen; 