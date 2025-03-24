import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { AlertNotificationRoot, Toast, ALERT_TYPE } from 'react-native-alert-notification';
import CustomInput from '../components/CustomInput';
import { resetPassword } from '../services/authService';

type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: {
    params: {
      token: string;
    };
  };
};

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = route.params;

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Veuillez remplir tous les champs'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Les mots de passe ne correspondent pas'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword(token, newPassword);
      
      if (response.result) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Succès',
          textBody: 'Votre mot de passe a été réinitialisé avec succès'
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Erreur',
          textBody: response.error || 'Une erreur est survenue'
        });
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.title}>Réinitialisation du mot de passe</Text>
        <Text style={styles.subtitle}>Entrez votre nouveau mot de passe</Text>

        <CustomInput
          label="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Entrez votre nouveau mot de passe"
          secureTextEntry
        />

        <CustomInput
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirmez votre nouveau mot de passe"
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={handleResetPassword}
          style={styles.button}
          loading={loading}
        >
          Réinitialiser le mot de passe
        </Button>
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#377AF2',
  },
});

export default ResetPasswordScreen; 