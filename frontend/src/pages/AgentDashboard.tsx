import React, { useEffect, useState } from 'react';
import api from '../api';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const AgentDashboard: React.FC = () => {
  const [agent, setAgent] = useState<any>(null);
  const [performance, setPerformance] = useState<number>(0);
  const [objectifs, setObjectifs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 🔹 1. Données agent + performance
        const perfResp = await api.get('/performance-agent/');
        setAgent(perfResp.data);
        setPerformance(perfResp.data.performance_moyenne || 0);

        // 🔹 2. Objectifs individuels
        const objResp = await api.get('/agent-objectifs/');
        setObjectifs(objResp.data);

        // 🔹 3. Feedbacks récents
        const fbResp = await api.get('/agent-feedbacks/');
        setFeedbacks(fbResp.data);

        // 🔹 4. Historique performances
        const histResp = await api.get('/agent-historique-performances/');
        setHistorique(histResp.data);

        setLoading(false);
      } catch (error) {
        console.error('Erreur de chargement du tableau de bord :', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p>Chargement des données...</p>;
  if (!agent) return <p>Aucune donnée agent disponible.</p>;

  return (
    <div className="p-6 space-y-8">
      {/* 👤 Profil agent */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Tableau de bord agent</h1>
        <p className="text-gray-700">
          Bonjour, <strong>{agent.nom} {agent.prenom}</strong> — Matricule : <strong>{agent.matricule}</strong>
        </p>
        <p className="text-gray-600">Service : {agent.service_nom}</p>
        <p className="text-gray-600">Responsable hiérarchique : {agent.responsable_nom || 'Non défini'}</p>
        <p className="mt-3 text-lg font-semibold text-blue-600">
          Performance moyenne : {performance.toFixed(2)}%
        </p>
      </div>

      {/* 🎯 Objectifs */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Mes objectifs</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600">
              <th className="p-2">Intitulé</th>
              <th className="p-2">Pondération</th>
              <th className="p-2">Note</th>
              <th className="p-2">Performance</th>
              <th className="p-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {objectifs.map((obj, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2">{obj.description}</td>
                <td className="p-2">{obj.ponderation}%</td>
                <td className="p-2">{obj.note}</td>
                <td className="p-2">{(obj.note * obj.ponderation / 100).toFixed(2)}%</td>
                <td className="p-2">{obj.statut || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📈 Graphique de performance */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Évolution de ma performance</h2>
        <Line
          data={{
            labels: historique.map(h => h.annee),
            datasets: [
              {
                label: 'Performance annuelle',
                data: historique.map(h => h.note_globale),
                fill: false,
                borderColor: '#2563eb',
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
      </div>

      {/* 💬 Feedbacks récents */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Derniers feedbacks</h2>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">Aucun feedback disponible.</p>
        ) : (
          <ul className="space-y-3">
            {feedbacks.map((fb, i) => (
              <li key={i} className="border-l-4 border-blue-500 pl-3">
                <p className="text-gray-700 text-sm">{fb.commentaire}</p>
                <p className="text-gray-500 text-xs">
                  {fb.auteur} — {new Date(fb.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
