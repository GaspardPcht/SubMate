import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal as RNModal, Animated, Pressable } from 'react-native';
import { TextInput, Button, Text, useTheme, IconButton } from 'react-native-paper';
import { Subscription } from '../types';
import { BillingCycle } from '../types/subscription';
import { CATEGORIES } from '../constants/categories';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface EditSubscriptionModalProps {
  visible: boolean;
  subscription: Subscription | null;
  onDismiss: () => void;
  onSave: (subscription: Subscription) => void;
}

export const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  visible,
  subscription,
  onDismiss,
  onSave,
}) => {
  const theme = useTheme();
  const [editedSubscription, setEditedSubscription] = useState<Subscription | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [category, setCategory] = useState<keyof typeof CATEGORIES>(subscription?.category || 'other');
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (subscription) {
      setEditedSubscription({ ...subscription });
      setSelectedDate(new Date(subscription.nextBillingDate));
      setCategory(subscription.category);
    }
  }, [subscription]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setShowDatePicker(false);
    }
  }, [visible]);

  const handleSave = () => {
    if (editedSubscription && selectedDate) {
      onSave({
        ...editedSubscription,
        nextBillingDate: selectedDate.toISOString()
      });
      onDismiss();
    }
  };

  const handleCategorySelect = (key: keyof typeof CATEGORIES) => {
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
    if (editedSubscription) {
      setEditedSubscription({ ...editedSubscription, category: key });
    }
    setShowCategoryPicker(false);
  };

  if (!editedSubscription) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onDismiss}
        />
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Modifier l'abonnement</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              iconColor={theme.colors.primary}
            />
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

              <View style={styles.categorySection}>
                <Text style={styles.sectionTitle}>Catégorie</Text>
                <TouchableOpacity
                  style={[
                    styles.selectedCategory,
                    showCategoryPicker && styles.selectedCategoryActive
                  ]}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: CATEGORIES[editedSubscription.category].color + '15' }]}>
                    <MaterialCommunityIcons 
                      name={CATEGORIES[editedSubscription.category].icon as any} 
                      size={20} 
                      color={CATEGORIES[editedSubscription.category].color}
                    />
                  </View>
                  <Text style={[
                    styles.selectedCategoryText,
                    showCategoryPicker && styles.selectedCategoryTextActive
                  ]}>
                    {CATEGORIES[editedSubscription.category].name}
                  </Text>
                  <MaterialCommunityIcons 
                    name="chevron-down" 
                    size={20} 
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <RNModal
                visible={showCategoryPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCategoryPicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, styles.categoryPickerContent]}>
                    <View style={styles.header}>
                      <Text style={styles.title}>Choisir une catégorie</Text>
                      <IconButton
                        icon="close"
                        size={24}
                        onPress={() => setShowCategoryPicker(false)}
                        iconColor={theme.colors.primary}
                      />
                    </View>
                    <ScrollView style={styles.scrollView}>
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <TouchableOpacity
                          key={key}
                          style={[
                            styles.categoryItem,
                            editedSubscription.category === key && styles.categoryItemActive
                          ]}
                          onPress={() => {
                            setEditedSubscription({
                              ...editedSubscription,
                              category: key as keyof typeof CATEGORIES
                            });
                            setShowCategoryPicker(false);
                          }}
                        >
                          <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                            <MaterialCommunityIcons 
                              name={category.icon as any} 
                              size={20} 
                              color={category.color}
                            />
                          </View>
                          <Text style={[
                            styles.categoryItemText,
                            editedSubscription.category === key && styles.categoryItemTextActive
                          ]}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </RNModal>

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

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Date de renouvellement</Text>
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    style={styles.datePicker}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={onDismiss}
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
        </Animated.View>
      </View>

      <RNModal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.categoryPickerContent]}>
            <View style={styles.header}>
              <Text style={styles.title}>Choisir une catégorie</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowCategoryPicker(false)}
                iconColor={theme.colors.primary}
              />
            </View>
            <ScrollView style={styles.scrollView}>
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryItem,
                    editedSubscription.category === key && styles.categoryItemActive
                  ]}
                  onPress={() => {
                    setEditedSubscription({
                      ...editedSubscription,
                      category: key as keyof typeof CATEGORIES
                    });
                    setShowCategoryPicker(false);
                  }}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '15' }]}>
                    <MaterialCommunityIcons 
                      name={category.icon as any} 
                      size={20} 
                      color={category.color}
                    />
                  </View>
                  <Text style={[
                    styles.categoryItemText,
                    editedSubscription.category === key && styles.categoryItemTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </RNModal>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: '100%',
    maxHeight: '90%',
    position: 'absolute',
    bottom: 0,
  },
  categoryPickerContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#377AF2',
  },
  scrollView: {
    maxHeight: '90%',
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  categoryItemActive: {
    backgroundColor: 'rgba(55, 122, 242, 0.05)',
  },
  categoryItemText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  categoryItemTextActive: {
    color: '#377AF2',
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  datePickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: 'black',
  },
  datePicker: {
    height: 100,
    width: '100%',
    color: 'black'
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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