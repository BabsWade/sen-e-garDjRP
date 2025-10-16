import React, { useEffect, useState } from 'react';
import api from '../api';

interface NoteFinale {
  note_finale: number;
  commentaire: string;
  date_valuation: string;
  date_soumission: string;
}

const ConsulterEvaluationPage: React.FC = () => {
  const [noteFinale, setNoteFinale] = useState<NoteFinale | null>(null);

  useEffect(() => {
    const fetchNoteFinale = async () => {
      try {
        const response = await api.get('/note-finales/');
        if (response.data && response.data.length > 0) {
          setNoteFinale(response.data[0]); // Supposons qu'il n'y a qu'une seule note finale par agent
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'évaluation finale:', error);
      }
    };

    fetchNoteFinale();
  }, []);

  if (!noteFinale) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Évaluation Finale</h1>
      <p><strong>Note Finale :</strong> {noteFinale.note_finale}</p>
      <p><strong>Commentaire :</strong> {noteFinale.commentaire}</p>
      <p><strong>Date de l'Évaluation :</strong> {new Date(noteFinale.date_valuation).toLocaleDateString()}</p>
      <p><strong>Date de Soumission :</strong> {new Date(noteFinale.date_soumission).toLocaleDateString()}</p>
    </div>
  );
};

export default ConsulterEvaluationPage;
