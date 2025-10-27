// src/pages/ObjectifDetailsNplus1.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SidebarNplus1 from '../components/SidebarNplus1';
import Topbar from '../components/Topbar';
import api from '../api';

interface Objectif {
  id: number;
  libelle: string;
  type_kpi: string;
  cible: number;
  poids: number;
  taux_avancement: number;
  date_debut: string;
  date_delai: string;
  statut: 'en_attente' | 'valide' | 'rejete';
  commentaire_rejet?: string;
}

interface Realisation {
  id: number;
  description: string;
  taux_avancement: number;
  preuve?: string;
  est_valide: boolean;
  est_rejete: boolean;
  commentaire_rejet?: string;
}

const drawerWidth = 300;

const ObjectifDetailsNplus1: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [objectif, setObjectif] = useState<Objectif | null>(null);
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get(`/objectifs/${id}/`);
        setObjectif(resp.data);

        const respRealisations = await api.get(`/objectifs/${id}/realisations/`);
        setRealisations(respRealisations.data);
      } catch (error) {
        console.error('Erreur chargement détails objectif N+1 :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Chargement...</Typography>
    </Box>
  );

  if (!objectif) return <Typography>Aucun objectif trouvé.</Typography>;

  const statutLabels: Record<string, string> = {
    en_attente: '⏳ En attente',
    valide: '✅ Validé',
    rejete: '❌ Rejeté',
  };

  const statutCouleurs: Record<string, string> = {
    en_attente: '#fbc02d',
    valide: '#4caf50',
    rejete: '#e53935',
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <SidebarNplus1 mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, display: 'flex', flexDirection: 'column' }}
      >
        <Topbar title="Détails de l'objectif" handleDrawerToggle={handleDrawerToggle} />
        <Box sx={{ p: 3, mt: { xs: '56px', md: '64px' } }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Retour
          </Button>

          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                🎯 {objectif.libelle}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Type KPI :</strong> {objectif.type_kpi}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Cible :</strong> {objectif.cible}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Poids :</strong> {objectif.poids}%
              </Typography>

              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">Taux d’avancement : {objectif.taux_avancement}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={objectif.taux_avancement}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mt: 0.5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        objectif.taux_avancement < 50
                          ? '#fbc02d'
                          : objectif.taux_avancement < 100
                          ? '#1976d2'
                          : '#4caf50',
                    },
                  }}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date de début :</strong> {objectif.date_debut}
              </Typography>
              <Typography variant="body1">
                <strong>Date limite :</strong> {objectif.date_delai}
              </Typography>

              <Chip
                label={statutLabels[objectif.statut]}
                sx={{ mt: 2, bgcolor: statutCouleurs[objectif.statut], color: 'white', fontWeight: 'bold' }}
              />
              {objectif.statut === 'rejete' && objectif.commentaire_rejet && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  💬 Commentaire : {objectif.commentaire_rejet}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Réalisations liées à cet objectif</Typography>
          {realisations.length === 0 ? (
            <Typography color="text.secondary">Aucune réalisation trouvée pour cet objectif.</Typography>
          ) : (
            realisations.map((r) => (
              <Card key={r.id} sx={{ mb: 2, borderRadius: 2, p: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <Typography variant="body1" sx={{ mb: 1 }}><strong>Description :</strong> {r.description}</Typography>
                {r.preuve && (
                  <Typography variant="body2">
                    <strong>Preuve :</strong>{' '}
                    <a href={r.preuve} target="_blank" rel="noopener noreferrer">Voir le document</a>
                  </Typography>
                )}
                <Chip
                  label={r.est_valide ? 'Validée ✅' : r.est_rejete ? 'Rejetée ❌' : 'En attente ⏳'}
                  sx={{
                    mt: 2,
                    bgcolor: r.est_valide ? '#4caf50' : r.est_rejete ? '#e53935' : '#fbc02d',
                    color: 'white',
                    fontWeight: 'bold',
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

export default ObjectifDetailsNplus1;
