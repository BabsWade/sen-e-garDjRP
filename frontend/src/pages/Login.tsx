import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Assure-toi de créer ce fichier
import loginBg from '../assets/13747.jpg';
import logo from '../assets/logo-senegar-bon.png';

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

      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);

      const userResp = await axios.get<UserResponse>('http://localhost:8000/api/accounts/me/', {
        headers: { Authorization: `Bearer ${response.data.access}` }
      });

      const role = userResp.data.role;
      if (role === 'AGENT') navigate('/agent-home');
      else if (role === 'RESPONSABLE_N1') navigate('/n1-dashboard');
      else if (role === 'DRH') navigate('/drh-dashboard');
      else if (role === 'ADMIN') navigate('/admin-dashboard');
      else alert('Rôle inconnu');
    } catch (error) {
      alert('Échec de connexion');
    }
  };

  return (
    <div className='principal'>
      <div className="login-container">
        <div className="login-left">
          <div className="logo">
            <img className="logo-senegar" src={logo} alt="E-GAR Logo" />
          </div>

          <h2>CONNEXION</h2>

          <form onSubmit={handleLogin} className="login-form">
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
            <div className="forgot-password-link">
              <a href="/changer-mot-de-passe">Mot de passe oublié ?</a>
            </div>

            <button type="submit">Se connecter</button>
          </form>
        </div>

        <div className="login-right">
          <div className="overlay-text">
            <h2>Plateforme de gestion et d’évaluation de la performance des agents publics dans une logique GAR</h2>
          </div>
          <img src={loginBg} alt="Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
