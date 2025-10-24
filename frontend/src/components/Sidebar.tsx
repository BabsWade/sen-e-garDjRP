// src/components/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Divider } from '@mui/material';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {[
          { text: 'Mes Objectifs', path: '/objectifs' },
          { text: 'Proposer un Objectif', path: '/objectifs/create' },
          { text: 'Mes Réalisations', path: '/realisations' },
          { text: 'Saisir une Réalisation', path: '/realisations/create' },
          { text: 'Auto‑Évaluation', path: '/auto-evaluation' },
          { text: 'Évaluation Finale', path: '/evaluation' },
          { text: 'Contester Évaluation', path: '/contestation' },
          { text: 'Historique', path: '/historique' },
          { text: 'Notifications', path: '/notifications' },
          { text: 'Mon Profil', path: '/profil' },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
