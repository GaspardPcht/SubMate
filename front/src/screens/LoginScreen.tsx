import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Image } from 'react-native';
import { AlertNotificationRoot, Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser, clearError } from '../redux/slices/authSlice';
import CustomInput from '../components/CustomInput';
import { TextInput } from 'react-native-paper';
import { requestPasswordReset } from '../services/authService';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: error
      });
      dispatch(clearError());
      setIsSubmitting(false);
    }
  }, [error, dispatch]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Veuillez remplir tous les champs'
      });
      return;
    }

    setIsSubmitting(true);
    dispatch(loginUser({ email, password }));
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Veuillez entrer votre email'
      });
      return;
    }

    try {
      const response = await requestPasswordReset(email);
      if (response.result) {
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Succès',
          textBody: response.message || 'Un email de réinitialisation a été envoyé à votre adresse'
        });
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
        textBody: 'Une erreur est survenue lors de l\'envoi de l\'email'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Image source={require('../../assets/Logo/SubMate_logo.png')} style={styles.logo} />
          <Text style={styles.subtitle}>Gérez vos abonnements facilement</Text>

          <View style={styles.formContainer}>
            <CustomInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Entrez votre email"
              keyboardType="email-address"
              right={<TextInput.Icon icon="email" color="#377AF2" />}
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
            />

            <CustomInput
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Entrez votre mot de passe"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  color="#377AF2"
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
            />

            <Button
              mode="text"
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
            >
              Mot de passe oublié ?
            </Button>

            <Button
              mode="contained"
              onPress={isSubmitting ? undefined : handleLogin}
              style={styles.button}
              loading={isSubmitting}
            >
              Se connecter
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.button}
            >
              Pas encore de compte ? S'inscrire
            </Button>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    marginTop: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default LoginScreen; 