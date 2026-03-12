import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthProvider from './context/AuthProvider'; // Asegúrate que la ruta sea correcta
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* El AuthProvider debe envolver a App para que todo el sistema tenga acceso al usuario y proyectos */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);