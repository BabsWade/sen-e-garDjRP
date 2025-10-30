

// src/pages/ObjectifSubordonnees.tsx
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
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
  Fade,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SidebarNplus1 from '../components/SidebarNplus1';
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
  responsable_id: number;
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

  const [openRejetDialog, setOpenRejetDialog] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [openModifierDialog, setOpenModifierDialog] = useState(false);
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [nouvelleCible, setNouvelleCible] = useState<number | ''>('');

  const [openValiderDialog, setOpenValiderDialog] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

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

  useEffect(() => {
    fetchData();
  }, [objectifId]);

  if (loading)
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress thickness={5} size={60} sx={{ color: '#1976d2' }} />
        <Typography sx={{ mt: 2, fontWeight: 500, color: 'text.secondary' }}>
          Chargement en cours...
        </Typography>
      </Box>
    );

  if (!data) return <Typography>Aucun objectif trouvé.</Typography>;

  const { agent, objectif } = data;

  // === Vérification des permissions : seul le DRH ou le responsable (N+1) peut agir ===
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const peutAgir =
    currentUser &&
    (currentUser.role === 'DRH' || currentUser.id === agent.responsable_id);

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

  const cardStyle = {
    borderRadius: 3,
    p: 3,
    mb: 3,
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 28px rgba(0,0,0,0.1)' },
  };

  // === Handlers ===
  const handleValider = async () => {
    try {
      await api.post(`/objectifs-superieur/${objectif.id}/valider/`);
      setMessage({ type: 'success', text: 'Objectif validé ✅' });
      setOpenValiderDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la validation ❌' });
    }
  };

  const handleRejeter = async () => {
    try {
      await api.post(`/objectifs-superieur/${objectif.id}/rejeter/`, { commentaire_rejet: commentaire });
      setMessage({ type: 'success', text: 'Objectif rejeté ❌' });
      setOpenRejetDialog(false);
      setCommentaire('');
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors du rejet' });
    }
  };

  const handleModifier = async () => {
    try {
      await api.put(`/objectifs-superieur/${objectif.id}/modifier/`, {
        libelle: nouveauLibelle,
        cible: nouvelleCible,
      });
      setMessage({ type: 'success', text: 'Objectif modifié ✏️' });
      setOpenModifierDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la modification' });
    }
  };

  // === Handlers pour les RÉALISATIONS ===

  const handleValiderRealisation = async (realisationId: number) => {
    try {
      await api.post(`/realisations/${realisationId}/valider/`);
      setMessage({ type: 'success', text: 'Réalisation validée ✅' });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la validation ❌' });
    }
  };

  const handleRejeterRealisation = async (realisationId: number) => {
    const commentaire = prompt("Entrez un commentaire pour le rejet :");
    if (!commentaire) return;

    try {
      await api.post(`/realisations/${realisationId}/rejeter/`, {
        commentaire_rejet: commentaire,
      });
      setMessage({ type: 'success', text: 'Réalisation rejetée ❌' });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors du rejet ❌' });
    }
  };

  const handleModifierRealisation = async (realisationId: number, ancienneDescription: string) => {
    const nouvelleDescription = prompt("Modifier la description :", ancienneDescription);
    if (!nouvelleDescription) return;

    try {
      await api.put(`/realisations/${realisationId}/modifier/`, {
        description: nouvelleDescription,
      });
      setMessage({ type: 'success', text: 'Réalisation modifiée ✏️' });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la modification ❌' });
    }
  };


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
        <Topbar title="Détails de l'objectif" handleDrawerToggle={handleDrawerToggle} />
        <Box sx={{ p: { xs: 2, md: 4 }, mt: { xs: '56px', md: '64px' } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            color="primary"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Retour
          </Button>

          {/* Infos agent */}
          <Fade in timeout={400}>
            <Card sx={cardStyle}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: '#1565c0',
                    width: 60,
                    height: 60,
                    fontSize: 24,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(21,101,192,0.3)',
                  }}
                >
                  {agent.prenom[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    👤 {agent.nom} {agent.prenom}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Matricule : {agent.matricule} • Service : {agent.service_nom}
                  </Typography>
                  <Typography color="text.secondary">Responsable : {agent.responsable_nom}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Objectif */}
          <Fade in timeout={500}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  🎯 {objectif.libelle}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1.2}>
                  <Typography>
                    <strong>Type KPI :</strong> {objectif.type_kpi}
                  </Typography>
                  <Typography>
                    <strong>Cible :</strong> {objectif.cible}
                  </Typography>
                  <Typography>
                    <strong>Poids :</strong> {objectif.poids}%
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Taux d’avancement : {objectif.taux_avancement}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={objectif.taux_avancement}
                      sx={{
                        mt: 1,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          background:
                            objectif.taux_avancement === 100
                              ? '#43a047'
                              : objectif.taux_avancement >= 50
                                ? '#1976d2'
                                : '#fbc02d',
                        },
                      }}
                    />
                  </Box>
                </Stack>

                <Chip
                  label={statutLabels[objectif.statut]}
                  sx={{
                    mt: 3,
                    bgcolor: statutCouleurs[objectif.statut],
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: 1,
                    fontSize: '0.9rem',
                  }}
                />

                {/* Boutons d’action */}
                {peutAgir && (
                  <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                    <Tooltip title="Valider">
                      <Button
                        startIcon={<CheckCircleOutlineIcon />}
                        variant="contained"
                        color="success"
                        onClick={() => setOpenValiderDialog(true)}
                        sx={{ borderRadius: 2, px: 2 }}
                      >
                        Valider
                      </Button>
                    </Tooltip>
                    <Tooltip title="Rejeter">
                      <Button
                        startIcon={<CancelOutlinedIcon />}
                        variant="outlined"
                        color="error"
                        onClick={() => setOpenRejetDialog(true)}
                        sx={{ borderRadius: 2, px: 2 }}
                      >
                        Rejeter
                      </Button>
                    </Tooltip>
                    <Tooltip title="Modifier cet objectif">
                      <Button
                        startIcon={<EditOutlinedIcon />}
                        variant="text"
                        color="primary"
                        onClick={() => {
                          setNouveauLibelle(objectif.libelle);
                          setNouvelleCible(objectif.cible);
                          setOpenModifierDialog(true);
                        }}
                        sx={{ fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                      >
                        Modifier
                      </Button>
                    </Tooltip>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Fade>

          {/* Réalisations */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Réalisations liées
          </Typography>

          {objectif.realisations.length === 0 ? (
            <Typography color="text.secondary">
              Aucune réalisation trouvée pour cet objectif.
            </Typography>
          ) : (
            objectif.realisations.map((r) => (
              <Fade in key={r.id}>
                <Card
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    p: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.12)' },
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Description :</strong> {r.description}
                  </Typography>

                  {r.preuve && (
                    <Typography variant="body2">
                      <a
                        href={r.preuve}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'none' }}
                      >
                        📎 Voir le document
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

                  {peutAgir && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Tooltip title="Valider cette réalisation">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleValiderRealisation(r.id)}
                        >
                          Valider
                        </Button>
                      </Tooltip>

                      <Tooltip title="Rejeter cette réalisation">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRejeterRealisation(r.id)}
                        >
                          Rejeter
                        </Button>
                      </Tooltip>

                      <Tooltip title="Modifier la réalisation">
                        <Button
                          variant="text"
                          color="primary"
                          size="small"
                          onClick={() => handleModifierRealisation(r.id, r.description)}
                        >
                          Modifier
                        </Button>
                      </Tooltip>
                    </Stack>
                  )}
                </Card>
              </Fade>
            ))
          )}

          {/* === Dialogs === */}
          <Dialog open={openRejetDialog} onClose={() => setOpenRejetDialog(false)}>
            <DialogTitle>Rejeter l’objectif</DialogTitle>
            <DialogContent>
              <TextField
                label="Commentaire"
                fullWidth
                multiline
                rows={3}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRejetDialog(false)}>Annuler</Button>
              <Button variant="contained" color="error" onClick={handleRejeter}>
                Confirmer le rejet
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openModifierDialog} onClose={() => setOpenModifierDialog(false)}>
            <DialogTitle>Modifier l’objectif</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Libellé"
                fullWidth
                value={nouveauLibelle}
                onChange={(e) => setNouveauLibelle(e.target.value)}
              />
              <TextField
                label="Cible"
                type="number"
                fullWidth
                value={nouvelleCible}
                onChange={(e) => setNouvelleCible(Number(e.target.value))}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModifierDialog(false)}>Annuler</Button>
              <Button variant="contained" color="primary" onClick={handleModifier}>
                Enregistrer
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openValiderDialog} onClose={() => setOpenValiderDialog(false)}>
            <DialogTitle>Valider l’objectif</DialogTitle>
            <DialogContent>
              <TextField
                label="Commentaire (optionnel)"
                fullWidth
                multiline
                rows={3}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
              />
              <Typography sx={{ mt: 1 }}>Confirmez la validation ?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenValiderDialog(false)}>Annuler</Button>
              <Button variant="contained" color="primary" onClick={handleValider}>
                Confirmer
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={!!message}
            autoHideDuration={3000}
            onClose={() => setMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert severity={message?.type}>{message?.text}</Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
};

export default ObjectifSubordonnees;