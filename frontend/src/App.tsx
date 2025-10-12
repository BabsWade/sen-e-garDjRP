import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';
import N1Dashboard from './pages/N1Dashboard';
import DRHDashboard from './pages/DRHDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import ActivationPage from './pages/ActivationPage';
import RegistrationSuccess from './pages/RegistrationSuccess';
import PrivateRoute from './components/PrivateRoute';
import ObjectifsPage from './pages/ObjectifsPage';
import CreerObjectif from './pages/CreerObjectif';
import Navbar from './navigation/navbar';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/activation/:uid/:token" element={<ActivationPage />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />

      {/* Routes de connexion */}
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
      <Route 
        path="/objectifs" 
        element={<PrivateRoute element={<><Navbar /><ObjectifsPage /></>} roles={['ADMIN', 'AGENT', 'DRH']} />} 
      />
       <Route 
        path="/creer-objectifs" 
        element={<PrivateRoute element={<><Navbar /><CreerObjectif /></>} roles={['ADMIN', 'AGENT', 'DRH']} />} 
      />

      
    </Routes>
  );
};

export default App;
