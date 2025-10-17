import React, { useState, useEffect } from 'react';
import api from '../api';

const AgentDashboard: React.FC = () => {
  const [performance, setPerformance] = useState<number>(0);
  const [agentData, setAgentData] = useState<any>(null);

  useEffect(() => {
    const fetchPerf = async () => {
      try {
        const resp = await api.get('/performance-agent/');
        console.log('Données agent performance :', resp.data);
        console.log('Réponse complète /performance-agent/', resp);

        setAgentData(resp.data);
        setPerformance(resp.data.performance_moyenne);
      } catch (error) {
        console.error('Erreur fetch performance-agent :', error);
      }
    };

    fetchPerf();
  }, []);

  return (
    <div>
      <h1>Tableau de bord agent</h1>
      {agentData && (
        <div>
          <p>
            Bonjour, {agentData.nom} {agentData.prenom} (Matricule : {agentData.id})
          </p>
          <p>
            Performance moyenne : <strong>{performance.toFixed(2)}%</strong>
          </p>
        </div>
      )}
      {/* Ici tu peux aussi afficher les objectifs, réalisations, etc. */}
    </div>
  );
};

export default AgentDashboard;
