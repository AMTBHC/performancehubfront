import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // <--- Importa desde AuthContext.js

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};