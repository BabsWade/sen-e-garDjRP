// src/components/objectifs/ProposerObjectif.tsx
import React, { useState } from 'react';
import { createObjectif } from '../../api/objectifs';

const ProposerObjectif: React.FC = () => {
  const [libelle, setLibelle] = useState('');
  const [typeKpi, setTypeKpi] = useState('');
  const [cible, setCible] = useState('');
  const [poids, setPoids] = useState<number>(0);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createObjectif({ libelle, type_kpi: typeKpi, cible, poids, annee });
      alert('Objectif proposé avec succès');
      setLibelle('');
      setTypeKpi('');
      setCible('');
      setPoids(0);
    } catch (error) {
      console.error('Erreur lors de la création', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Proposer un Objectif</h3>
      <input placeholder="Libellé" value={libelle} onChange={e => setLibelle(e.target.value)} required />
      <select value={typeKpi} onChange={e => setTypeKpi(e.target.value)} required>
        <option value="">Type KPI</option>
        <option value="Quantitatif">Quantitatif</option>
        <option value="Qualitatif">Qualitatif</option>
        <option value="Délai">Délai</option>
      </select>
      <input placeholder="Cible" value={cible} onChange={e => setCible(e.target.value)} required />
      <input type="number" placeholder="Poids" value={poids} onChange={e => setPoids(Number(e.target.value))} required />
      <button type="submit">Soumettre</button>
    </form>
  );
};

export default ProposerObjectif;
