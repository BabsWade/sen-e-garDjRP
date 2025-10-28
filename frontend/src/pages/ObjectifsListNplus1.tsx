import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Box,
  Button,
  Grid,
  Chip,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Link, useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
interface Objectif {
  id: number;
  libelle: string;
  agent_nom_complet: string;
  service_nom: string;
  periode_nom: string;
  poids: number;
  taux_avancement: number;
  statut: string;
  date_creation: string;
}

const ObjectifsListNplus1: React.FC = () => {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        const response = await api.get("/objectifs/");
        setObjectifs(response.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des objectifs.");
      } finally {
        setLoading(false);
      }
    };
    fetchObjectifs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          🎯 Objectifs créés par vous (Responsable N+1)
        </Typography>
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
              Créer un objectif
            </Button>
      </Box>

      {objectifs.length === 0 ? (
        <Typography>Aucun objectif créé pour le moment.</Typography>
      ) : (
        <Grid container spacing={3}>
          {objectifs.map((obj) => (
            <Grid item xs={12} sm={6} md={4} key={obj.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                }}
              >
                <CardHeader
                  title={obj.libelle}
                  subheader={`Agent : ${obj.agent_nom_complet}`}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Service : {obj.service_nom || "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Période : {obj.periode_nom || "—"}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    Poids : <strong>{obj.poids}%</strong>
                  </Typography>
                  <Typography variant="body2">
                    Taux d’avancement : <strong>{obj.taux_avancement}%</strong>
                  </Typography>
                  <Box mt={2}>
                    <Chip
                      label={obj.statut}
                      color={
                        obj.statut === "valide"
                          ? "success"
                          : obj.statut === "rejete"
                          ? "error"
                          : "warning"
                      }
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ObjectifsListNplus1;
