import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { Button, Text, useTheme, IconButton, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateUser } from '../redux/slices/authSlice';
import CustomInput from '../components/CustomInput';
import { TextInput } from 'react-native-paper';

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [firstname, setFirstname] = useState(user?.firstname || '');
  const [lastname, setLastname] = useState(user?.lastname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

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

  const handleUpdate = async () => {
    if (!firstname || !lastname || !email) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    if (password && password !== confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Les mots de passe ne correspondent pas'
      });
      return;
    }

    if (!user?._id) return;

    try {
      await dispatch(updateUser({
        userId: user._id,
        firstname,
        lastname,
        email,
        ...(password && { password })
      })).unwrap();

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Profil mis à jour avec succès'
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: 'Une erreur est survenue lors de la mise à jour du profil'
      });
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
        <Text style={styles.title}>Modifier le profil</Text>
      </Surface>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
              onChangeText={setEmail}
              placeholder="Entrez votre email"
              keyboardType="email-address"
              right={<TextInput.Icon icon="email" color="#377AF2" />}
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
            />

            <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
            <Text style={styles.sectionSubtitle}>Laissez vide pour ne pas modifier</Text>

            <CustomInput
              label="Nouveau mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Entrez votre nouveau mot de passe"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  color="#377AF2"
                />
              }
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
            />

            <CustomInput
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez votre nouveau mot de passe"
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  color="#377AF2"
                />
              }
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
            />

            <Button
              mode="contained"
              onPress={handleUpdate}
              style={styles.button}
              loading={loading}
            >
              Enregistrer les modifications
            </Button>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#377AF2',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#377AF2',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});

export default EditProfileScreen; 