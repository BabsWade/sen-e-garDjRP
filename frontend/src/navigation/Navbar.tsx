import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = () => {
    // Supprimer les tokens du localStorage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    // Rediriger vers la page de connexion
    navigate('/login');
  };

  // Récupération du rôle de l'utilisateur depuis le token (déjà stocké dans localStorage)
  const token = localStorage.getItem('access');
  let userRole = null;

  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      userRole = decodedToken.role;
    } catch (error) {
      console.error("Erreur de décodage du token", error);
    }
  }

  return (
    <nav>
      <ul>
        <li>
          <button onClick={() => navigate('/')}>Accueil</button>
        </li>
        {userRole === 'AGENT' && (
          <li>
            <button onClick={() => navigate('/agent-dashboard')}>Dashboard Agent</button>
          </li>
        )}
        {userRole === 'RESPONSABLE_N1' && (
          <li>
            <button onClick={() => navigate('/n1-dashboard')}>Dashboard N1</button>
          </li>
        )}
        {userRole === 'DRH' && (
          <li>
            <button onClick={() => navigate('/drh-dashboard')}>Dashboard DRH</button>
          </li>
        )}
        {userRole === 'ADMIN' && (
          <li>
            <button onClick={() => navigate('/admin-dashboard')}>Dashboard Admin</button>
          </li>
        )}
        <li>
          <button onClick={handleLogout}>Déconnexion</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
