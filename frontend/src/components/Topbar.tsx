import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

interface TopbarProps {
  handleDrawerToggle: () => void;
  agent?: any;
  title?: string; // ← titre dynamique
}

const Topbar: React.FC<TopbarProps> = ({ handleDrawerToggle, agent, title }) => {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - 300px)` },
        ml: { md: `240px` },
        bgcolor: '#fff',
        color: '#000',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            {title || 'Dashboard'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {today}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          <IconButton>
            <SettingsIcon />
          </IconButton>
          <Avatar
            alt={agent ? `${agent.nom} ${agent.prenom}` : 'Agent'}
            src="/static/images/avatar/1.jpg"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
