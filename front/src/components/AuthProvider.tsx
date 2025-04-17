import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { registerForPushNotifications } from '../services/notificationService';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  useEffect(() => {
    if (userId) {
      registerForPushNotifications(userId);
    }
  }, [userId]);

  return <>{children}</>;
};

export default AuthProvider;
