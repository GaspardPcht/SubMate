import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstname: string;
  lastname: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/users/login', credentials);
    if (response.data.success) {
      console.log('Login successful, storing token:', response.data.token);
      await AsyncStorage.setItem('token', response.data.token);
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Token stored successfully:', storedToken);
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/users/register', data);
    if (response.data.success) {
      console.log('Register successful, storing token:', response.data.token);
      await AsyncStorage.setItem('token', response.data.token);
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Token stored successfully:', storedToken);
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    console.log('Logging out, removing token');
    await AsyncStorage.removeItem('token');
    const storedToken = await AsyncStorage.getItem('token');
    console.log('Token removed successfully:', storedToken);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Retrieved token:', token);
    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
}; 