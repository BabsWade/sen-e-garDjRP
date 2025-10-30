import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Avatar,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';
import { useNavigate } from 'react-router-dom';
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

const AgentsSupervisesPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const resp = await api.get('/agents-sous-responsable/');
        setAgents(resp.data);
      } catch (error) {
        console.error('Erreur chargement agents supervisés :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const handleViewDetails = (id: number) => {
    navigate(`/agents/${id}`);
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
      {/* --- SIDEBAR --- */}
      <SidebarNplus1 mobileOpen={false} handleDrawerToggle={() => { }} />

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
        <Topbar title="Agents Supervisés" handleDrawerToggle={() => { }} />

        <Box sx={{ mt: { xs: '120px', md: '80px' }, p: { xs: 2, md: 4 } }}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              maxWidth: 1100,
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
              👥 Liste des Agents Supervisés
            </Typography>

            {agents.length === 0 ? (
              <Typography align="center">Aucun agent sous votre supervision.</Typography>
            ) : (
              <Grid container spacing={2}>
                {agents.map((agent) => (
                  <Grid item xs={12} key={agent.id}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#f9fafb' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#1976d2', color: '#fff' }}>
                          {agent.prenom.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 'bold' }}>
                            {agent.prenom} {agent.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {agent.fonction} — {agent.service}
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            Matricule : {agent.matricule}
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          bgcolor: '#1976d2',
                          '&:hover': { bgcolor: '#115293' },
                          borderRadius: 2,
                          px: 3,
                        }}
                        onClick={() => handleViewDetails(agent.id)}
                      >
                        Voir détails
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentsSupervisesPage;