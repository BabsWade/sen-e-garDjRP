import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface Agent {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  service_nom: string;
  performance_moyenne: number;
}

const AgentsSupervisesSh: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get("/agents-sous-responsable/");
        setAgents(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des agents :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Agents Supervisés
      </Typography>

      {agents.length === 0 ? (
        <Typography>Aucun agent supervisé trouvé.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Matricule</strong></TableCell>
                <TableCell><strong>Nom & Prénom</strong></TableCell>
                <TableCell><strong>Service</strong></TableCell>
                <TableCell><strong>Performance Moyenne</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>{agent.matricule}</TableCell>
                  <TableCell>{agent.nom} {agent.prenom}</TableCell>
                  <TableCell>{agent.service_nom}</TableCell>
                  <TableCell>{agent.performance_moyenne.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/agents/${agent.id}/objectifs`)}
                    >
                      Voir Objectifs
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

export default AgentsSupervisesSh;
