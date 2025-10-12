// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Bienvenue sur le Dashboard de Performance</h1>
      <nav>
        <ul>
          <li><Link to="/objectifs">Mes Objectifs</Link></li>
          <li><Link to="/realisations">Mes Réalisations</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
