// src/pages/EditObjectifPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface PeriodeOption {
  id: number;
  libelle?: string;
  nom?: string;
  // selon ce que ton back renvoie pour les périodes
}

interface ObjectifData {
  libelle: string;
  type_kpi: string;
  cible: string;
  poids: string;
  periode: string;
  // tu peux ajouter d'autres champs si ton API les renvoie, ex : service, annee, etc.
}

const EditObjectifPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [objectif, setObjectif] = useState<ObjectifData>({
    libelle: '',
    type_kpi: '',
    cible: '',
    poids: '',
    periode: '',
  });

  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // récupérer l’objectif existant
        const resp = await api.get(`objectifs/${id}/`);
        const data = resp.data;
        setObjectif({
          libelle: data.libelle ?? '',
          type_kpi: data.type_kpi ?? '',
          cible: data.cible ?? '',
          poids: data.poids?.toString() ?? '',
          periode: data.periode?.toString() ?? '',
        });

        // récupérer les périodes disponibles pour le menu déroulant
        const respPeriodes = await api.get('/periodes/');
        setPeriodes(respPeriodes.data);
      } catch (error: any) {
        console.error('Erreur lors du chargement :', error);
        setErrorMessage('Impossible de charger les données de l’Objectif.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setObjectif((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await api.put(`objectifs/${id}/`, {
        libelle: objectif.libelle,
        type_kpi: objectif.type_kpi,
        cible: objectif.cible,
        poids: parseFloat(objectif.poids),
        periode: objectif.periode,
      });
      navigate('/objectifs');
    } catch (error: any) {
      console.error('Erreur lors de l’enregistrement :', error);
      if (error.response && error.response.data) {
        setErrorMessage(JSON.stringify(error.response.data));
      } else {
        setErrorMessage('Erreur inconnue lors de la mise à jour.');
      }
    }
  };

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h2>Modifier Objectif</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Libellé</label>
          <input
            type="text"
            name="libelle"
            value={objectif.libelle}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Type KPI</label>
          <select
            name="type_kpi"
            value={objectif.type_kpi}
            onChange={handleChange}
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
            name="cible"
            value={objectif.cible}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Poids (%)</label>
          <input
            type="number"
            step="0.01"
            name="poids"
            value={objectif.poids}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Période</label>
          <select
            name="periode"
            value={objectif.periode}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir une période --</option>
            {periodes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.libelle ?? p.nom ?? `Période ${p.id}`}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
};

export default EditObjectifPage;
