// src/pages/ObjectifSubordonnees.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Chip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

interface Realisation {
  id: number;
  description: string;
  preuve?: string;
  est_valide: boolean;
  est_rejete: boolean;
  commentaire_rejet?: string;
  date_soumission: string;
  date_validation?: string | null;
}

interface Objectif {
  id: number;
  libelle: string;
  taux_avancement: number;
  statut: 'en_attente' | 'valide' | 'rejete';
  poids: number;
  cible: number;
  type_kpi: string;
  date_debut: string | null;
  date_delai: string | null;
  realisations: Realisation[];
}

interface Agent {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  performance_moyenne: number;
  service_nom: string;
  responsable_nom: string;
  superieur_hierarchique: boolean;
}

interface ApiResponse {
  agent: Agent;
  objectif: Objectif;
}

const drawerWidth = 300;

const ObjectifSubordonnees: React.FC = () => {
  const { objectifId } = useParams<{ objectifId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get(`/objectifs-superieur/${objectifId}/`);
        setData(resp.data);
      } catch (error) {
        console.error('Erreur lors du chargement des détails :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [objectifId]);

  if (loading)
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Chargement...</Typography>
      </Box>
    );

  if (!data) return <Typography>Aucun objectif trouvé.</Typography>;

  const { agent, objectif } = data;

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
        <Topbar title="Détails de l'objectif" handleDrawerToggle={handleDrawerToggle} />
        <Box sx={{ p: 3, mt: { xs: '56px', md: '64px' } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Retour à mes objectifs
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
                <Typography>Matricule : {agent.matricule}</Typography>
                <Typography>Performance moyenne : {agent.performance_moyenne}%</Typography>
                <Typography>Service : {agent.service_nom}</Typography>
                <Typography>Responsable : {agent.responsable_nom}</Typography>
                <Typography>
                  Supérieur hiérarchique : {agent.superieur_hierarchique ? 'Oui' : 'Non'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* --- Objectif --- */}
          <Card sx={{ mb: 4, borderRadius: 3, p: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                🎯 {objectif.libelle}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1"><strong>Type KPI :</strong> {objectif.type_kpi}</Typography>
              <Typography variant="body1"><strong>Cible :</strong> {objectif.cible}</Typography>
              <Typography variant="body1"><strong>Poids :</strong> {objectif.poids}%</Typography>

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

              <Typography variant="body1"><strong>Date de début :</strong> {objectif.date_debut || '—'}</Typography>
              <Typography variant="body1"><strong>Date limite :</strong> {objectif.date_delai || '—'}</Typography>

              <Chip
                label={statutLabels[objectif.statut]}
                sx={{
                  mt: 2,
                  bgcolor: statutCouleurs[objectif.statut],
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </CardContent>
          </Card>

          {/* --- Réalisations --- */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Réalisations liées à cet objectif
          </Typography>

          {objectif.realisations.length === 0 ? (
            <Typography color="text.secondary">Aucune réalisation trouvée pour cet objectif.</Typography>
          ) : (
            objectif.realisations.map((r) => (
              <Card
                key={r.id}
                sx={{ mb: 2, borderRadius: 2, p: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
              >
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Description :</strong> {r.description}
                </Typography>

                {r.preuve && (
                  <Typography variant="body2">
                    <strong>Preuve :</strong>{' '}
                    <a href={r.preuve} target="_blank" rel="noopener noreferrer">
                      Voir le document
                    </a>
                  </Typography>
                )}

                <Chip
                  label={
                    r.est_valide ? 'Validée ✅' : r.est_rejete ? 'Rejetée ❌' : 'En attente ⏳'
                  }
                  sx={{
                    mt: 2,
                    bgcolor: r.est_valide ? '#4caf50' : r.est_rejete ? '#e53935' : '#fbc02d',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />

                {r.est_rejete && r.commentaire_rejet && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    💬 Commentaire : {r.commentaire_rejet}
                  </Typography>
                )}

                {!r.est_valide && !r.est_rejete && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={Link}
                      to={`/realisations/${r.id}/edit`}
                      variant="outlined"
                      size="small"
                    >
                      Modifier cette réalisation
                    </Button>
                  </Box>
                )}
              </Card>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ObjectifSubordonnees;
