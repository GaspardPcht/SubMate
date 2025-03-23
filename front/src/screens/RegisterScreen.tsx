import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Image } from 'react-native';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { registerUser, clearError } from '../redux/slices/authSlice';
import CustomInput from '../components/CustomInput';
import { TextInput } from 'react-native-paper';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Regex plus stricte pour valider l'email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    if (user) {
      navigation.replace('MainTabs');
    }
  }, [user, navigation]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: error
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('L\'email est requis');
      setIsEmailValid(false);
      return false;
    }
    if (!email.includes('@')) {
      setEmailError('L\'email doit contenir un @');
      setIsEmailValid(false);
      return false;
    }
    if (!email.includes('.')) {
      setEmailError('L\'email doit contenir un point (.)');
      setIsEmailValid(false);
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Veuillez entrer une adresse email valide');
      setIsEmailValid(false);
      return false;
    }
    setEmailError('');
    setIsEmailValid(true);
    return true;
  };

  const handleRegister = async () => {
    if (!firstname || !lastname || !password) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Veuillez remplir tous les champs'
      });
      return;
    }

    if (!isEmailValid) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Veuillez entrer une adresse email valide'
      });
      return;
    }

    dispatch(registerUser({ firstname, lastname, email, password }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <Image source={require('../../assets/Logo/SubMate_logo.png')} style={styles.logo} />
            <Text style={styles.subtitle}>Rejoignez SubMate pour gérer vos abonnements</Text>

            <View style={styles.formContainer}>
              <CustomInput
                label="Prénom"
                value={firstname}
                onChangeText={setFirstname}
                placeholder="Entrez votre prénom"
                right={<TextInput.Icon icon="account" color="#377AF2" />}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
              />

              <CustomInput
                label="Nom"
                value={lastname}
                onChangeText={setLastname}
                placeholder="Entrez votre nom"
                right={<TextInput.Icon icon="account" color="#377AF2" />}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
              />

              <CustomInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                }}
                placeholder="Entrez votre email"
                keyboardType="email-address"
                error={!!emailError}
                right={<TextInput.Icon icon="email" color="#377AF2" />}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <CustomInput
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="Entrez votre mot de passe"
                secureTextEntry
                right={<TextInput.Icon icon="lock" color="#377AF2" />}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.button}
                loading={loading}
                disabled={!isEmailValid || !firstname || !lastname || !password}
              >
                S'inscrire
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.button}
              >
                Déjà un compte ? Se connecter
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 4,
  },
  button: {
    marginTop: 10,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
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

export default RegisterScreen; 