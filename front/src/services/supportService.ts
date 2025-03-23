import { api } from './api';

export interface SupportRequest {
  type: 'bug' | 'feature' | 'other';
  title: string;
  description: string;
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

export const submitSupportRequest = async (request: SupportRequest) => {
  try {
    console.log('Envoi de la requête de support:', request);
    const response = await api.post('/api/support/submit', request);
    console.log('Réponse du serveur:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la requête de support:', error);
    throw error;
  }
}; 