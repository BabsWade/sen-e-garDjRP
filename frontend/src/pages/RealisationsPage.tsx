// src/pages/RealisationsPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../api';

// Assurez-vous d'ajouter 'id' à l'interface
interface Realisation {
  id: number; // Ajout du champ 'id' pour TypeScript
  description: string;
  taux_avancement: number;
  feedback: string;
}

const RealisationsPage = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRealisations = async () => {
      try {
        const response = await api.get('realisations/');
        setRealisations(response.data);
      } catch (error) {
        console.error('Error fetching realisations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealisations();
  }, []);

  const submitFeedback = async (realisationId: number, feedback: string) => {
    try {
      await api.post(`realisations/${realisationId}/feedback`, { feedback });
      alert('Feedback soumis avec succès');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div>
      <h1>Mes Réalisations</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {realisations.map((realisation, index) => (
            <li key={index}>
              <strong>{realisation.description}</strong><br />
              Avancement: {realisation.taux_avancement}% <br />
              Feedback: {realisation.feedback} <br />
              <button onClick={() => submitFeedback(realisation.id, 'Bien fait')}>Soumettre Feedback</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RealisationsPage;
