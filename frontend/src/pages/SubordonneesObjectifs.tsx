// src/pages/SubordonneesObjectifs.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  CircularProgress, Divider, Chip, LinearProgress, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';

interface Objectif {
  id: number;
  libelle: string;
  taux_avancement: number;
  statut: string;
  poids: number;
}

interface Agent {
  id: number;
  nom: string;
  prenom: string;
  fonction?: string;
  service_nom: string;
  email: string;
  objectifs: Objectif[];
}

const drawerWidth = 300;

const SubordonneesObjectifs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get(`/accounts/agent/${id}/details/`);
        setAgent(resp.data);
      } catch (error) {
        console.error('Erreur lors du chargement :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Chargement...</Typography>
      </Box>
    );

  if (!agent) return <Typography>Aucun agent trouvé.</Typography>;

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
        <Topbar title={`Objectifs de ${agent.prenom}`} handleDrawerToggle={handleDrawerToggle} />
        <Box sx={{ p: 3, mt: { xs: '56px', md: '64px' } }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Retour à mes subordonnés
          </Button>

          {/* --- Infos agent --- */}
          <Card sx={{ mb: 4, borderRadius: 3, p: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2' }}>{agent.prenom[0]}</Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  👤 {agent.nom} {agent.prenom}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>Fonction : {agent.fonction || 'Non renseignée'}</Typography>
                <Typography>Service : {agent.service_nom}</Typography>
                <Typography>Email : {agent.email}</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* --- Objectifs --- */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            🎯 Objectifs assignés
          </Typography>

          {agent.objectifs.length === 0 ? (
            <Typography color="text.secondary">Aucun objectif pour cet agent.</Typography>
          ) : (
            agent.objectifs.map((obj) => (
              <Card
                key={obj.id}
                onClick={() => navigate(`/objectifs-superieur/${obj.id}`)} // <-- lien vers ObjectifSubordonnees.tsx

                sx={{
                  mb: 2,
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {obj.libelle}
                </Typography>

                <Box sx={{ mt: 1, mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={obj.taux_avancement}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Taux d’avancement : {obj.taux_avancement}%
                  </Typography>
                </Box>

                <Chip
                  label={obj.statut}
                  sx={{
                    bgcolor:
                      obj.statut === 'valide'
                        ? '#4caf50'
                        : obj.statut === 'rejete'
                        ? '#e53935'
                        : '#fbc02d',
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 1,
                  }}
                />
                
              </Card>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SubordonneesObjectifs;
