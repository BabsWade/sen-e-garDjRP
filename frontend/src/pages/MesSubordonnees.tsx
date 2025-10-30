// src/pages/MesSubordonnees.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import SidebarNplus1 from '../components/SidebarNplus1';

interface Agent {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;
  service_nom: string;
  email: string;
}

const drawerWidth = 300;

const MesSubordonnees: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const resp = await api.get('/agents-sous-responsable/');
        setAgents(resp.data);
      } catch (err) {
        console.error('Erreur lors du chargement des subordonnés :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading)
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Chargement...</Typography>
      </Box>
    );
    

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
    <SidebarNplus1 mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: { md: `calc(100% - ${drawerWidth}px)` },
        backgroundColor: 'background.default',
      }}
    >
        <Topbar title="Mes subordonnés" handleDrawerToggle={handleDrawerToggle} />

        <Box sx={{ p: 3, mt: { xs: '56px', md: '64px' } }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            👥 Liste de mes subordonnés
          </Typography>

          {agents.length === 0 ? (
            <Typography color="text.secondary">
              Aucun subordonné trouvé.
            </Typography>
          ) : (
            agents.map((a) => (
              <Card
                key={a.id}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                      {a.prenom[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{a.nom} {a.prenom}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.fonction} — {a.service_nom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(`/mes-subordonnee/${a.id}`)}
                  >
                    Voir détails
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MesSubordonnees;