import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:8000/api';
    
    const initAuth = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Recuperamos datos frescos, incluyendo el ROL desde Laravel
          const response = await axios.get('/user-data');
          setUser(response.data.user);
          setProjects(response.data.projects);
          
          // Intentamos recuperar el proyecto activo del storage o el primero
          const savedProj = localStorage.getItem('activeProject');
          if (savedProj) {
            const parsed = JSON.parse(savedProj);
            // Verificamos que el proyecto guardado aún esté en su lista
            const stillExists = response.data.projects.find(p => p.id === parsed.id);
            setActiveProject(stillExists || response.data.projects[0]);
          } else if (response.data.projects.length > 0) {
            setActiveProject(response.data.projects[0]);
          }
        } catch (error) {
          console.error("Sesión inválida");
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
      const { token, user, projects } = response.data;
      
      // El objeto 'user' ya debe traer el campo 'role' desde Laravel
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setProjects(projects);
      
      if (projects && projects.length > 0) {
        const firstProj = projects[0];
        setActiveProject(firstProj);
        localStorage.setItem('activeProject', JSON.stringify(firstProj));
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  const logout = () => {
    // Si hay token, avisamos al servidor (sin esperar respuesta)
    if (token) {
      axios.post('/logout').catch(() => {});
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('activeProject');
    setToken(null);
    setUser(null);
    setProjects([]);
    setActiveProject(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Función para cambiar de proyecto y que persista al refrescar
  const handleSetActiveProject = (project) => {
    setActiveProject(project);
    localStorage.setItem('activeProject', JSON.stringify(project));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      projects, 
      activeProject, 
      setActiveProject: handleSetActiveProject, // Usamos la versión con persistencia
      login, 
      logout, 
      loading,
      isAdmin: user?.role === 'admin' // Helper rápido para check de rol
    }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export default AuthProvider;