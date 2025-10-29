import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Divider,
  Typography,
  Box,
  Collapse,
} from '@mui/material';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import logo from '../assets/logo-senegar-bon.png';

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const drawerWidth = 300;

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();

  // États pour les sous-menus
  const [openMoi, setOpenMoi] = useState(true);
  const [openEquipe, setOpenEquipe] = useState(false);
  const [openParametres, setOpenParametres] = useState(false);

  const handleToggle = (section: string) => {
    if (section === 'moi') setOpenMoi(!openMoi);
    if (section === 'equipe') setOpenEquipe(!openEquipe);
    if (section === 'parametres') setOpenParametres(!openParametres);
  };

  const drawer = (
    <Box sx={{ bgcolor: '#fff', height: '100%' }}>
      {/* LOGO HEADER */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 0 }}>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box component="img" src={logo} alt="Logo" sx={{ height: 65, width: 'auto' }} />
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Divider />

      <List>

        {/* --- ESPACE MOI (Agent) --- */}
        <ListItemButton onClick={() => handleToggle('moi')}>
          <ListItemIcon><PersonIcon sx={{ color: '#005288' }} /></ListItemIcon>
          <ListItemText primary="Espace Moi (Agent)" />
          {openMoi ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMoi} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 4 }}>
            <ListItemButton component={Link} to="/dashboard" selected={location.pathname === '/dashboard'}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton component={Link} to="/objectifs" selected={location.pathname === '/objectifs'}>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Mes Objectifs" />
            </ListItemButton>
            <ListItemButton component={Link} to="/realisations" selected={location.pathname === '/realisations'}>
              <ListItemIcon><AssignmentIcon /></ListItemIcon>
              <ListItemText primary="Mes Réalisations" />
            </ListItemButton>
            <ListItemButton component={Link} to="/auto-evaluation" selected={location.pathname === '/auto-evaluation'}>
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText primary="Mon Auto-évaluation" />
            </ListItemButton>
            <ListItemButton component={Link} to="/historique" selected={location.pathname === '/historique'}>
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText primary="Historique de Performance" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />

        {/* --- ESPACE MON ÉQUIPE (Supérieur hiérarchique) --- */}
        <ListItemButton onClick={() => handleToggle('equipe')}>
          <ListItemIcon><PeopleIcon sx={{ color: '#005288' }} /></ListItemIcon>
          <ListItemText primary="Espace Mon Équipe" />
          {openEquipe ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openEquipe} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 4 }}>
            <ListItemButton component={Link} to="/mes-subordonnees" selected={location.pathname === '/mes-subordonnees'}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Agents Supervisés" />
            </ListItemButton>
            <ListItemButton component={Link} to="/equipe/objectifs" selected={location.pathname === '/equipe/objectifs'}>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Objectifs de l’Équipe" />
            </ListItemButton>
            <ListItemButton component={Link} to="/equipe/suivi" selected={location.pathname === '/equipe/suivi'}>
              <ListItemIcon><AssignmentIcon /></ListItemIcon>
              <ListItemText primary="Suivi & Validation" />
            </ListItemButton>
            <ListItemButton component={Link} to="/equipe/evaluations" selected={location.pathname === '/equipe/evaluations'}>
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText primary="Évaluations de l’Équipe" />
            </ListItemButton>
            <ListItemButton component={Link} to="/equipe/reporting" selected={location.pathname === '/equipe/reporting'}>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="Reporting & Analyse" />
            </ListItemButton>
            <ListItemButton component={Link} to="/equipe/feedback" selected={location.pathname === '/equipe/feedback'}>
              <ListItemIcon><FeedbackIcon /></ListItemIcon>
              <ListItemText primary="Feedback Continu" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />

        {/* --- PARAMÈTRES ET SUPPORT --- */}
        <ListItemButton onClick={() => handleToggle('parametres')}>
          <ListItemIcon><SettingsIcon sx={{ color: '#005288' }} /></ListItemIcon>
          <ListItemText primary="Paramètres & Support" />
          {openParametres ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openParametres} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 4 }}>
            <ListItemButton component={Link} to="/profil" selected={location.pathname === '/profil'}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Mon Profil" />
            </ListItemButton>
            <ListItemButton component={Link} to="/notifications" selected={location.pathname === '/notifications'}>
              <ListItemIcon><NotificationsIcon /></ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>
            <ListItemButton component={Link} to="/aide-support" selected={location.pathname === '/aide-support'}>
              <ListItemIcon><HelpOutlineIcon /></ListItemIcon>
              <ListItemText primary="Aide / Support" />
            </ListItemButton>
            <ListItemButton component={Link} to="/parametres" selected={location.pathname === '/parametres'}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Paramètres" />
            </ListItemButton>
          </List>
        </Collapse>

      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          © 2025 Niond
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* MOBILE */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: '#f8fafc', borderRight: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* DESKTOP */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: '#f8fafc', borderRight: 'none' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
