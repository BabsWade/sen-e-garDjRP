// src/pages/CreerObjectif.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

const drawerWidth = 300;

const CreerObjectif: React.FC = () => {
  const [formData, setFormData] = useState({
    libelle: '',
    type_kpi: '',
    cible: '',
    poids: '',
    annee: '',
    service: '',
    periode: '',
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/objectifs/', {
        ...formData,
        annee: parseInt(formData.annee, 10),
      });

      console.log('✅ Objectif créé avec succès :', response.data);
      alert('Objectif créé avec succès !');
    } catch (error) {
      console.error("❌ Erreur lors de la création :", error);
      alert("Erreur lors de la création de l'objectif.");
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* --- SIDEBAR --- */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

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
        <Topbar title="Créer un Objectif" handleDrawerToggle={handleDrawerToggle} />

        {/* --- CONTENU --- */}
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
              📝 Créer un nouvel objectif
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Libellé"
                    name="libelle"
                    fullWidth
                    required
                    value={formData.libelle}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Type KPI"
                    name="type_kpi"
                    fullWidth
                    required
                    value={formData.type_kpi}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Cible"
                    name="cible"
                    fullWidth
                    required
                    value={formData.cible}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Poids"
                    name="poids"
                    fullWidth
                    required
                    type="number"
                    value={formData.poids}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Année"
                    name="annee"
                    type="number"
                    fullWidth
                    required
                    value={formData.annee}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Service"
                    name="service"
                    fullWidth
                    required
                    value={formData.service}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Période"
                    name="periode"
                    fullWidth
                    required
                    value={formData.periode}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  mt: 3,
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#115293' },
                  borderRadius: 2,
                }}
              >
                Créer l’objectif
              </Button>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CreerObjectif;
