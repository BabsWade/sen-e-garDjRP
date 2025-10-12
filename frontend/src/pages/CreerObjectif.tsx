// src/pages/CreerObjectif.tsx
import React, { useState } from 'react';
import axios from 'axios';

const CreerObjectif = () => {
  const [libelle, setLibelle] = useState('');
  const [typeKpi, setTypeKpi] = useState('');
  const [cible, setCible] = useState('');
  const [poids, setPoids] = useState('');
  const [annee, setAnnee] = useState('');
  const [service, setService] = useState('');
  const [periode, setPeriode] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/objectifs/', {
        libelle,
        type_kpi: typeKpi,
        cible,
        poids,
        annee: parseInt(annee),
        service,
        periode,
      });
      console.log('Objectif créé', response.data);
    } catch (error) {
      console.error('Erreur lors de la création de l\'objectif', error);
    }
  };

  return (
    <div>
      <h1>Créer un Objectif</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Libelle</label>
          <input
            type="text"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
          />
        </div>
        <div>
          <label>Type KPI</label>
          <input
            type="text"
            value={typeKpi}
            onChange={(e) => setTypeKpi(e.target.value)}
          />
        </div>
        <div>
          <label>Cible</label>
          <input
            type="text"
            value={cible}
            onChange={(e) => setCible(e.target.value)}
          />
        </div>
        <div>
          <label>Poids</label>
          <input
            type="text"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
          />
        </div>
        <div>
          <label>Année</label>
          <input
            type="text"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
          />
        </div>
        <div>
          <label>Service</label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
        <div>
          <label>Période</label>
          <input
            type="text"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
          />
        </div>
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default CreerObjectif;
