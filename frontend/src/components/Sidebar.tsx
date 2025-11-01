import React from 'react';
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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/logo-senegar-bon.png';
interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const drawerWidth = 300;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, to: '/agent-dashboard' },
  { text: 'Objectifs', icon: <BarChartIcon />, to: '/objectifs' },
  { text: 'Auto‑Évaluation', icon: <AssignmentIcon />, to: '/auto-evaluation' },
  { text: 'Évaluation Finale', icon: <PeopleIcon />, to: '/evaluation' },
  { text: 'Contester Évaluation', icon: <BarChartIcon />, to: '/contestation' },
  { text: 'Historique de performance', icon: <SettingsIcon />, to: '/historique-evaluations/' },
  { text: 'Mon Profil', icon: <PeopleIcon />, to: '/profil' },
  { text: 'Notifications', icon: <SettingsIcon />, to: '/notifications' },
  { text: 'Aide / Support', icon: <SettingsIcon />, to: '/aide-support' },
  

];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();

  const drawer = (
    <Box sx={{ bgcolor: '#fff', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 0 }}>
      <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{ height: 65, width: 'auto' }}
          />
        </Box>
        <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.to}
            selected={location.pathname === item.to}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&:hover': { bgcolor: '#4CAF50' },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.to ? '#005288' : '#4d4d4d' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
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
      {/* Mobile drawer */}
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

      {/* Desktop drawer */}
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
