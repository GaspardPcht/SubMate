import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Image } from 'react-native';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { signupUser, clearError } from '../redux/slices/authSlice';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

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

  const handleSignup = async () => {
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

    dispatch(signupUser({ firstname, lastname, email, password }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Image source={require('../../assets/Logo/SubMate_logo.png')} style={styles.logo} />
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Rejoignez SubMate pour gérer vos abonnements</Text>

            <TextInput
              label="Prénom"
              value={firstname}
              onChangeText={setFirstname}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Nom"
              value={lastname}
              onChangeText={setLastname}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              mode="outlined"
              style={[styles.input, emailError ? styles.inputError : null]}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TextInput
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <Button
              mode="contained"
              onPress={handleSignup}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#ff4444',
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
});

export default SignupScreen; 