// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';
import N1Dashboard from './pages/N1Dashboard';
import DRHDashboard from './pages/DRHDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/register/Register';
import ActivationPage from './pages/ActivationPage';
import RegistrationSuccess from './pages/RegistrationSuccess';
import PrivateRoute from './components/PrivateRoute';
import ObjectifsPage from './pages/ObjectifsPage';
import CreerObjectif from './pages/CreerObjectif';
import Navbar from './navigation/navbar';
import AgentHome from './pages/AgentHome';
import EditObjectifPage from './pages/EditObjectifPage';
import CreateObjectifPage from './planification et alignement/CreateObjectifPage';

import RealisationsPage from './pages/RealisationsPage';
import CreateRealisationPage from './pages/CreateRealisationPage';
import EditRealisationPage from './pages/EditRealisationPage';
import AutoEvaluationPage from './pages/AutoEvaluationPage';
import ConsulterEvaluationPage from './pages/ConsulterEvaluationPage';
import ContestationPage from './pages/ContestationPage';

const App: React.FC = () => {
  return (
    <Routes>

      {/* Routes publiques */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/activation/:uid/:token" element={<ActivationPage />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes protégées par rôle */}
      <Route 
        path="/agent-dashboard" 
        element={<PrivateRoute element={<AgentDashboard />} roles={['AGENT']} />} 
      />
      <Route 
        path="/n1-dashboard" 
        element={<PrivateRoute element={<N1Dashboard />} roles={['RESPONSABLE_N1']} />} 
      />
      <Route 
        path="/drh-dashboard" 
        element={<PrivateRoute element={<DRHDashboard />} roles={['DRH']} />} 
      />
      <Route 
        path="/admin-dashboard" 
        element={<PrivateRoute element={<AdminDashboard />} roles={['ADMIN']} />} 
      />

      {/* Pour l’Agent, les pages avec Navbar */}
      <Route 
        path="/objectifs" 
        element={<PrivateRoute element={<><Navbar /><ObjectifsPage /></>} roles={['ADMIN', 'AGENT', 'DRH']} />} 
      />
      <Route 
        path="/creer-objectifs" 
        element={<PrivateRoute element={<><Navbar /><CreerObjectif /></>} roles={['ADMIN', 'AGENT', 'DRH']} />} 
      />
      <Route 
        path="/agent-home" 
        element={<PrivateRoute element={<AgentHome />} roles={['AGENT']} />} 
      />

      <Route 
        path="/objectifs/create" 
        element={<PrivateRoute element={<><Navbar /><CreateObjectifPage /></>} roles={['AGENT', 'DRH', 'ADMIN']} />} 
      />
      <Route 
        path="/objectifs/:id/edit" 
        element={<PrivateRoute element={<><Navbar /><EditObjectifPage /></>} roles={['AGENT', 'DRH', 'ADMIN']} />} 
      />

      {/* Routes Suivi & Exécution (réalisations) */}
      <Route 
        path="/realisations" 
        element={<PrivateRoute element={<><Navbar /><RealisationsPage /></>} roles={['AGENT']} />} 
      />
      <Route 
        path="/realisations/create" 
        element={<PrivateRoute element={<><Navbar /><CreateRealisationPage /></>} roles={['AGENT']} />} 
      />
      <Route 
        path="/realisations/:id/edit" 
        element={<PrivateRoute element={<><Navbar /><EditRealisationPage /></>} roles={['AGENT']} />} 
      />


<Route 
  path="/auto-evaluation"
  element={<PrivateRoute element={<><Navbar /><AutoEvaluationPage /></>} roles={['AGENT']} />}
/>

      {/* Vous pouvez aussi ajouter d’autres pages agent protégées ici */}

      {/* Route fallback */}
      <Route path="*" element={<h2>Page non trouvée</h2>} />

      <Route path="evaluation" element={<ConsulterEvaluationPage />} />
      <Route 
  path="/contestation" 
  element={<PrivateRoute element={<><Navbar /><ContestationPage /></>} roles={['AGENT']} />} 
/>


    </Routes>
  );
};

export default App;
