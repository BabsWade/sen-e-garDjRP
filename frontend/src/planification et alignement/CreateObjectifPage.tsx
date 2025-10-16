import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CreateObjectifPage = () => {
  const [libelle, setLibelle] = useState('');
  const [typeKpi, setTypeKpi] = useState('');
  const [cible, setCible] = useState('');
  const [poids, setPoids] = useState('');
  const [periode, setPeriode] = useState('');
  const [periodes, setPeriodes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // charger les périodes disponibles
    const fetchPeriodes = async () => {
      try {
        const response = await api.get('/periodes/');
        setPeriodes(response.data);
      } catch (error) {
        console.error('Erreur chargement périodes', error);
      }
    };

    fetchPeriodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('objectifs/', {
        libelle,
        type_kpi: typeKpi,
        cible,
        poids,
        periode, // correspond à l'ID de la période
        // l'agent et le service sont gérés automatiquement côté backend
      });
      navigate('/objectifs');
    } catch (error: any) {
        if (error.response && error.response.data) {
          console.error('Erreur backend détaillée :', error.response.data);
          alert("Erreur : " + JSON.stringify(error.response.data, null, 2));
        } else {
          console.error('Erreur inconnue :', error);
        }
      }
  };

  return (
    <div>
      <h2>Proposer un Objectif Individuel</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Libellé</label>
          <input
            type="text"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Type KPI</label>
          <select
            value={typeKpi}
            onChange={(e) => setTypeKpi(e.target.value)}
            required
          >
            <option value="">-- Choisir --</option>
            <option value="Quantitatif">Quantitatif</option>
            <option value="Qualitatif">Qualitatif</option>
            <option value="Délai">Délai</option>
          </select>
        </div>
        <div>
          <label>Cible</label>
          <input
            type="text"
            value={cible}
            onChange={(e) => setCible(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Poids (%)</label>
          <input
            type="number"
            step="0.01"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Période</label>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            required
          >
            <option value="">-- Choisir une période --</option>
            {periodes.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.nom || p.libelle || `Période ${p.id}`}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Soumettre à validation</button>
      </form>
    </div>
  );
};

export default CreateObjectifPage;
