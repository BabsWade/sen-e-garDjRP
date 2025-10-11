// src/pages/RegistrationSuccess.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const RegistrationSuccess: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>🎉 Inscription réussie !</h2>
      <p>Un lien d’activation a été envoyé à votre adresse e-mail.</p>
      <p>Veuillez cliquer sur ce lien dans les 30 minutes pour activer votre compte.</p>
      <p>Vous pourrez ensuite définir votre mot de passe et vous connecter.</p>
      <br />
      <Link to="/login">Retour à la page de connexion</Link>
    </div>
  );
};

export default RegistrationSuccess;
