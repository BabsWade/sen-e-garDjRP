// src/pages/ObjectifDetails.tsx
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

interface Objectif {
  id: number;
  libelle: string;
  type_kpi: string;
  cible: string;
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

const ObjectifDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [objectif, setObjectif] = useState<Objectif | null>(null);
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await api.get(`/agent-objectifs/${id}/`);
        setObjectif(resp.data);

        

        const respRealisations = await api.get(`/realisations/?objectif=${id}`);
        setRealisations(respRealisations.data);
      } catch (error) {
        console.error('Erreur lors du chargement des détails :', error);
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
      {/* --- SIDEBAR --- */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      {/* --- MAIN CONTENT --- */}
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
          {/* --- Bouton Retour --- */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Retour à mes objectifs
          </Button>

          {/* --- Carte de l'objectif --- */}
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              p: 2,
            }}
          >
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

              {/* --- Progression visuelle --- */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  Taux d’avancement : {objectif.taux_avancement}%
                </Typography>
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

              {/* --- Statut --- */}
              <Chip
                label={statutLabels[objectif.statut]}
                sx={{
                  mt: 2,
                  bgcolor: statutCouleurs[objectif.statut],
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />

              {objectif.statut === 'rejete' && objectif.commentaire_rejet && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  💬 Commentaire : {objectif.commentaire_rejet}
                </Typography>
              )}

              {/* --- Boutons d’action --- */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {(objectif.statut === 'en_attente' || objectif.statut === 'rejete') && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/objectifs/${objectif.id}/edit`)}
                  >
                    Modifier l’objectif
                  </Button>
                )}

                {objectif.statut === 'valide' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      navigate(`/realisations/create?objectif=${objectif.id}`)
                    }
                  >
                    Ajouter une réalisation
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* --- Section Réalisations --- */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Réalisations liées à cet objectif
          </Typography>

          {realisations.length === 0 ? (
            <Typography color="text.secondary">
              Aucune réalisation trouvée pour cet objectif.
            </Typography>
          ) : (
            realisations.map((r) => (
              <Card
                key={r.id}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Description :</strong> {r.description}
                </Typography>

                

                {r.preuve && (
                  <Typography variant="body2">
                    <strong>Preuve :</strong>{' '}
                    <a
                      href={r.preuve}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir le document
                    </a>
                  </Typography>
                )}

                <Chip
                  label={
                    r.est_valide
                      ? 'Validée ✅'
                      : r.est_rejete
                      ? `Rejetée ❌`
                      : 'En attente ⏳'
                  }
                  sx={{
                    mt: 2,
                    bgcolor: r.est_valide
                      ? '#4caf50'
                      : r.est_rejete
                      ? '#e53935'
                      : '#fbc02d',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />

                {r.est_rejete && r.commentaire_rejet && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 1 }}
                  >
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

export default ObjectifDetails;