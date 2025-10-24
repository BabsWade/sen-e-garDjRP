// src/pages/AgentDashboard.tsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom'; // Assure-toi d’avoir ça en haut du fichier

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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface NoteFinale {
  note_finale: number;
  commentaire: string;
  date_valuation: string;
  date_soumission: string;
}

interface Objectif {
  date_delai: string | number | Date;
  date_fin: string | number | Date;
  date_debut: string | number | Date;
  statut: any;
  id: number;
  libelle: string;
  type_kpi: string;
  poids: number;
  taux_avancement: number;
  est_valide: boolean;
  est_rejete: boolean;
  commentaire_rejet?: string;
}

const AgentDashboard: React.FC = () => {
  const [agent, setAgent] = useState<any>(null);
  const [performance, setPerformance] = useState<number>(0);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);
  const [noteFinale, setNoteFinale] = useState<NoteFinale | null>(null);
  const [periodeEnCours, setPeriodeEnCours] = useState<string>('Aucune');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

const handleVoirDetails = (objectifId: number) => {
  navigate(`/objectifs/${objectifId}`); // redirige vers la page de détail
};


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const perfResp = await api.get('/dashboard-agent/');
        const data = perfResp.data;

        setAgent(data);
        setPerformance(Number(data.performance_moyenne) || 0);
        setPeriodeEnCours(data.periode_en_cours || 'Aucune');

        const objResp = await api.get('/agent-objectifs/');
        setObjectifs(objResp.data);

        const fbResp = await api.get('/agent-feedbacks/');
        setFeedbacks(fbResp.data);

        const histResp = await api.get('/agent-historique-performances/');
        setHistorique(histResp.data);

        const noteResp = await api.get('/note-finales/');
        if (noteResp.data && noteResp.data.length > 0) {
          setNoteFinale(noteResp.data[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord :', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Typography align="center">Chargement des données...</Typography>;
  if (!agent) return <Typography align="center" color="error">Aucune donnée agent disponible.</Typography>;

  // Calcul indicateurs
  const objectifsAtteints = objectifs.filter(o => o.taux_avancement >= 100).length;

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Profil agent */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Tableau de bord agent</Typography>
          <Typography>Bonjour, <strong>{agent.nom} {agent.prenom}</strong> — Matricule : <strong>{agent.matricule}</strong></Typography>
          <Typography>Service : {agent.service_nom || 'Non défini'}</Typography>
          <Typography>Responsable hiérarchique : {agent.responsable_nom || 'Non défini'}</Typography>
          <Box mt={2}>
            <Typography variant="subtitle1">Performance moyenne :</Typography>
            <LinearProgress variant="determinate" value={performance} />
            <Typography>{performance.toFixed(2)}%</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Indicateurs clés */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200, textAlign: 'center', p: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 40, color: 'green' }} />
          <Typography variant="subtitle2" color="textSecondary">Objectifs atteints</Typography>
          <Typography variant="h5">{objectifsAtteints}/{objectifs.length}</Typography>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200, textAlign: 'center', p: 2 }}>
          <StarIcon sx={{ fontSize: 40, color: '#fbc02d' }} />
          <Typography variant="subtitle2" color="textSecondary">Dernière note finale</Typography>
          <Typography variant="h5">
            {noteFinale && noteFinale.note_finale != null
              ? Number(noteFinale.note_finale).toFixed(2) + '%'
              : '—'}
          </Typography>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200, textAlign: 'center', p: 2 }}>
          <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2' }} />
          <Typography variant="subtitle2" color="textSecondary">Période en cours</Typography>
          <Typography variant="h5">{periodeEnCours}</Typography>
        </Card>
      </Box>

      {/* Objectifs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Mes objectifs</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Libellé</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Poids</TableCell>
                <TableCell>Taux d’avancement</TableCell>
                <TableCell>Validation</TableCell>
                <TableCell>Délai</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objectifs.map((obj, i) => {
                const statut = obj.statut; // 'en_attente', 'valide' ou 'rejete'

                const labelsStatut: Record<string, string> = {
                  en_attente: '⏳ En attente',
                  valide: '✅ Validé',
                  rejete: '❌ Rejeté',
                };

                const couleursStatut: Record<string, string> = {
                  en_attente: 'gray',
                  valide: 'green',
                  rejete: 'red',
                };


                return (
                  <TableRow
        key={obj.id}
        hover
        style={{ cursor: 'pointer' }}
        onClick={() => handleVoirDetails(obj.id)} // fonction pour afficher le détail
      >
        <TableCell>{obj.libelle}</TableCell>
        <TableCell>{obj.type_kpi}</TableCell>
        <TableCell>{obj.poids}%</TableCell>
        <TableCell>{obj.taux_avancement}%</TableCell>
        <TableCell style={{ color: couleursStatut[statut], fontWeight: 'bold' }}>
          {labelsStatut[statut]}
        </TableCell>
        <TableCell>
          {new Date(obj.date_debut).toLocaleDateString()} – {new Date(obj.date_delai).toLocaleDateString()}
        </TableCell>
      </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historique des performances */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Évolution de ma performance</Typography>
          <Line
            data={{
              labels: historique.map(h => new Date(h.date).toLocaleDateString()),
              datasets: [
                {
                  label: 'Performance (%)',
                  data: historique.map(h => h.performance),
                  fill: false,
                  borderColor: '#1976d2',
                  tension: 0.3,
                },
              ],
            }}
            options={{
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Feedbacks récents */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Derniers feedbacks</Typography>
          {feedbacks.length === 0 ? (
            <Typography>Aucun feedback disponible.</Typography>
          ) : (
            <List>
              {feedbacks.map((fb, i) => (
                <React.Fragment key={i}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={fb.description || '—'}
                      secondary={`Objectif : ${fb.objectif_libelle} — ${new Date(fb.date_soumission).toLocaleDateString()}`}
                    />
                  </ListItem>
                  {i < feedbacks.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

    </Box>
  );
};

export default AgentDashboard;
