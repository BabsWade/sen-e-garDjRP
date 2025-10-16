// src/pages/ContestationPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from '../api';

interface EvaluationOption {
  id: number;
  objectif: {
    libelle: string;
  };
  note: number;
  commentaire: string;
}

interface ContestationData {
  evaluation: string;
  commentaire: string;
}

const ContestationPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationOption[]>([]);
  const [formData, setFormData] = useState<ContestationData>({
    evaluation: '',
    commentaire: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        // On récupère les évaluations de l’agent connecté
        const resp = await api.get('/evaluations/');  // adapter le chemin si besoin
        setEvaluations(resp.data);
      } catch (error) {
        console.error('Erreur récupération évaluations :', error);
      }
    };
    fetchEvaluations();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.evaluation) {
      setErrorMessage('Veuillez sélectionner une évaluation à contester.');
      return;
    }
    if (!formData.commentaire.trim()) {
      setErrorMessage('Veuillez saisir un commentaire pour justifier la contestation.');
      return;
    }

    try {
      const resp = await api.post('/contestations/', {
        evaluation: formData.evaluation,
        commentaire: formData.commentaire,
      });
      setSuccessMessage('Contestation soumise avec succès.');
      // Optionnel : vider le formulaire ou rediriger
      setFormData({
        evaluation: '',
        commentaire: '',
      });
    } catch (error: any) {
      console.error('Erreur lors de la contestation :', error.response?.data || error.message);
      if (error.response && error.response.data) {
        setErrorMessage(JSON.stringify(error.response.data));
      } else {
        setErrorMessage('Erreur inconnue lors de la contestation.');
      }
    }
  };

  return (
    <div>
      <h2>Contester une Évaluation</h2>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Évaluation à contester</label>
          <select
            name="evaluation"
            value={formData.evaluation}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir une évaluation --</option>
            {evaluations.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {`Objectif: ${ev.objectif?.libelle || ''} — Note: ${ev.note}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Commentaire de contestation</label>
          <textarea
            name="commentaire"
            value={formData.commentaire}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Soumettre contestation</button>
      </form>
    </div>
  );
};

export default ContestationPage;
