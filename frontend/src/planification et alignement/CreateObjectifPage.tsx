// src/pages/CreateObjectifPage.tsx

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';

interface PeriodeOption {
  id: number;
  libelle_periode: string;
  date_debut: string;
  date_fin: string;
}

interface IndicateurOption {
  id: number;
  libelle: string;
  code: string;
}

const CreateObjectifPage: React.FC = () => {
  const [libelle, setLibelle] = useState('');
  const [typeKpi, setTypeKpi] = useState('');
  const [cible, setCible] = useState('');
  const [poids, setPoids] = useState('');
  const [periode, setPeriode] = useState('');
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);

  const [indicateurs, setIndicateurs] = useState<IndicateurOption[]>([]);
  const [indicateur, setIndicateur] = useState<string>('');  // id de l’indicateur sélectionné

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPeriodes = async () => {
      try {
        const response = await api.get('/periodes/');
        setPeriodes(response.data);
      } catch (error) {
        console.error('Erreur chargement périodes', error);
      }
    };

    const fetchIndicateurs = async () => {
      try {
        const resp = await api.get('/indicateurs/');
        console.log('Indicateurs reçus:', resp.data);
        setIndicateurs(resp.data);
      } catch (error) {
        console.error('Erreur chargement indicateurs', error);
      }
    };

    fetchPeriodes();
    fetchIndicateurs();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // validation simple côté front (facultative)
    if (!libelle || !typeKpi || !cible || !poids || !periode) {
      alert('Veuillez remplir les champs requis.');
      return;
    }

    const payload: any = {
      libelle,
      type_kpi: typeKpi,
      cible,
      poids: parseFloat(poids),
      periode,
    };
    if (indicateur) {
      payload.indicateur = indicateur;
    }

    try {
      // tu peux ajouter “/” devant ’objectifs/’ selon la config de api
      await api.post('objectifs/', payload);
      navigate('/objectifs');
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.error('Erreur backend détaillée :', error.response.data);
        alert("Erreur : " + JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Erreur inconnue :', error);
        alert("Une erreur est survenue.");
      }
    }
  };

  return (
    <div>
         <Sidebar />
      <h2>Créer un Objectif</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Libellé</label>
          <input
            name="libelle"
            type="text"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Type KPI</label>
          <select
            name="type_kpi"
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
            name="cible"
            type="text"
            value={cible}
            onChange={(e) => setCible(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Poids (%)</label>
          <input
            name="poids"
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
            name="periode"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            required
          >
            <option value="">-- Choisir une période --</option>
            {periodes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.libelle_periode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Indicateur stratégique</label>
          <select
            name="indicateur"
            value={indicateur}
            onChange={(e) => setIndicateur(e.target.value)}
          >
            <option value="">-- Aucun indicateur --</option>
            {indicateurs.map((ind) => (
              <option key={ind.id} value={ind.id.toString()}>
                {ind.libelle}
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
