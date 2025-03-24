import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, Platform } from 'react-native';
import { Text, Surface, useTheme, IconButton, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { submitSupportRequest } from '../services/supportService';
import { useAppSelector } from '../redux/hooks';

type SupportScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Support'>;
};

type SupportType = 'bug' | 'feature' | 'other';

const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [supportType, setSupportType] = useState<SupportType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Veuillez remplir tous les champs'
      });
      return;
    }

    if (!user) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Vous devez être connecté pour envoyer une demande'
      });
      return;
    }

    try {
      setLoading(true);
      await submitSupportRequest({
        type: supportType,
        title: title.trim(),
        description: description.trim(),
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        }
      });

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Votre demande a été envoyée avec succès'
      });

      // Réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setSupportType('bug');
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Une erreur est survenue lors de l\'envoi de votre demande'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSupportTypeLabel = (type: SupportType) => {
    switch (type) {
      case 'bug':
        return 'Signaler un bug';
      case 'feature':
        return 'Proposer une fonctionnalité';
      case 'other':
        return 'Autre demande';
      default:
        return '';
    }
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
        <Text style={styles.title}>Aide et Support</Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <Surface style={styles.card} elevation={3}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Comment pouvons-nous vous aider ?</Text>
              
              <SegmentedButtons
                value={supportType}
                onValueChange={value => setSupportType(value as SupportType)}
                buttons={[
                  { value: 'bug', label: 'Bug', icon: 'bug' },
                  { value: 'feature', label: 'Fonctionnalité', icon: 'lightbulb' },
                  { value: 'other', label: 'Autre', icon: 'help-circle' },
                ]}
                style={styles.segmentedButtons}
              />

              <TextInput
                label="Titre"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                style={styles.input}
                placeholder="Donnez un titre à votre demande"
              />

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={6}
                style={styles.input}
                placeholder="Décrivez votre demande en détail..."
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                icon="send"
              >
                Envoyer
              </Button>
            </View>
          </Surface>

          <Surface style={styles.faqCard} elevation={3}>
            <View style={styles.faqContent}>
              <Text style={styles.faqTitle}>Questions fréquentes</Text>
              
      

              <View style={styles.faqItem}>
                <MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.primary} />
                <View style={styles.faqText}>
                  <Text style={styles.faqQuestion}>Comment activer les notifications ?</Text>
                  <Text style={styles.faqAnswer}>Allez dans les paramètres de votre profil pour activer les notifications.</Text>
                </View>
              </View>

              <View style={styles.faqItem}>
                <MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.primary} />
                <View style={styles.faqText}>
                  <Text style={styles.faqQuestion}>Comment supprimer un abonnement ?</Text>
                  <Text style={styles.faqAnswer}>Appuyez sur l'icône de suppression à droite de l'abonnement.</Text>
                </View>
              </View>

              <View style={styles.faqItem}>
                <MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.primary} />
                <View style={styles.faqText}>
                  <Text style={styles.faqQuestion}>Comment voir mes statistiques de dépenses ?</Text>
                  <Text style={styles.faqAnswer}>Accédez à l'onglet "Budget" dans la barre de navigation inférieure pour visualiser vos dépenses mensuelles et annuelles sous forme de graphiques.</Text>
                </View>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>
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
    padding: 16,
  },
  card: {
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#377AF2',
  },
  faqCard: {
    borderRadius: 12,
    backgroundColor: 'white',
  },
  faqContent: {
    padding: 16,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  faqText: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SupportScreen; 