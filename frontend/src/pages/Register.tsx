// src/pages/Register.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    email2: '',
    role: 'AGENT', // Valeur par défaut
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email !== formData.email2) {
      alert("Les adresses email ne correspondent pas.");
      return;
    }

    try {
        await axios.post('http://localhost:8000/api/accounts/register/', formData);
        alert('Inscription réussie ! Vérifiez votre email pour activer votre compte.');
        navigate('/registration-success');
    } catch (error: any) {
        console.error('Erreur API:', error.response?.data);
        alert("Erreur lors de l'inscription : " + JSON.stringify(error.response?.data));
      }
      
      
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription</h2>

      <input
        type="text"
        name="matricule"
        placeholder="Matricule"
        value={formData.matricule}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="prenom"
        placeholder="Prénom"
        value={formData.prenom}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="nom"
        placeholder="Nom"
        value={formData.nom}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Adresse email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email2"
        placeholder="Confirmer votre email"
        value={formData.email2}
        onChange={handleChange}
        required
      />

      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="AGENT">Agent</option>
        <option value="RESPONSABLE_N1">Responsable N+1</option>
        <option value="DRH">DRH</option>
        <option value="ADMIN">Administrateur</option>
      </select>

      <button type="submit">S'inscrire</button>
    </form>
  );
};

export default Register;
