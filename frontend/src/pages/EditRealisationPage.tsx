// src/pages/EditRealisationPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  MenuItem,
  CircularProgress,
  Link,
} from '@mui/material';
import { Edit as EditIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

interface ObjectifOption {
  id: number;
  libelle: string;
}

interface RealisationData {
  description: string;
  taux_avancement: string;
  objectif: string; // ID de l’objectif associé
}

const drawerWidth = 300;

const EditRealisationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ID de la réalisation à modifier
  const navigate = useNavigate();

  const [realisation, setRealisation] = useState<RealisationData>({
    description: '',
    taux_avancement: '',
    objectif: '',
  });

  const [objectifs, setObjectifs] = useState<ObjectifOption[]>([]);
  const [newPreuveFile, setNewPreuveFile] = useState<File | null>(null);
  const [existingPreuveUrl, setExistingPreuveUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Charger la réalisation + l’objectif associé ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Récupérer la réalisation à modifier
        const resp = await api.get(`/realisations/${id}/`);
        const data = resp.data;

        // 2️⃣ Récupérer automatiquement l'ID de l’objectif lié
        const objectifId = data.objectif?.id?.toString() ?? '';

        setRealisation({
          description: data.description ?? '',
          taux_avancement: data.taux_avancement?.toString() ?? '',
          objectif: objectifId,
        });

        if (data.preuve) setExistingPreuveUrl(data.preuve);

        // 3️⃣ Charger la liste des objectifs disponibles pour le menu déroulant
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

  // --- Gestion du changement dans le formulaire ---
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRealisation((prev) => ({ ...prev, [name]: value }));
  };

  // --- Gestion du fichier de preuve ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPreuveFile(e.target.files[0]);
    }
  };

  // --- Envoi du formulaire ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('description', realisation.description);
      formData.append('taux_avancement', realisation.taux_avancement);
      formData.append('objectif', realisation.objectif);
      if (newPreuveFile) formData.append('preuve', newPreuveFile);

      await api.put(`/realisations/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Redirection vers la page détail de l’objectif concerné
      navigate(`/objectifs/${realisation.objectif}`);
    } catch (error: any) {
      console.error('Erreur mise à jour réalisation :', error);
      if (error.response?.data) {
        setErrorMessage(JSON.stringify(error.response.data));
      } else {
        setErrorMessage('Erreur inconnue lors de la mise à jour.');
      }
    }
  };

  // --- Loader pendant le chargement initial ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* --- SIDEBAR --- */}
      <Sidebar mobileOpen={false} handleDrawerToggle={() => { }} />

      {/* --- CONTENU PRINCIPAL --- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* --- TOPBAR --- */}
        <Topbar title="Modifier une Réalisation" handleDrawerToggle={() => { }} />

        {/* --- FORMULAIRE --- */}
        <Box sx={{ mt: { xs: '120px', md: '80px' }, p: { xs: 2, md: 4 } }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              maxWidth: 800,
              mx: 'auto',
              backgroundColor: '#fff',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: '#0f172a',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              🛠️ Modifier une réalisation
            </Typography>

            {errorMessage && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mb: 2, textAlign: 'center' }}
              >
                {errorMessage}
              </Typography>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <Grid container spacing={3}>
                {/* Objectif lié */}
                <Grid item xs={12}>
                  <TextField
                    label="Objectif lié"
                    name="objectif"
                    select
                    fullWidth
                    required
                    value={realisation.objectif}
                    onChange={handleChange}
                  >
                    <MenuItem value="">-- Choisir un objectif --</MenuItem>
                    {objectifs.map((o) => (
                      <MenuItem key={o.id} value={o.id}>
                        {o.libelle}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={realisation.description}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Taux d'avancement */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Taux d’avancement (%)"
                    name="taux_avancement"
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    fullWidth
                    required
                    value={realisation.taux_avancement}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Preuve existante */}
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Preuve existante :
                  </Typography>
                  {existingPreuveUrl ? (
                    <Link
                      href={existingPreuveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      color="primary"
                    >
                      Voir la preuve actuelle
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune preuve fournie
                    </Typography>
                  )}
                </Grid>

                {/* Nouvelle preuve */}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                  >
                    Charger une nouvelle preuve
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.png,.jpeg"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {newPreuveFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Fichier sélectionné : {newPreuveFile.name}
                    </Typography>
                  )}
                </Grid>

                {/* Boutons */}
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#115293' },
                      borderRadius: 2,
                      px: 4,
                      py: 1,
                      mr: 2,
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate(`/objectifs/${realisation.objectif}`)}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1,
                    }}
                  >
                    Annuler
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default EditRealisationPage;
