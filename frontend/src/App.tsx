import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';
import N1Dashboard from './pages/N1Dashboard';
import DRHDashboard from './pages/DRHDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/agent-dashboard" element={<AgentDashboard />} />
      <Route path="/n1-dashboard" element={<N1Dashboard />} />
      <Route path="/drh-dashboard" element={<DRHDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default App;
