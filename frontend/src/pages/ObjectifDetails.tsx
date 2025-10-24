import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Typography, Card, CardContent, Box } from '@mui/material';

interface Objectif {
  id: number;
  libelle: string;
  type_kpi: string;
  poids: number;
  taux_avancement: number;
  date_debut: string;
  date_delai: string;
  commentaire_rejet?: string;
}

const ObjectifDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [objectif, setObjectif] = useState<Objectif | null>(null);

  useEffect(() => {
    const fetchObjectif = async () => {
      try {
        const res = await api.get(`/agent-objectifs/${id}/`);
        setObjectif(res.data);
      } catch (error) {
        console.error('Erreur fetch objectif:', error);
      }
    };

    fetchObjectif();
  }, [id]);

  if (!objectif) return <Typography>Chargement...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">{objectif.libelle}</Typography>
          <Typography>Type KPI: {objectif.type_kpi}</Typography>
          <Typography>Poids: {objectif.poids}%</Typography>
          <Typography>Taux d’avancement: {objectif.taux_avancement}%</Typography>
          <Typography>Date début: {objectif.date_debut}</Typography>
          <Typography>Date délai: {objectif.date_delai}</Typography>
          {objectif.commentaire_rejet && <Typography>Commentaire rejet: {objectif.commentaire_rejet}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ObjectifDetails;
