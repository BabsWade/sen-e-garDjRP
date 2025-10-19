// src/pages/CreateRealisationPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';

interface ObjectifOption {
  id: number;
  libelle: string;
}

const CreateRealisationPage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [tauxAvancement, setTauxAvancement] = useState('');
  const [preuveFile, setPreuveFile] = useState<File | null>(null);
  const [objectifs, setObjectifs] = useState<ObjectifOption[]>([]);
  const [selectedObjectif, setSelectedObjectif] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        const resp = await api.get('/objectifs/');  // adapter le path
        setObjectifs(resp.data);
      } catch (error) {
        console.error('Erreur chargement objectifs pour réalisations :', error);
      }
    };
    fetchObjectifs();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPreuveFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('taux_avancement', tauxAvancement);
      formData.append('objectif', selectedObjectif);
      if (preuveFile) {
        formData.append('preuve', preuveFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      await api.post('/realisations/', formData, config);
      navigate('/realisations');
    } catch (error: any) {
      console.error('Erreur lors de la création de la réalisation :', error);
      if (error.response && error.response.data) {
        setErrorMessage(JSON.stringify(error.response.data));
      } else {
        setErrorMessage('Erreur inconnue lors de la création.');
      }
    }
  };

  return (
    <div>
           <Sidebar />
      <h2>Nouvelle Réalisation</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Objectif</label>
          <select
            name="objectif"
            value={selectedObjectif}
            onChange={(e) => setSelectedObjectif(e.target.value)}
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

        <div>
          <label>Description de la réalisation</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Taux d’avancement (%)</label>
          <input
            type="number"
            name="taux_avancement"
            value={tauxAvancement}
            onChange={(e) => setTauxAvancement(e.target.value)}
            min="0"
            max="100"
            step="1"
            required
          />
        </div>

        <div>
          <label>Preuve (document / fichier)</label>
          <input
            type="file"
            name="preuve"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png,.jpeg"
          />
        </div>

        <button type="submit">Soumettre Réalisation</button>
      </form>
    </div>
  );
};

export default CreateRealisationPage;