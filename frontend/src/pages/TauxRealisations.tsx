import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useParams } from "react-router-dom";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface TauxRealisations {
  agent: number;
  taux_realisations_valides: number;
  date_calcul: string;
}

const TauxRealisations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dataPoints, setDataPoints] = useState<TauxRealisations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTauxRealisations = async () => {
      try {
        const response = await axios.get<TauxRealisations[]>(
          `http://127.0.0.1:8000/api/accounts/taux-realisations/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        setDataPoints(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement du taux :", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTauxRealisations();
  }, [id]);

  if (loading) return <Typography>Chargement...</Typography>;

  const labels = dataPoints.map((item) =>
    new Date(item.date_calcul).toLocaleDateString()
  );
  const tauxData = dataPoints.map((item) => item.taux_realisations_valides);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Taux de réalisations validées (%)",
        data: tauxData,
        borderColor: "#E53935", // 🔴 rouge
        backgroundColor: "rgba(229, 57, 53, 0.3)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Évolution du taux de réalisations validées
          </Typography>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" as const },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: { display: true, text: "Pourcentage (%)" },
                },
                x: {
                  title: { display: true, text: "Date" },
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default TauxRealisations;
