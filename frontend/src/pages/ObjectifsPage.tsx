// src/pages/ObjectifsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

type StatutObjectif = 'en_attente' | 'valide' | 'rejete';

interface Objectif {
  id: number;
  libelle: string;
  type_kpi: string;
  cible: string;
  poids: string;
  annee: number;
  service: string;
  periode: string;
  taux_avancement: number;
  statut: StatutObjectif;
  commentaire_rejet?: string;
}

const drawerWidth = 300;

const ObjectifsPage: React.FC = () => {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [filteredObjectifs, setFilteredObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleVoirDetails = (id: number) => navigate(`/objectifs/${id}`);

  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        const response = await api.get('objectifs/');
        setObjectifs(response.data);
        setFilteredObjectifs(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des objectifs :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectifs();
  }, []);

  // 🔍 Recherche dynamique
  useEffect(() => {
    const results = objectifs.filter((obj) =>
      obj.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredObjectifs(results);
  }, [searchTerm, objectifs]);

  const labelsStatut: Record<StatutObjectif, string> = {
    en_attente: 'En attente',
    valide: 'Validé',
    rejete: 'Rejeté',
  };

  const couleursStatut: Record<StatutObjectif, string> = {
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
        <Topbar title="Mes Objectifs" onMenuClick={handleDrawerToggle} />

        {/* --- CONTENU PRINCIPAL --- */}
        <Box sx={{ p: 3 }}>
          {/* --- En-tête --- */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              alignItems: 'center',
              mb: 3,
              gap: 2,
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="Rechercher un objectif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, maxWidth: 400 }}
            />

            <Button
              component={Link}
              to="/objectifs/create"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#115293' },
                borderRadius: 2,
              }}
            >
              Créer la objectif
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* --- Contenu dynamique --- */}
          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <CircularProgress color="primary" />
              <Typography sx={{ mt: 2 }}>Chargement des objectifs...</Typography>
            </Box>
          ) : filteredObjectifs.length === 0 ? (
            <Typography>Aucun objectif trouvé.</Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredObjectifs.map((objectif) => (
                <Grid item xs={12} md={6} lg={4} key={objectif.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                    onClick={() => handleVoirDetails(objectif.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#0f172a', mb: 1 }}>
                        {objectif.libelle}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        🎯 KPI : {objectif.type_kpi}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        🎯 Cible : {objectif.cible}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ⚖️ Poids : {objectif.poids}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 Période : {objectif.periode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        🏢 Service : {objectif.service}
                      </Typography>

                      {/* --- Barre de progression --- */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Taux d’avancement : {objectif.taux_avancement}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={objectif.taux_avancement}
                          sx={{
                            height: 8,
                            borderRadius: 5,
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

                      {/* --- Statut --- */}
                      <Chip
                        label={labelsStatut[objectif.statut]}
                        sx={{
                          mt: 2,
                          bgcolor: couleursStatut[objectif.statut],
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
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      {(objectif.statut === 'en_attente' || objectif.statut === 'rejete') && (
  <Button
    component={Link}
    to={`/objectifs/${objectif.id}/edit`}
    variant="outlined"
    startIcon={<EditIcon />}
    sx={{
      borderColor: '#1976d2',
      color: '#1976d2',
      '&:hover': { bgcolor: '#e3f2fd' },
    }}
    onClick={(e) => e.stopPropagation()}
  >
    Modifier
  </Button>
)}

                        <Button
                          variant="text"
                          endIcon={<ArrowForwardIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoirDetails(objectif.id);
                          }}
                          sx={{ ml: 1 }}
                        >
                          Détails
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ObjectifsPage;