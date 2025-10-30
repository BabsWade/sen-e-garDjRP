import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';

const ObjectifsSousResponsable: React.FC = () => {
  const [objectifs, setObjectifs] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    agent: '',
    libelle: '',
    cible: '',
    poids: '',
    type_kpi: '',
  });
  const [searchAgent, setSearchAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // --- Nouveaux états pour les dialogs ---
  const [openRejetDialog, setOpenRejetDialog] = useState(false);
  const [openModifierDialog, setOpenModifierDialog] = useState(false);
  const [openValiderDialog, setOpenValiderDialog] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [nouvelleCible, setNouvelleCible] = useState<number | ''>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    const res = await api.get('/objectifs-sous-responsable/');
    setObjectifs(res.data);
  };

  const fetchAgents = async () => {
    const res = await api.get('/agents-sous-responsable/');
    setAgents(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchAgents();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post('/objectifs-sous-responsable/', {
        ...form,
        cible: Number(form.cible),
        poids: Number(form.poids),
      });
      setOpen(false);
      setForm({ agent: '', libelle: '', cible: '', poids: '', type_kpi: '' });
      fetchData();
      setMessage({ type: 'success', text: 'Objectif créé ✅' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors de la création' });
    }
  };

  // === Handlers pour les dialogs ===
  const openDialogRejet = (id: number) => {
    setSelectedId(id);
    setCommentaire('');
    setOpenRejetDialog(true);
  };

  const handleRejeter = async () => {
    if (!selectedId) return;
    try {
      await api.post(`/objectifs-superieur/${selectedId}/rejeter/`, { commentaire_rejet: commentaire });
      fetchData();
      setMessage({ type: 'success', text: 'Objectif rejeté ❌' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors du rejet' });
    } finally {
      setOpenRejetDialog(false);
    }
  };

  const openDialogModifier = (id: number, libelle: string, cible: number) => {
    setSelectedId(id);
    setNouveauLibelle(libelle);
    setNouvelleCible(cible);
    setOpenModifierDialog(true);
  };

  const handleModifier = async () => {
    if (!selectedId) return;
    try {
      await api.put(`/objectifs-superieur/${selectedId}/modifier/`, {
        libelle: nouveauLibelle,
        cible: nouvelleCible,
      });
      fetchData();
      setMessage({ type: 'success', text: 'Objectif modifié ✏️' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors de la modification' });
    } finally {
      setOpenModifierDialog(false);
    }
  };

  const openDialogValider = (id: number) => {
    setSelectedId(id);
    setOpenValiderDialog(true);
  };

  const handleValider = async () => {
    if (!selectedId) return;
    try {
      await api.post(`/objectifs-superieur/${selectedId}/valider/`);
      fetchData();
      setMessage({ type: 'success', text: 'Objectif validé ✅' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors de la validation' });
    } finally {
      setOpenValiderDialog(false);
    }
  };

  const filteredObjectifs = objectifs.filter((obj) => {
    const agentMatch = searchAgent
      ? obj.agent.toLowerCase().includes(searchAgent.toLowerCase())
      : true;
    const statusMatch = filterStatus ? obj.statut === filterStatus : true;
    return agentMatch && statusMatch;
  });

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        🎯 Objectifs des agents supervisés
      </Typography>

      {/* Barre de filtres */}
      <Box mb={2} display="flex" gap={2}>
        <TextField
          label="Rechercher par agent"
          value={searchAgent}
          onChange={(e) => setSearchAgent(e.target.value)}
        />
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="en_attente">En attente</MenuItem>
            <MenuItem value="valide">Validé</MenuItem>
            <MenuItem value="rejete">Rejeté</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          + Créer un objectif
        </Button>
      </Box>

      {/* Liste des objectifs */}
      <Box>
        {filteredObjectifs.map((obj) => (
          <Card key={obj.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{obj.libelle}</Typography>
              <Typography variant="body2">Agent : {obj.agent}</Typography>
              <Typography variant="body2">Statut : {obj.statut}</Typography>
              <Typography variant="body2">KPI : {obj.type_kpi}</Typography>
              <Typography variant="body2">Cible : {obj.cible}</Typography>
              <Typography variant="body2">Poids : {obj.poids}</Typography>

              <Box mt={1} display="flex" gap={1}>
                {obj.statut !== 'valide' && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => openDialogValider(obj.id)}
                  >
                    Valider
                  </Button>
                )}
                {obj.statut !== 'rejete' && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => openDialogRejet(obj.id)}
                  >
                    Rejeter
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => openDialogModifier(obj.id, obj.libelle, obj.cible)}
                >
                  Modifier
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* === Dialog de création === */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Créer un nouvel objectif</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                select
                label="Agent"
                name="agent"
                value={form.agent}
                onChange={handleChange}
                fullWidth
              >
                {agents.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.prenom} {a.nom}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Libellé" name="libelle" value={form.libelle} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Cible" name="cible" value={form.cible} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Poids" name="poids" value={form.poids} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Type KPI"
                name="type_kpi"
                value={form.type_kpi}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="Quantité">Quantité</MenuItem>
                <MenuItem value="Qualité">Qualité</MenuItem>
                <MenuItem value="Délai">Délai</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* === Dialog Rejet === */}
      <Dialog open={openRejetDialog} onClose={() => setOpenRejetDialog(false)}>
        <DialogTitle>Rejeter l’objectif</DialogTitle>
        <DialogContent>
          <TextField
            label="Motif du rejet"
            fullWidth
            multiline
            rows={3}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejetDialog(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleRejeter}>
            Confirmer le rejet
          </Button>
        </DialogActions>
      </Dialog>

      {/* === Dialog Modifier === */}
      <Dialog open={openModifierDialog} onClose={() => setOpenModifierDialog(false)}>
        <DialogTitle>Modifier l’objectif</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Libellé"
            fullWidth
            value={nouveauLibelle}
            onChange={(e) => setNouveauLibelle(e.target.value)}
          />
          <TextField
            label="Cible"
            type="number"
            fullWidth
            value={nouvelleCible}
            onChange={(e) => setNouvelleCible(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModifierDialog(false)}>Annuler</Button>
          <Button variant="contained" color="primary" onClick={handleModifier}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* === Dialog Validation === */}
      <Dialog open={openValiderDialog} onClose={() => setOpenValiderDialog(false)}>
        <DialogTitle>Valider l’objectif</DialogTitle>
        <DialogContent>
          <Typography>Confirmez la validation de cet objectif ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenValiderDialog(false)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={handleValider}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* === Snackbar feedback === */}
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={message?.type}>{message?.text}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ObjectifsSousResponsable;
