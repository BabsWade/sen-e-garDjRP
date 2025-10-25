import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

interface ObjectifOption {
  id: number;
  libelle: string;
}

interface RealisationData {
  description: string;
  taux_avancement: string;
  objectif: string;
}

const EditRealisationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [realisation, setRealisation] = useState<RealisationData>({
    description: '',
    taux_avancement: '',
    objectif: '',
  });
  const [objectifs, setObjectifs] = useState<ObjectifOption[]>([]);
  const [newPreuveFile, setNewPreuveFile] = useState<File | null>(null);
  const [existingPreuveUrl, setExistingPreuveUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get(`/realisations/${id}/`);
        const data = resp.data;

        setRealisation({
          description: data.description ?? '',
          taux_avancement: data.taux_avancement?.toString() ?? '',
          objectif: data.objectif?.id?.toString() ?? '',
        });

        if (data.preuve) {
          setExistingPreuveUrl(data.preuve);
        }

        const respObj = await api.get('/agent-objectifs/');
        setObjectifs(respObj.data);
      } catch (error: any) {
        console.error('Erreur chargement réalisation :', error);
        setErrorMessage('Impossible de charger la réalisation.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPreuveFile(e.target.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRealisation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('description', realisation.description);
      formData.append('taux_avancement', realisation.taux_avancement);
      formData.append('objectif', realisation.objectif);
      if (newPreuveFile) {
        formData.append('preuve', newPreuveFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      await api.put(`/realisations/${id}/`, formData, config);

      // Redirection : retour vers la page détail de l’objectif concerné
      navigate(`/objectifs/${realisation.objectif}`);
    } catch (error: any) {
      console.error('Erreur mise à jour réalisation :', error);
      if (error.response && error.response.data) {
        setErrorMessage(JSON.stringify(error.response.data));
      } else {
        setErrorMessage('Erreur inconnue lors de la mise à jour.');
      }
    }
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2em auto' }}>
      <h2>Modifier la Réalisation</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Objectif lié</label>
          <select
            name="objectif"
            value={realisation.objectif}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir un objectif --</option>
            {objectifs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.libelle}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '1em' }}>
          <label>Description</label>
          <textarea
            name="description"
            value={realisation.description}
            onChange={handleChange}
            required
            rows={4}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '1em' }}>
          <label>Preuve existante : </label>
          {existingPreuveUrl ? (
            <div>
              <a href={existingPreuveUrl} target="_blank" rel="noopener noreferrer">
                Voir la preuve actuelle
              </a>
            </div>
          ) : (
            <span>Aucune preuve fournie</span>
          )}
        </div>

        <div style={{ marginTop: '1em' }}>
          <label>Charger une nouvelle preuve (facultatif)</label>
          <input
            name="preuve"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png,.jpeg"
          />
        </div>

        <div style={{ marginTop: '2em' }}>
          <button type="submit" style={{ marginRight: '1em' }}>
            Enregistrer
          </button>
          <button type="button" onClick={() => navigate(`/objectifs/${realisation.objectif}`)}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRealisationPage;
