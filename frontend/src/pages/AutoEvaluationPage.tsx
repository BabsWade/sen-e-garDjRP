import React, { useState, useEffect } from 'react';
import api from '../api';

interface AutoEvaluation {
  objectif: string;
  commentaire: string;
  note: number;
}

const AutoEvaluationPage: React.FC = () => {
  const [objectifs, setObjectifs] = useState<{ id: number; libelle: string }[]>([]);
  const [autoEvaluation, setAutoEvaluation] = useState<AutoEvaluation>({
    objectif: '',
    commentaire: '',
    note: 0,
  });

  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        const response = await api.get('/objectifs/');
        setObjectifs(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des objectifs:', error);
      }
    };

    fetchObjectifs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAutoEvaluation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auto-evaluations/', autoEvaluation);
      console.log(response.data);
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'auto-évaluation:', error.response?.data || error.message);
    }
  };
  

  return (
    <div>
      <h1>Auto-évaluation</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="objectif">Objectif</label>
          <select
            id="objectif"
            name="objectif"
            value={autoEvaluation.objectif}
            onChange={handleChange}
          >
            <option value="">Sélectionner un objectif</option>
            {objectifs.map((objectif) => (
              <option key={objectif.id} value={objectif.id}>
                {objectif.libelle}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="commentaire">Commentaire</label>
          <textarea
            id="commentaire"
            name="commentaire"
            value={autoEvaluation.commentaire}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="note">Note</label>
          <input
            type="number"
            id="note"
            name="note"
            value={autoEvaluation.note}
            onChange={handleChange}
            min="0"
            max="5"
          />
        </div>
        <button type="submit">Soumettre</button>
      </form>
    </div>
  );
};

export default AutoEvaluationPage;
