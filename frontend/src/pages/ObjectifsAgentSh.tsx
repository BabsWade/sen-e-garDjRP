import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";

interface Objectif {
  id: number;
  intitule: string;
  indicateur: string;
  cible: number;
  poids: number;
  periode: string;
  statut: string;
}

interface Agent {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  service_nom: string;
}

interface AgentData {
  agent: Agent;
  objectifs: Objectif[];
}

const ObjectifsAgentSh: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // On récupère les objectifs de l'agent sous ce responsable
        const res = await api.get(`/agents-sous-responsable/${id}/`);
        setData(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des objectifs :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography>Aucune donnée trouvée pour cet agent.</Typography>;
  }

  const { agent, objectifs } = data;

  return (
    <Box sx={{ padding: 4 }}>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        ← Retour
      </Button>

      <Paper sx={{ padding: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Fiche de l’Agent
        </Typography>
        <Typography><strong>Nom :</strong> {agent.nom} {agent.prenom}</Typography>
        <Typography><strong>Matricule :</strong> {agent.matricule}</Typography>
        <Typography><strong>Service :</strong> {agent.service_nom}</Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Objectifs assignés
      </Typography>

      {objectifs.length === 0 ? (
        <Typography>Aucun objectif assigné pour cet agent.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Intitulé</strong></TableCell>
                <TableCell><strong>Indicateur</strong></TableCell>
                <TableCell><strong>Cible</strong></TableCell>
                <TableCell><strong>Poids</strong></TableCell>
                <TableCell><strong>Période</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objectifs.map((obj) => (
                <TableRow key={obj.id}>
                  <TableCell>{obj.intitule}</TableCell>
                  <TableCell>{obj.indicateur}</TableCell>
                  <TableCell>{obj.cible}</TableCell>
                  <TableCell>{obj.poids}</TableCell>
                  <TableCell>{obj.periode}</TableCell>
                  <TableCell>{obj.statut}</TableCell>
                  <TableCell align="center">
                  <Button
  variant="contained"
  size="small"
  onClick={() => navigate(`/objectifs/${obj.id}`)} // <-- redirige vers la même page de détails
>
  Voir détails
</Button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ObjectifsAgentSh;
