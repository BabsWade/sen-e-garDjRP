// AdminDashboard.tsx (ou tout autre composant de Dashboard)
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    // Rediriger l'utilisateur vers la page de login
    navigate('/login');
  };

  return (
    <div>
      <h2>Dashboard Admin</h2>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
};

export default AdminDashboard;
