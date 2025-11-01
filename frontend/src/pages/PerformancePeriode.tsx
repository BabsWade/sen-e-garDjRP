import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformancePoint {
  date_calcul: string;
  performance: number;
  taux_realisations_valides: number;
  periode?: string | null;
}

interface ApiResponse {
  historique: PerformancePoint[];
  instant?: PerformancePoint | null;
}

const PerformancePeriode: React.FC = () => {
  const [data, setData] = useState<ApiResponse>({ historique: [], instant: null });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await axios.get<ApiResponse>('/agent/historique-performance/');
        setData(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des performances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  if (loading) return <p>Chargement...</p>;

  // Combine historique + point instantané (optionnel)
  const points = [...data.historique];
  if (data.instant) points.push(data.instant);

  // Préparer les données pour Chart.js
  const chartData = {
    labels: points.map(p => new Date(p.date_calcul).toLocaleDateString()),
    datasets: [
      {
        label: 'Performance (%)',
        data: points.map(p => p.performance),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        yAxisID: 'y1',
      },
      {
        label: 'Taux réalisations validées (%)',
        data: points.map(p => p.taux_realisations_valides),
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        yAxisID: 'y2',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Suivi des performances et taux de réalisations validées',
      },
    },
    scales: {
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Performance (%)',
        },
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Taux réalisations validées (%)',
        },
      },
    },
  };

  return (
    <div>
      <h2>Performance par période</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PerformancePeriode;
