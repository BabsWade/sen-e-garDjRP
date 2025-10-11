// src/components/SetPasswordForm.tsx
import React, { useState } from 'react';
import API from '../api';

interface SetPasswordFormProps {
  uid: string;
  token: string;
  onSuccess: () => void;
}

const SetPasswordForm: React.FC<SetPasswordFormProps> = ({ uid, token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await API.post('/accounts/set-password/', {
        uid,
        token,
        password,
        password2,
      });

      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Erreur lors de la définition du mot de passe.";
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Définir votre mot de passe</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <label>Confirmer mot de passe</label>
        <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
      </div>
      <button type="submit">Valider</button>
    </form>
  );
};

export default SetPasswordForm;
