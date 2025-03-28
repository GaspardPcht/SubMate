import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// URL de base de l'API
const BASE_URL = Constants.expoConfig?.extra?.apiUrl?.replace(/\/$/, '') || 'http://192.168.1.32:3001';

console.log('API Configuration:', {
  baseURL: BASE_URL,
  env: process.env.NODE_ENV,
  isDevelopment: __DEV__,
  apiUrl: Constants.expoConfig?.extra?.apiUrl
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log('Token from storage:', token); // Log du token récupéré
    console.log('Token from storage (iPhone):', token); // Log pour vérifier sur iPhone
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Ajouter le token dans le header Authorization
    }
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error); // Log des erreurs
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      baseURL: error.config?.baseURL,
      fullUrl: `${error.config?.baseURL}/${error.config?.url}`,
      headers: error.config?.headers,
    });
    
    if (error.response?.status === 401) {
      console.log('Token removed due to 401 error'); // Log de suppression du token
      await AsyncStorage.removeItem('token');
      // Rediriger vers la page de connexion
      // Note: La redirection devrait être gérée au niveau de l'application
    }
    return Promise.reject(error);
  }
);