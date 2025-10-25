import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

const drawerWidth = 300;

interface ObjectifOption {
  id: number;
  libelle: string;
}

const CreateRealisationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const objectifParam = searchParams.get('objectif');

  const [objectifId, setObjectifId] = useState<string>(objectifParam || '');
  const [objectifs, setObjectifs] = useState<ObjectifOption[]>([]);
  const [description, setDescription] = useState<string>('');
  const [tauxAvancement, setTauxAvancement] = useState<number>(0);
  const [preuve, setPreuve] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        const resp = await api.get('/agent-objectifs/');
        setObjectifs(resp.data);
      } catch (error) {
        console.error('Erreur chargement objectifs :', error);
      }
    };
    fetchObjectifs();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!objectifId) {
      alert('Veuillez choisir un objectif.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('objectif', objectifId);
      formData.append('description', description);
      formData.append('taux_avancement', tauxAvancement.toString());
      if (preuve) formData.append('preuve', preuve);

      await api.post('/realisations/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Réalisation créée avec succès !');
      navigate(`/objectifs/${objectifId}`);
    } catch (error) {
      console.error('Erreur création réalisation :', error);
      alert('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Sidebar mobileOpen={false} handleDrawerToggle={() => {}} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar title="Ajouter une Réalisation" handleDrawerToggle={() => {}} />

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
              ➕ Ajouter une nouvelle réalisation
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Objectif */}
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Objectif"
                    fullWidth
                    required
                    value={objectifId}
                    onChange={(e) => setObjectifId(e.target.value)}
                    disabled={!!objectifParam}
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
                    fullWidth
                    multiline
                    minRows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>

                {/* Taux d’avancement */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Taux d’avancement (%)"
                    type="number"
                    fullWidth
                    required
                    value={tauxAvancement}
                    onChange={(e) =>
                      setTauxAvancement(Number(e.target.value))
                    }
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>

                {/* Preuve */}
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Joindre une preuve
                    <input
                      type="file"
                      hidden
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPreuve(e.target.files ? e.target.files[0] : null)
                      }
                    />
                  </Button>
                  {preuve && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      📎 {preuve.name}
                    </Typography>
                  )}
                </Grid>

                {/* Bouton */}
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#115293' },
                      borderRadius: 2,
                      px: 4,
                      py: 1,
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Ajouter la réalisation'
                    )}
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

export default CreateRealisationPage;
