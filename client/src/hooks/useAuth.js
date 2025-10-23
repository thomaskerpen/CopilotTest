import { useState, useEffect } from 'react';
import { authUtils } from '../utils/helpers';

export const useAuth = () => {
  const [token, setToken] = useState(() => authUtils.getToken() || '');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (newToken) => {
    setToken(newToken);
    authUtils.setToken(newToken);
  };

  const handleLogout = () => {
    setToken('');
    authUtils.logout();
  };

  const isAuthenticated = Boolean(token);

  return {
    token,
    isAuthenticated,
    showRegister,
    setShowRegister,
    handleLogin,
    handleLogout
  };
};