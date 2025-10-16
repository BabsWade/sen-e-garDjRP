// src/pages/AgentHome.tsx
import React, { useEffect, useState } from 'react';
import API from '../api';  // Ton instance Axios configurée
import Dashboard from '../components/Dashboard';
import Notifications from '../components/Notifications';
import Sidebar from '../components/Sidebar';


const AgentHome: React.FC = () => {
  const [objectifs, setObjectifs] = useState<any[]>([]);
  const [performance, setPerformance] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Charger les objectifs de l'agent
    API.get('/objectifs/')
      .then((response) => {
        console.log("🎯 Objectifs reçus :", response.data); // ← AJOUTE ICI

        setObjectifs(response.data);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des objectifs:', error);
      });

    // Charger les notifications de l'agent
    API.get('/notifications/')
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des notifications:', error);
      });

    // Charger la performance globale de l'agent
    API.get('/performance/')
      .then((response) => {
        setPerformance(response.data.performance_moyenne);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération de la performance:', error);
      });
  }, []);

  return (
    <div className="agent-home">
      <Sidebar />
      <main>
        <Dashboard objectifs={objectifs} performance={performance} />
        <Notifications notifications={notifications} />
      </main>
    </div>
  );
};

export default AgentHome;
