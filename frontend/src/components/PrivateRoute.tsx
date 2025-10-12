import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ReactNode;
  roles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, roles }) => {
  const token = localStorage.getItem('access');  // Récupérer le token depuis localStorage
  let userRole = null;

  // Si le token existe, on décode pour obtenir le rôle
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      userRole = decodedToken.role;
    } catch (error) {
      console.error("Erreur de décodage du token", error);
    }
  }

  // Si pas de token, rediriger vers /login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si le rôle de l'utilisateur n'est pas dans les rôles autorisés, rediriger vers la page d'accueil
  if (!roles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  // Si tout va bien, rendre l'élément demandé
  return <>{element}</>;
};

export default PrivateRoute;
