// src/pages/ObjectifsPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../api';

interface Objectif {
  libelle: string;
  type_kpi: string;
  cible: string;
  poids: string;
  annee: number;
  service: string;
  periode: string;
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ObjectifsPage;
