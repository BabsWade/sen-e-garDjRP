import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Grid,
    Avatar,
    Chip,
    LinearProgress,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useNavigate } from 'react-router-dom';
import SidebarNplus1 from '../components/SidebarNplus1';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Agent {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    service_nom: string;
    performance_moyenne: number;
    etat_agent: string;
}

const AgentsSupervises: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [responsable, setResponsable] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await api.get('/accounts/mes-agents/');
                setAgents(resp.data);

                const userResp = await api.get('/dashboard-agent/'); // ou ton endpoint pour le responsable connecté
                setResponsable(userResp.data);
            } catch (err) {
                console.error('Erreur lors du chargement des agents supervisés :', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleViewDetails = (id: number) => {
        navigate(`/agents/${id}`);
      };
    const handleVoirProfil = (id: number) => {
        navigate(`/agent/${id}`); // Page profil d’un agent (à créer si besoin)
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f6f8fc', minHeight: '100vh' }}>
            <Topbar title="Agents Supervisés" handleDrawerToggle={handleDrawerToggle} agent={responsable} />
            <SidebarNplus1 mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    width: { md: `calc(100% - 240px)` },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}
            >
                {/* En-tête avec cartes statistiques */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ bgcolor: '#d2ffd8', textAlign: 'center', p: 2 }}>
                            <PeopleIcon sx={{ fontSize: 40, color: 'green' }} />
                            <Typography variant="h6">Nombre total d’agents supervisés</Typography>
                            <Typography variant="h4">{agents.length}</Typography>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ bgcolor: '#cfe2ff', textAlign: 'center', p: 2 }}>
                            <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                            <Typography variant="h6">Performance moyenne globale</Typography>
                            <Typography variant="h4">
                                {agents.length > 0
                                    ? (
                                        agents.reduce((sum, a) => sum + (a.performance_moyenne || 0), 0) /
                                        agents.length
                                    ).toFixed(2) + '%'
                                    : '—'}
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tableau des agents */}
                <Card sx={{ p: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Liste des agents sous ma supervision
                        </Typography>

                        {loading ? (
                            <LinearProgress />
                        ) : agents.length === 0 ? (
                            <Typography>Aucun agent supervisé trouvé.</Typography>
                        ) : (
                            <Table>
                                
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Agent</TableCell>
                                        <TableCell>Matricule</TableCell>
                                        <TableCell>Service</TableCell>
                                        <TableCell>Performance</TableCell>
                                        <TableCell>État</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {agents.map((a) => (
                                        <TableRow key={a.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar>{a.prenom[0]}</Avatar>
                                                    <Typography>{a.prenom} {a.nom}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{a.matricule}</TableCell>
                                            <TableCell>{a.service_nom || '—'}</TableCell>
                                            <TableCell>
                                                <Typography color="primary">
                                                    {a.performance_moyenne != null
                                                        ? Number(a.performance_moyenne).toFixed(2) + "%"
                                                        : "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={a.etat_agent || 'Inconnu'}
                                                    color={
                                                        a.etat_agent === 'ACTIF'
                                                            ? 'success'
                                                            : a.etat_agent === 'INACTIF'
                                                                ? 'default'
                                                                : 'warning'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<VisibilityIcon />}
                                                    sx={{
                                                      bgcolor: '#1976d2',
                                                      '&:hover': { bgcolor: '#115293' },
                                                      borderRadius: 2,
                                                      px: 3,
                                                    }}
                                                    onClick={() => handleViewDetails(a.id)}
                                                >
                                                    Voir détails
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default AgentsSupervises;