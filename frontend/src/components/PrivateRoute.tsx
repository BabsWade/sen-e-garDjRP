import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ReactNode;
  roles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, roles }) => {
  const token = localStorage.getItem('access');  // Token JWT
  let userRole: string | null = null;
  let superieurHierarchique = false;

  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      userRole = decodedToken.role || null;
      superieurHierarchique = decodedToken.superieur_hierarchique || false;
    } catch (error) {
      console.error("Erreur de décodage du token", error);
    }
  }

  // Pas de token → login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Vérification : rôle autorisé OU supérieur hiérarchique
  if ((userRole === null || !roles.includes(userRole)) && !superieurHierarchique) {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export default PrivateRoute;
