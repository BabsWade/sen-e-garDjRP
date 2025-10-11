// src/pages/ActivationPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ActivationPage: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const [isValidLink, setIsValidLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  useEffect(() => {
    const verifyLink = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/accounts/activate/${uid}/${token}/`);
        if (res.data?.message === "Lien valide") {
          setIsValidLink(true);
        }
      } catch (err) {
        alert("Lien invalide ou expiré.");
      } finally {
        setLoading(false);
      }
    };
  
    verifyLink();
  }, [uid, token]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== password2) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/accounts/set-password/', {
        uid,
        token,
        password,
        password2
      });

      alert("Mot de passe défini avec succès ! Vous pouvez vous connecter.");
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la définition du mot de passe.");
    }
  };

  if (loading) return <p>Chargement...</p>;

  if (!isValidLink) return <p>Lien invalide ou expiré.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Définir un mot de passe</h2>
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        required
      />
      <button type="submit">Valider</button>
    </form>
  );
};

export default ActivationPage;
