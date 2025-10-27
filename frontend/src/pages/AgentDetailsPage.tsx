import React, { useEffect, useState, FormEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarNplus1 from '../components/SidebarNplus1';

const drawerWidth = 300;

interface Agent {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;
  service: string;
}

interface Objectif {
  id: number;
  libelle: string;
  type_kpi: string;
  cible: number;
  poids: number;
  periode_label?: string;
}

interface Realisation {
  id: number;
  libelle: string;
  taux_realisation: number;
}

const AgentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    libelle: '',
    type_kpi: 'Quantitatif',
    cible: '',
    poids: ''
  });

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const resp = await api.get(`/agents-sous-responsable/${id}/`);
        setAgent(resp.data.agent);
        setObjectifs(resp.data.objectifs);
        setRealisations(resp.data.realisations);
      } catch (error) {
        console.error('Erreur chargement agent:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentDetails();
  }, [id]);

  const handleDeleteObjectif = async (objectifId: number) => {
    if (!window.confirm('Supprimer cet objectif ?')) return;
    try {
      await api.delete(`/agents-sous-responsable/${id}/objectifs/${objectifId}/`);
      setObjectifs((prev) => prev.filter((o) => o.id !== objectifId));
    } catch (error) {
      console.error('Erreur suppression objectif', error);
    }
  };

  const handleAddObjectif = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        libelle: form.libelle,
        type_kpi: form.type_kpi,
        cible: parseFloat(form.cible),
        poids: parseFloat(form.poids)
      };
      const resp = await api.post(`/agents-sous-responsable/${id}/assigner_objectif/`, payload);
      setObjectifs((prev) => [...prev, resp.data]);
      setOpenDialog(false);
    } catch (error) {
      console.error('Erreur ajout objectif', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!agent) {
    return <Typography align="center">Aucun agent trouvé.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <SidebarNplus1 mobileOpen={false} handleDrawerToggle={() => { }} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar title={`Profil de ${agent.prenom} ${agent.nom}`} handleDrawerToggle={() => { }} />

        <Box sx={{ mt: { xs: '120px', md: '80px' }, p: { xs: 2, md: 4 } }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 1100, mx: 'auto' }}>
            {/* --- Profil Agent --- */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              👤 Profil de l’agent
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><b>Matricule :</b> {agent.matricule}</Grid>
              <Grid item xs={6}><b>Fonction :</b> {agent.fonction}</Grid>
              <Grid item xs={6}><b>Service :</b> {agent.service}</Grid>
            </Grid>

            {/* --- Objectifs --- */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>🎯 Objectifs</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              sx={{ mb: 2, bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}
              onClick={() => setOpenDialog(true)}
            >
              Assigner un objectif
            </Button>

            {objectifs.length === 0 ? (
              <Typography>Aucun objectif trouvé.</Typography>
            ) : (
              objectifs.map((obj) => (
                <Paper
                  key={obj.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: '#f9fafb',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>{obj.libelle}</Typography>
                    <Typography variant="body2">Type : {obj.type_kpi} | Cible : {obj.cible} | Poids : {obj.poids}</Typography>
                  </Box>
                  <Box>
                    <IconButton color="primary"><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDeleteObjectif(obj.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))
            )}

            {/* --- Réalisations --- */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>📈 Réalisations</Typography>
            {realisations.length === 0 ? (
              <Typography>Aucune réalisation enregistrée.</Typography>
            ) : (
              realisations.map((r) => (
                <Paper key={r.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>{r.libelle}</Typography>
                  <Typography variant="body2">Taux de réalisation : {r.taux_realisation}%</Typography>
                </Paper>
              ))
            )}
          </Paper>
        </Box>
      </Box>

      {/* --- DIALOG AJOUT OBJECTIF --- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assigner un nouvel objectif</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddObjectif} sx={{ mt: 2 }}>
            <TextField
              label="Libellé"
              fullWidth
              required
              value={form.libelle}
              onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Type KPI"
              select
              fullWidth
              value={form.type_kpi}
              onChange={(e) => setForm({ ...form, type_kpi: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Quantitatif">Quantitatif</MenuItem>
              <MenuItem value="Qualitatif">Qualitatif</MenuItem>
              <MenuItem value="Délai">Délai</MenuItem>
            </TextField>
            <TextField
              label="Cible"
              type="number"
              fullWidth
              value={form.cible}
              onChange={(e) => setForm({ ...form, cible: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Poids"
              type="number"
              fullWidth
              value={form.poids}
              onChange={(e) => setForm({ ...form, poids: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleAddObjectif} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentDetailsPage;
