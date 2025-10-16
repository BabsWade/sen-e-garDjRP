// src/components/Dashboard.tsx
import React from 'react';

interface DashboardProps {
  objectifs: any[];
  performance: number;
}

const Dashboard: React.FC<DashboardProps> = ({ objectifs, performance }) => {
  return (
    <div className="dashboard">
      <h2>Tableau de bord de l'Agent</h2>
      <div className="performance-summary">
        <h3>Performance globale</h3>
        <p>Performance actuelle : {performance}%</p>
      </div>
      <div className="objectives-summary">
        <h3>Objectifs en cours</h3>
        <ul>
          {objectifs.map((objectif) => (
            <li key={objectif.id}>
              <p>{objectif.libelle} - {objectif.type_kpi}</p>
              <p>Progrès : {objectif.taux_avancement}%</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
