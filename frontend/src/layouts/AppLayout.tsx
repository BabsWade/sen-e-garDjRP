// src/layouts/AppLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AppLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
