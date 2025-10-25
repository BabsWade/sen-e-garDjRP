// src/pages/AutoEvaluation.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

const drawerWidth = 300;

interface Objectif {
  id: number;
  libelle: string;
  type_kpi: string;
  cible: string;
}

interface AutoEvalData {
  objectif: string;
  note: string;
  commentaire: string;
}

const AutoEvaluationPage: React.FC = () => {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<AutoEvalData>({
    objectif: '',
    note: '',
    commentaire: '',
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // --- Charger les objectifs validés ---
  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        const response = await api.get('/objectifs/');
        const objectifsValides = response.data.filter(
          (obj: any) => obj.statut === 'valide'
        );
        setObjectifs(objectifsValides);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des objectifs :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectifs();
  }, []);

  // --- Gestion du changement de champ ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- Soumission de l'auto-évaluation ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.objectif || !formData.note) {
      alert('Veuillez sélectionner un objectif et saisir votre note.');
      return;
    }

    try {
      const payload = {
        objectif: parseInt(formData.objectif, 10),
        note: parseFloat(formData.note),
        commentaire: formData.commentaire,
      };

      const response = await api.post('/autoevaluations/', payload);
      console.log('✅ Auto-évaluation soumise avec succès :', response.data);
      alert('Auto-évaluation soumise avec succès !');

      setFormData({ objectif: '', note: '', commentaire: '' });
    } catch (error: any) {
      console.error('❌ Erreur lors de la soumission :', error);
      if (error.response?.data?.detail || error.response?.data?.non_field_errors) {
        alert(error.response.data.detail || error.response.data.non_field_errors[0]);
      } else {
        alert('Erreur lors de la soumission de l’auto-évaluation.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar title="Auto-évaluation" handleDrawerToggle={handleDrawerToggle} />

        <Box sx={{ mt: { xs: '56px', md: '64px' }, p: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              maxWidth: 700,
              mx: 'auto',
              backgroundColor: '#fff',
            }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 3, color: '#0f172a', fontWeight: 'bold' }}
            >
              📝 Soumettre votre auto-évaluation
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="objectif-label">Objectif</InputLabel>
                    <Select
                      labelId="objectif-label"
                      name="objectif"
                      value={formData.objectif}
                      label="Objectif"
                      onChange={(e) =>
                        setFormData({ ...formData, objectif: e.target.value })
                      }
                    >
                      {objectifs.length > 0 ? (
                        objectifs.map((obj) => (
                          <MenuItem key={obj.id} value={obj.id}>
                            {obj.libelle}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>Aucun objectif validé</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Note / Taux d’atteinte (%)"
                    name="note"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    value={formData.note}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Commentaire / Justification"
                    name="commentaire"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Expliquez vos résultats, difficultés ou points forts..."
                    value={formData.commentaire}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SendIcon />}
                    sx={{
                      bgcolor: '#1976d2',
                      '&:hover': { bgcolor: '#115293' },
                      borderRadius: 2,
                    }}
                  >
                    Soumettre l’auto-évaluation
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

export default AutoEvaluationPage;
