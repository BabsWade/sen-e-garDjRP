import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button,
  CircularProgress, Chip, Divider, LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

interface Realisation {
  id: number;
  description: string;
  est_valide: boolean;
  feedback?: string;
  date_soumission: string;
}

interface Objectif {
  id: number;
  libelle: string;
  taux_avancement: number;
  statut: string;
  poids: number;
  type_kpi: string;
  realisations: Realisation[];
}

const drawerWidth = 300;

const InfosObjectif: React.FC = () => {
  const { agentId, objectifId } = useParams<{ agentId: string; objectifId: string }>();
  const [objectif, setObjectif] = useState<Objectif | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchObjectif = async () => {
      try {
        const resp = await api.get(`/api/agents-sous-responsable/${agentId}/`);
        // on récupère le bon objectif parmi ceux de l’agent
        const obj = resp.data.objectifs.find((o: any) => o.id === Number(objectifId));
        setObjectif(obj);
      } catch (error) {
        console.error('Erreur lors du chargement de l’objectif :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchObjectif();
  }, [agentId, objectifId]);

  if (loading) return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Chargement des informations...</Typography>
    </Box>
  );

  if (!objectif) return <Typography sx={{ mt: 4 }}>Aucun objectif trouvé.</Typography>;

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
        <Topbar title={`Détails de l’objectif`} handleDrawerToggle={() => {}} />
        <Box sx={{ p: 3, mt: { xs: '56px', md: '64px' } }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
            Retour aux objectifs
          </Button>

          {/* ---- Infos Objectif ---- */}
          <Card sx={{ mb: 3, borderRadius: 3, p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              🎯 {objectif.libelle}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography>Type KPI : <strong>{objectif.type_kpi}</strong></Typography>
            <Typography>Poids : {objectif.poids}%</Typography>
            <Typography>Taux d’avancement : {objectif.taux_avancement}%</Typography>

            <LinearProgress
              variant="determinate"
              value={objectif.taux_avancement}
              sx={{ height: 8, borderRadius: 2, my: 2 }}
            />

            <Chip
              label={objectif.statut}
              sx={{
                bgcolor:
                  objectif.statut === 'valide'
                    ? '#4caf50'
                    : objectif.statut === 'rejete'
                    ? '#e53935'
                    : '#fbc02d',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Card>

          {/* ---- Réalisations ---- */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📋 Réalisations liées
          </Typography>

          {objectif.realisations?.length > 0 ? (
            objectif.realisations.map((r) => (
              <Card key={r.id} sx={{ mb: 2, borderRadius: 2, p: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {r.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Soumise le : {new Date(r.date_soumission).toLocaleDateString()}
                </Typography>
                {r.feedback && (
                  <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
                    💬 Feedback : {r.feedback}
                  </Typography>
                )}
                <Chip
                  label={r.est_valide ? 'Validée' : 'En attente'}
                  color={r.est_valide ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                />
              </Card>
            ))
          ) : (
            <Typography color="text.secondary">Aucune réalisation pour cet objectif.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default InfosObjectif;
