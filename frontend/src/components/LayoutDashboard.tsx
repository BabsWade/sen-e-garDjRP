import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface Props {
  children: React.ReactNode;
  agent?: { nom: string; prenom: string; avatar?: string };
}

const LayoutDashboard: React.FC<Props> = ({ children, agent }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Topbar handleDrawerToggle={handleDrawerToggle} agent={agent} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default LayoutDashboard;
