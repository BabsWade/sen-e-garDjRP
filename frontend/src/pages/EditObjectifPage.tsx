// src/pages/EditObjectifPage.tsx
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

interface PeriodeOption {
  id: number;
  libelle_periode: string;
}

interface ObjectifData {
  libelle: string;
  type_kpi: string;
  cible: string;
  poids: string;
  periode: string;
}

const drawerWidth = 300;

const EditObjectifPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [objectif, setObjectif] = useState<ObjectifData>({
    libelle: '',
    type_kpi: '',
    cible: '',
    poids: '',
    periode: '',
  });

  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // récupérer l’objectif existant
        const resp = await api.get(`objectifs/${id}/`);
        const data = resp.data;
        setObjectif({
          libelle: data.libelle ?? '',
          type_kpi: data.type_kpi ?? '',
          cible: data.cible ?? '',
          poids: data.poids?.toString() ?? '',
          periode: data.periode?.toString() ?? '',
        });

        // récupérer les périodes disponibles pour le menu déroulant
        const respPeriodes = await api.get('/periodes/');
        setPeriodes(respPeriodes.data);
      } catch (error: any) {
        console.error('Erreur lors du chargement :', error);
        setErrorMessage('Impossible de charger les données de l’Objectif.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setObjectif((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await api.put(`objectifs/${id}/`, {
        libelle: objectif.libelle,
        type_kpi: objectif.type_kpi,
        cible: objectif.cible,
        poids: parseFloat(objectif.poids),
        periode: objectif.periode,
      });
      navigate('/objectifs');
    } catch (error: any) {
      console.error('Erreur lors de l’enregistrement :', error);
      if (error.response && error.response.data) {
        setErrorMessage(JSON.stringify(error.response.data));
      } else {
        setErrorMessage('Erreur inconnue lors de la mise à jour.');
      }
    }
  };

  if (loading) {
    return <p>Loading…</p>;
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
        <Topbar title="Modifier un Objectif" handleDrawerToggle={() => { }} />

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
              ✏️ Modifier un objectif
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

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Libellé */}
                <Grid item xs={12}>
                  <TextField
                    label="Libellé"
                    name="libelle"
                    fullWidth
                    required
                    value={objectif.libelle}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Type KPI & Cible */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Type KPI"
                    name="type_kpi"
                    fullWidth
                    required
                    select
                    value={objectif.type_kpi}
                    onChange={handleChange}
                  >
                    <MenuItem value="Quantitatif">Quantitatif</MenuItem>
                    <MenuItem value="Qualitatif">Qualitatif</MenuItem>
                    <MenuItem value="Délai">Délai</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Cible"
                    name="cible"
                    fullWidth
                    required
                    value={objectif.cible}
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>

                {/* Poids */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Poids"
                    name="poids"
                    fullWidth
                    required
                    value={objectif.poids}
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>

                {/* Période */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Période"
                    name="periode"
                    select
                    fullWidth
                    required
                    value={objectif.periode}
                    onChange={handleChange}
                  >
                    {periodes.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.libelle_periode}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Bouton centré */}
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
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Enregistrer les modifications'
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

export default EditObjectifPage;
