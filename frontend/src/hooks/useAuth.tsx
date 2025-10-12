// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Vérifie si le token existe dans localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Optionnel : vérifier la validité du token
      setIsAuthenticated(true);
    }
  }, []);

  return isAuthenticated;
};
