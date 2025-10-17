// src/components/Sidebar.tsx
// src/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
    return (
        <nav className="sidebar">
            <ul>
                <li><Link to="/objectifs">Mes Objectifs</Link></li>
                <li><Link to="/objectifs/create">Proposer un Objectif</Link></li>
                <li><Link to="/realisations">Mes Réalisations</Link></li>
                <li><Link to="/realisations/create">Saisir une Réalisation</Link></li>
                <li><Link to="/auto-evaluation">Auto‑Évaluation</Link></li>
                <li><Link to="/evaluation">Évaluation Finale</Link></li>
                <li><Link to="/contestation">Contester Évaluation</Link></li>
                <li><Link to="/historique">Historique</Link></li>
                <li><Link to="/notifications">Notifications</Link></li>
                <li><Link to="/profil">Mon Profil</Link></li>
            </ul>
        </nav>
    );
};

export default Sidebar;
