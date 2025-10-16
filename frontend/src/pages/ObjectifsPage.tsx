// src/pages/ObjectifsPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';  // ou juste Link

interface Objectif {
  est_valide: any;
  id: number;
  libelle: string;
  type_kpi: string;
  cible: string;
  poids: string;
  annee: number;
  service: string;
  periode: string;
  taux_avancement: number;

}

const ObjectifsPage = () => {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        const response = await api.get('objectifs/');
        setObjectifs(response.data);
      } catch (error) {
        console.error('Error fetching objectifs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectifs();
  }, []);

  return (
    <div>
      <h1>Mes Objectifs</h1>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/objectifs/create">
          <button>Créer un objectif</button>
        </Link>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
        {objectifs.map((objectif, index) => (
          <li key={index}>
            <strong>{objectif.libelle}</strong><br />
            KPI Type: {objectif.type_kpi} <br />
            Cible: {objectif.cible} <br />
            Poids: {objectif.poids} <br />
            Période: {objectif.periode} <br />
            Service: {objectif.service} <br />
            <strong>Taux d’avancement :</strong> {objectif.taux_avancement}% <br />
      
            {objectif.est_valide ? (
              <span style={{ fontWeight: 'bold', color: 'green' }}>Validé</span>
            ) : (
              <Link to={`/objectifs/${objectif.id}/edit`}>
                <button>Modifier</button>
              </Link>
            )}
          </li>
        ))}
      </ul>
      
      )}
    </div>
  );
};

export default ObjectifsPage;
