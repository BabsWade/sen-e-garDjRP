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
  LinearProgress,
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
import type { minWidth } from '@mui/system';
import SidebarNplus1 from '../components/SidebarNplus1';

interface NoteFinale {
  note_finale: number;
  commentaire: string;
  date_valuation: string;
  date_soumission: string;
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

const N1Dashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [objectifsAtteints, setObjectifsAtteints] = useState(0);
  const [totalObjectifs, setTotalObjectifs] = useState(0);
  const [agent, setAgent] = useState<any>(null);
  const [performance, setPerformance] = useState(0);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);
  const [noteFinale, setNoteFinale] = useState<NoteFinale | null>(null);
  const [periodeEnCours, setPeriodeEnCours] = useState('Aucune');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const [showAllObjectifs, setShowAllObjectifs] = useState(false);
  const [showAllNotifs, setShowAllNotifs] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleVoirDetails = (id: number) => {
    navigate(`/objectifs/${id}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const perfResp = await api.get('/dashboard-agent/');
        const data = perfResp.data;
        setAgent(data);
        setPerformance(Number(data.performance_moyenne) || 0);
        setPeriodeEnCours(data.periode_en_cours || 'Aucune');
        setObjectifsAtteints(data.objectifs_atteints || 0);
        setTotalObjectifs(data.total_objectifs || 0);

        const [objRes, notifRes, fbRes, histRes, noteRes] = await Promise.all([
          api.get('/agent-objectifs/'),
          api.get('/notifications/'),
          api.get('/agent-feedbacks/'),
          api.get('/agent-historique-performances/'),
          api.get('/note-finales/'),
        ]);

        setObjectifs(objRes.data);
        setNotifications(notifRes.data);
        setFeedbacks(fbRes.data);
        setHistorique(histRes.data);
        if (noteRes.data && noteRes.data.length > 0) setNoteFinale(noteRes.data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f6f8fc', minHeight: '100vh' }}>
      <Topbar title="Tableau de bord" handleDrawerToggle={handleDrawerToggle} agent={agent} />
      <SidebarNplus1 mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

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
        {/* Cartes colorées */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#d2ffd8', textAlign: 'center', p: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'green' }} />
              <Typography>Agents Supervisés</Typography>
              <Typography variant="h4">
                {objectifsAtteints}/{totalObjectifs}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#fcffb8', textAlign: 'center', p: 2 }}>
              <StarIcon sx={{ fontSize: 40, color: '#fbc02d' }} />
              <Typography>Objectifs Validés / en Attente</Typography>
              <Typography variant="h4">

                {noteFinale ? Number(noteFinale.note_finale).toFixed(2) + '%' : '—'}

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

        {/* Graphique et Tableau des objectifs côte à côte */}
        <Grid container spacing={2} >
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                Taux d’Avancement Moyen de l’Équipe
                </Typography>
                <Line
                  data={{
                    labels: historique.map((h) => new Date(h.date_calcul).toLocaleDateString()),
                    datasets: [
                      {
                        label: 'Performance (%)',
                        data: historique.map((h) => h.performance),
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                        tension: 0.3,
                        fill: false,
                      },
                      {
                        label: 'Taux de réalisations validées (%)',
                        data: historique.map((h) => h.taux_realisations_valides),
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        tension: 0.3,
                        fill: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Pourcentage (%)',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date',
                        },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>


          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>

                <Typography variant="h6">Mes notifications</Typography>
                {notifications.length === 0 ? (
                  <Typography>Aucune notification.</Typography>
                ) : (
                  <List>

                    {notifications.slice(0, showAllNotifs ? notifications.length : 5).map((notif) => (
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


        <Grid item xs={12} md={6}>
          {/* Tableau des objectifs */}
          <Card sx={{
            p: 3,
            height: '100%', // Pour s'assurer que le Card prend toute la hauteur disponible
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
              Tableau de suivi
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

        {/* Feedbacks et notifications côte à côte */}
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

export default N1Dashboard;
