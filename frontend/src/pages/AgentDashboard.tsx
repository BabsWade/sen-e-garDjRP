import React, { useEffect, useState } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

interface NoteFinale {
  note_finale: number;
  commentaire: string;
  date_valuation: string;
  date_soumission: string;
  performance_ponderee?: number;
}

interface Objectif {
  id: number;
  libelle: string;
  type_kpi: string;
  poids: number;
  taux_avancement: number;
  statut: string;
  date_delai: string;
  date_debut: string;
}

interface Notification {
  id: number;
  message: string;
  date_envoi: string;
  lu: boolean;
}

interface TauxRealisation {
  taux_realisations_valides: number;
  date_calcul: string;
}

const AgentDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [objectifsAtteints, setObjectifsAtteints] = useState(0);
  const [totalObjectifs, setTotalObjectifs] = useState(0);
  const [agent, setAgent] = useState<any>(null);
  const [performance, setPerformance] = useState(0);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);
  const [tauxHistorique, setTauxHistorique] = useState<TauxRealisation[]>([]);
  const [noteFinale, setNoteFinale] = useState<NoteFinale | null>(null);
  const [periodeEnCours, setPeriodeEnCours] = useState('Aucune');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const [showAllObjectifs, setShowAllObjectifs] = useState(false);
  const [showAllNotifs, setShowAllNotifs] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleVoirDetails = (id: number) => navigate(`/objectifs/${id}`);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // --- Données principales
        const perfResp = await api.get('/dashboard-agent/');
        const data = perfResp.data;

        setAgent(data);
        setPerformance(Number(data.performance_moyenne) || 0);
        setPeriodeEnCours(data.periode_en_cours || 'Aucune');
        setObjectifsAtteints(data.objectifs_atteints || 0);
        setTotalObjectifs(data.total_objectifs || 0);

        // --- Récupération en parallèle
        const [objRes, notifRes, fbRes, histRes, noteRes, tauxRes] = await Promise.all([
          api.get('/agent-objectifs/'),
          api.get('/notifications/'),
          api.get('/agent-feedbacks/'),
          api.get('/agent-historique-performances/'),
          api.get('/derniere-evaluation/'),
          api.get(`/accounts/taux-realisations/${data.id}/`), // ← ajout du taux de réalisations
        ]);

        setObjectifs(objRes.data);
        setNotifications(notifRes.data);
        setFeedbacks(fbRes.data);
        setHistorique(histRes.data);
        setTauxHistorique(tauxRes.data);
        if (noteRes.data) setNoteFinale(noteRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboardData();
  }, []);

  console.table(
    tauxHistorique.map((t) => ({
      date: t.date_calcul,
      taux: t.taux_realisations_valides,
    }))
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f6f8fc', minHeight: '100vh' }}>
      <Topbar title="Tableau de bord" handleDrawerToggle={handleDrawerToggle} agent={agent} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: { md: `calc(100% - 240px)` },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* --- Cartes d'information --- */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#d2ffd8', textAlign: 'center', p: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'green' }} />
              <Typography>Objectifs atteints</Typography>
              <Typography variant="h4">
                {objectifsAtteints}/{totalObjectifs}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#fcffb8', textAlign: 'center', p: 2 }}>
              <StarIcon sx={{ fontSize: 40, color: '#fbc02d' }} />
              <Typography>Note dernière évaluation</Typography>
              <Typography variant="h4">
                {noteFinale ? Number(noteFinale.performance_ponderee).toFixed(2) + '%' : '—'}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#f8c4d2', textAlign: 'center', p: 2 }}>
              <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2' }} />
              <Typography>Période en cours</Typography>
              <Typography variant="h4">{periodeEnCours}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* --- Graphique + notifications --- */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Évolution de ma performance et de mes réalisations
                </Typography>

                {/* 🔹 Graphique combiné (performance + taux de réalisations validées) */}
                <Line
                  data={{
                    labels: historique.map((h) =>
                      new Date(h.date_calcul).toLocaleDateString()
                    ),
                    datasets: [
                      {
                        label: 'Performance pondérée (%)',
                        data: historique.map((h) => h.performance),
                        borderColor: '#1976d2', // bleu
                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                        tension: 0.3,
                        fill: false,
                      },
                      {
                        label: 'Taux de réalisations validées (%)',
                        data: tauxHistorique.map((t) => t.taux_realisations_valides),
                        borderColor: '#E53935', // rouge
                        backgroundColor: 'rgba(229, 57, 53, 0.2)',
                        tension: 0.3,
                        fill: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Pourcentage (%)' },
                      },
                      x: {
                        title: { display: true, text: 'Date' },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* --- Notifications --- */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Mes notifications</Typography>
                {notifications.length === 0 ? (
                  <Typography>Aucune notification.</Typography>
                ) : (
                  <List>
                    {notifications.slice(0, showAllNotifs ? notifications.length : 4).map((notif) => (
                      <React.Fragment key={notif.id}>
                        <ListItem>
                          <ListItemText
                            primary={notif.message}
                            secondary={new Date(notif.date_envoi).toLocaleString()}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
                {!showAllNotifs && notifications.length > 3 && (
                  <Button onClick={() => setShowAllNotifs(true)} fullWidth sx={{ mt: 2 }}>
                    Voir plus d'objectifs
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* --- Tableau des objectifs --- */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mes objectifs
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Libellé</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Poids</TableCell>
                    <TableCell>Taux d’avancement</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Délai</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {objectifs.slice(0, showAllObjectifs ? objectifs.length : 3).map((obj) => (
                    <TableRow
                      key={obj.id}
                      hover
                      onClick={() => handleVoirDetails(obj.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{obj.libelle}</TableCell>
                      <TableCell>{obj.type_kpi}</TableCell>
                      <TableCell>{obj.poids}%</TableCell>
                      <TableCell>{obj.taux_avancement}%</TableCell>
                      <TableCell>{obj.statut}</TableCell>
                      <TableCell>
                        {new Date(obj.date_debut).toLocaleDateString()} -{' '}
                        {new Date(obj.date_delai).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!showAllObjectifs && objectifs.length > 3 && (
                <Button onClick={() => setShowAllObjectifs(true)} fullWidth sx={{ mt: 2 }}>
                  Voir plus d'objectifs
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* --- Feedbacks --- */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Derniers feedbacks</Typography>
                {feedbacks.length === 0 ? (
                  <Typography>Aucun feedback disponible.</Typography>
                ) : (
                  <List>
                    {feedbacks.map((fb, i) => (
                      <React.Fragment key={i}>
                        <ListItem>
                          <ListItemText
                            primary={fb.description || '—'}
                            secondary={`Objectif : ${fb.objectif_libelle} — ${new Date(
                              fb.date_soumission
                            ).toLocaleDateString()}`}
                          />
                        </ListItem>
                        {i < feedbacks.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AgentDashboard;
