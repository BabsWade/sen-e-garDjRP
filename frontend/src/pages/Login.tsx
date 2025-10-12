import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface UserResponse {
  role: string;
}

const Login: React.FC = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<TokenResponse>('http://localhost:8000/api/token/', {
        matricule,
        password,
      });

      // Stockage des tokens dans localStorage
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);

      // Vérification de la réponse du backend pour récupérer le rôle
      const userResp = await axios.get<UserResponse>('http://localhost:8000/api/accounts/me/', {
        headers: { Authorization: `Bearer ${response.data.access}` }
      });

      const role = userResp.data.role;
      console.log('Role:', role);  // Déboguer le rôle retourné par le backend

      // Rediriger en fonction du rôle
      if (role === 'AGENT') {
        navigate('/agent-dashboard');
      } else if (role === 'RESPONSABLE_N1') {
        navigate('/n1-dashboard');
      } else if (role === 'DRH') {
        navigate('/drh-dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        alert('Rôle inconnu');
      }
    } catch (error) {
      alert('Échec de connexion');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Connexion</h2>
      <input
        type="text"
        placeholder="Matricule"
        value={matricule}
        onChange={(e) => setMatricule(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default Login;
