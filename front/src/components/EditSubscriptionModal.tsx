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
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (subscription) {
      setEditedSubscription({ ...subscription });
      setSelectedDate(new Date(subscription.nextBillingDate));
    } else {
      setSelectedDate(new Date());
    }
    setShowDatePicker(true);
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
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryText}>{category.name}</Text>
                  {editedSubscription.category === key && (
                    <IconButton
                      icon="check"
                      size={20}
                      iconColor={category.color}
                      style={styles.checkIcon}
                    />
                  )}
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
    maxHeight: '100%',
    position: 'absolute',
    bottom: 0,
  },
  categoryPickerContent: {
    maxHeight: '60%',
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemActive: {
    backgroundColor: '#377AF220',
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
  checkIcon: {
    margin: 0,
  },
  section: {
    marginBottom: 16,
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginTop: 8,
  },
  datePicker: {
    height: 150,
    width: '100%',
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