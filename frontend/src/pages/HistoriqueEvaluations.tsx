// src/pages/HistoriqueEvaluations.tsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Evaluation {
  id: number;
  periode_libelle: string;
  performance_ponderee: number | string | null;
  date_calcul: string;
  date_archivage: string | number | Date;
}

const drawerWidth = 300;

const HistoriqueEvaluations: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/historique-evaluations/');
      setEvaluations(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

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
        <Topbar title="Historique des évaluations" handleDrawerToggle={handleDrawerToggle} />

        <Box sx={{ p: 3, mt: { xs: '56px', md: '64px' } }}>
          {/* --- En-tête --- */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              📊 Historique des évaluations
            </Typography>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchEvaluations}
            >
              Rafraîchir
            </Button>
          </Box>

          {/* --- Carte principale --- */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              p: 2,
              overflowX: 'auto',
            }}
          >
            <CardContent>
              {loading ? (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Chargement des évaluations...</Typography>
                </Box>
              ) : evaluations.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucune évaluation disponible pour le moment.
                </Typography>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Voici la liste des évaluations archivées avec leurs performances pondérées.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f0f2f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Performance pondérée (%)</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date de calcul</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date d’archivage</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {evaluations.map((evalItem) => {
                        const perf = Number(evalItem.performance_ponderee);
                        const perfColor = !isFinite(perf)
                          ? '#9e9e9e' // gris si valeur invalide
                          : perf < 50
                          ? '#e53935'
                          : perf < 75
                          ? '#fbc02d'
                          : '#4caf50';

                        return (
                          <TableRow
                            key={evalItem.id}
                            sx={{
                              '&:hover': {
                                bgcolor: '#f9fafb',
                              },
                            }}
                          >
                            <TableCell>{evalItem.periode_libelle}</TableCell>
                            <TableCell>
                              <Chip
                                icon={<BarChartIcon />}
                                label={
                                  isFinite(perf) ? `${perf.toFixed(2)} %` : '—'
                                }
                                sx={{
                                  bgcolor: perfColor,
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(evalItem.date_calcul).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(evalItem.date_archivage).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HistoriqueEvaluations;
