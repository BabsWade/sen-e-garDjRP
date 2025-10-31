import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface PeriodeOption {
  id: number;
  libelle_periode: string;
  date_debut: string;
  date_fin: string;
  statut_periode: string;
}

interface IndicateurOption {
  id: number;
  libelle: string;
  code: string;
}

const drawerWidth = 300;

const CreateObjectifPage: React.FC = () => {
  const [libelle, setLibelle] = useState('');
  const [typeKpi, setTypeKpi] = useState('');
  const [cible, setCible] = useState('');
  const [poids, setPoids] = useState('');
  const [periode, setPeriode] = useState('');
  const [periodes, setPeriodes] = useState<PeriodeOption[]>([]);
  const [indicateurs, setIndicateurs] = useState<IndicateurOption[]>([]);
  const [indicateur, setIndicateur] = useState<string>(''); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPeriodes = async () => {
      try {
        const response = await api.get('/periodes/');
        const periodesEnCours = response.data.filter(
          (p: PeriodeOption) => p.statut_periode === 'en_cours'
        );
        setPeriodes(periodesEnCours);
      } catch (error) {
        console.error('Erreur chargement périodes', error);
      }
    };

    const fetchIndicateurs = async () => {
      try {
        const resp = await api.get('/indicateurs/');
        setIndicateurs(resp.data);
      } catch (error) {
        console.error('Erreur chargement indicateurs', error);
      }
    };

    fetchPeriodes();
    fetchIndicateurs();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!libelle || !typeKpi || !cible || !poids || !periode) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);

    const payload: any = {
      libelle,
      type_kpi: typeKpi,
      cible: parseFloat(cible),
      poids: parseFloat(poids),
      periode,
    };

    if (indicateur) payload.indicateur = indicateur;

    try {
      await api.post('/objectifs/', payload);
      alert('Objectif créé avec succès !');
      navigate('/objectifs');
    } catch (error: any) {
      console.error('Erreur création objectif :', error);
      if (error.response && error.response.data.periode) {
        alert(error.response.data.periode);
      } else {
        alert('Une erreur est survenue lors de la création de l’objectif.');
      }
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
        <Topbar title="Créer un Objectif" handleDrawerToggle={() => {}} />

        <Box sx={{ mt: { xs: '120px', md: '80px' }, p: { xs: 2, md: 4 } }}>
          <Paper
            elevation={3}
            sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, maxWidth: 800, mx: 'auto', backgroundColor: '#fff' }}
          >
            <Typography variant="h5" sx={{ mb: 4, color: '#0f172a', fontWeight: 'bold', textAlign: 'center' }}>
              📝 Créer un nouvel objectif
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Libellé"
                    fullWidth
                    required
                    value={libelle}
                    onChange={(e) => setLibelle(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Type KPI"
                    fullWidth
                    required
                    select
                    value={typeKpi}
                    onChange={(e) => setTypeKpi(e.target.value)}
                  >
                    <MenuItem value="Quantitatif">Quantitatif</MenuItem>
                    <MenuItem value="Qualitatif">Qualitatif</MenuItem>
                    <MenuItem value="Délai">Délai</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Cible"
                    fullWidth
                    required
                    type="number"
                    value={cible}
                    onChange={(e) => setCible(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Poids"
                    fullWidth
                    required
                    type="number"
                    value={poids}
                    onChange={(e) => setPoids(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Période"
                    name="periode"
                    select
                    fullWidth
                    required
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                  >
                    {periodes.length === 0 && (
                      <MenuItem value="">
                        <em>Aucune période en cours disponible</em>
                      </MenuItem>
                    )}
                    {periodes.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.libelle_periode}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Indicateur stratégique"
                    name="indicateur"
                    select
                    fullWidth
                    value={indicateur}
                    onChange={(e) => setIndicateur(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>-- Aucun indicateur --</em>
                    </MenuItem>
                    {indicateurs.map((ind) => (
                      <MenuItem key={ind.id} value={ind.id.toString()}>
                        {ind.libelle}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' }, borderRadius: 2, px: 4, py: 1 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Créer l’objectif'}
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

export default CreateObjectifPage;
