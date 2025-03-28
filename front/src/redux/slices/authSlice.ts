import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../types';
import { api } from '../../services/api';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: true,
  error: null,
};

export const restoreToken = createAsyncThunk('auth/restoreToken', async () => {
  console.log('Début de la restauration du token...');
  const token = await AsyncStorage.getItem('token');
  console.log('Token récupéré du stockage:', token);
  
  if (token) {
    try {
      console.log('Tentative de récupération des données utilisateur avec le token:', token);
      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Réponse de l\'API /users/me:', response.data);
      
      if (response.data.result) {
        console.log('Données utilisateur restaurées avec succès');
        return { token, user: response.data.user };
      }
    } catch (error) {
      console.error('Erreur lors de la restauration des données utilisateur:', error);
      await AsyncStorage.removeItem('token');
      return null;
    }
  } else {
    console.log('Aucun token trouvé dans le stockage');
  }
  return null;
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data.result) {
      console.log('Stockage du token après connexion:', response.data.token);
      await AsyncStorage.setItem('token', response.data.token);
      // Vérifier que le token a bien été stocké
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Token vérifié après stockage:', storedToken);
      
      // Dispatch le token et les données utilisateur dans le store
      const payload = { token: response.data.token, user: response.data.user };
      console.log('Dispatch des données dans le store:', payload);
      return payload;
    }
    throw new Error(response.data.error || 'Une erreur est survenue');
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ firstname, lastname, email, password }: { firstname: string; lastname: string; email: string; password: string }) => {
    const response = await api.post('/users/signup', { firstname, lastname, email, password });
    if (response.data.result) {
      console.log('Stockage du token après inscription:', response.data.token);
      await AsyncStorage.setItem('token', response.data.token);
      // Vérifier que le token a bien été stocké
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Token vérifié après stockage:', storedToken);
      
      // Dispatch le token et les données utilisateur dans le store
      const payload = { token: response.data.token, user: response.data.user };
      console.log('Dispatch des données dans le store:', payload);
      return payload;
    }
    throw new Error(response.data.error || 'Une erreur est survenue');
  }
);

export const updateUser = createAsyncThunk(
  'auth/update',
  async ({ userId, firstname, lastname, email, password }: { userId: string; firstname: string; lastname: string; email: string; password?: string }) => {
    const response = await api.put(`/users/update/${userId}`, { firstname, lastname, email, ...(password && { password }) });
    if (response.data.result) {
      return response.data.user;
    }
    throw new Error(response.data.error || 'Une erreur est survenue');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      AsyncStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreToken.pending, (state) => {
        console.log('Restauration du token en cours...');
        state.loading = true;
      })
      .addCase(restoreToken.fulfilled, (state, action) => {
        console.log('Restauration du token terminée:', action.payload);
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          console.log('État restauré avec succès:', { token: state.token, user: state.user });
        } else {
          state.token = null;
          state.user = null;
          console.log('Aucun état à restaurer');
        }
        state.loading = false;
      })
      .addCase(restoreToken.rejected, (state, action) => {
        console.error('Erreur lors de la restauration du token:', action.error);
        state.loading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Login fulfilled - Mise à jour du state:', action.payload);
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log('Register fulfilled - Mise à jour du state:', action.payload);
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 