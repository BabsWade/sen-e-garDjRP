// src/pages/RealisationsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';

interface Realisation {
  objectif_libelle: string;
  id: number;
  description: string;
  taux_avancement: number;
  preuve?: string;  // URL ou chemin du fichier
  est_valide: boolean;
  est_rejete: boolean;
  commentaire_rejet?: string;
  objectif: {
    id: number;
    libelle: string;
  };
}

const RealisationsPage: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRealisations = async () => {
      try {
        const response = await api.get('/realisations/');  // adapter le path
        setRealisations(response.data);
      } catch (error) {
        console.error('Erreur chargement réalisations :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealisations();
  }, []);

  return (
    <div>
        
      <h1>Mes Réalisations</h1>
      {loading ? (
        <p>Loading …</p>
      ) : (
        <ul>
          {realisations.map((r) => (
            <li key={r.id} style={{ border: '1px solid #ccc', margin: '1em', padding: '1em' }}>
              <strong>Objectif :</strong> {r.objectif_libelle ?? '—'}<br/>
              <strong>Description :</strong> {r.description} <br />
              <strong>Taux d’avancement :</strong> {r.taux_avancement}% <br />
              {r.preuve && (
                <div>
                  <strong>Preuve :</strong>{' '}
                  <a href={r.preuve} target="_blank" rel="noopener noreferrer">Voir le document</a>
                </div>
              )}
              <strong>Status :</strong>{' '}
              {r.est_valide
                ? 'Validée'
                : r.est_rejete
                ? `Rejetée (${r.commentaire_rejet})`
                : 'En attente de validation'}<br />
              {/* Si la réalisation est modifiable (pas validée ou rejetée), proposer un lien d’édition */}
              {!r.est_valide && !r.est_rejete && (
                <Link to={`/realisations/${r.id}/edit`}>
                  <button>Modifier</button>
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: '2em' }}>
        <Link to="/realisations/create">
          <button>Ajouter une Réalisation</button>
        </Link>
      </div>
    </div>
  );
};

export default RealisationsPage;
