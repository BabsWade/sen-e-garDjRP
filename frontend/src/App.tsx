// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';
import N1Dashboard from './pages/N1Dashboard';
import DRHDashboard from './pages/DRHDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/register/Register';
import ActivationPage from './pages/ActivationPage';
import RegistrationSuccess from './pages/RegistrationSuccess';
import PrivateRoute from './components/PrivateRoute';
import ObjectifsPage from './pages/ObjectifsPage';
import CreerObjectif from './pages/CreerObjectif';
import Navbar from './navigation/navbar';
import AgentHome from './pages/AgentHome';
import EditObjectifPage from './pages/EditObjectifPage';
import CreateObjectifPage from './planification et alignement/CreateObjectifPage';

import RealisationsPage from './pages/RealisationsPage';
import CreateRealisationPage from './pages/CreateRealisationPage';
import EditRealisationPage from './pages/EditRealisationPage';
import AutoEvaluationPage from './pages/AutoEvaluationPage';
import ConsulterEvaluationPage from './pages/ConsulterEvaluationPage';
import ContestationPage from './pages/ContestationPage';
import Dashboard from './components/Dashboard';
import ObjectifDetails from './pages/ObjectifDetails';
import Sidebar from './components/Sidebar';
import AgentsSupervises from './pages/AgentsSupervises';
import AgentDetailsPage from './pages/AgentDetailsPage';
import AgentsSupervisesPage from './pages/AgentsSupervisesPage';
import ObjectifDetailsNplus1 from './pages/ObjectifDetailsNplus1';
import Nplus1ObjectifList from './pages/Nplus1ObjectifList';
import ObjectifsListNplus1 from './pages/ObjectifsListNplus1';
import MesSubordonnees from './pages/MesSubordonnees';
import SubordonneesObjectifs from './pages/SubordonneesObjectifs';
import ObjectifSubordonnees from './pages/ObjectifSubordonnees';
import InfosObjectif from './pages/InfosObjectif';
import ObjectifsSousResponsable from './pages/ObjectifsSousResponsable';

const App: React.FC = () => {
  return (
    <div>
      <Routes>

        {/* Routes publiques */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/activation/:uid/:token" element={<ActivationPage />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées par rôle */}

        <Route
          path="/n1-dashboard"
          element={<PrivateRoute element={<N1Dashboard />} roles={['RESPONSABLE_N1']} />}
        />
        <Route
          path="/accounts/mes-agents"
          element={<PrivateRoute element={<AgentsSupervises />} roles={['RESPONSABLE_N1']} />}
        />
        <Route
          path="/agents/:id"
          element={<PrivateRoute element={<AgentDetailsPage />} roles={['RESPONSABLE_N1']} />}
        />
        <Route
          path="/agents-sous-responsable"
          element={<PrivateRoute element={<AgentsSupervisesPage />} roles={['RESPONSABLE_N1']} />}
        />
        <Route
          path="/objectiflistnplus1"
          element={<PrivateRoute element={<Nplus1ObjectifList />} roles={['RESPONSABLE_N1']} />}
        />
        <Route
          path="/objectifslistnplus1"
          element={<PrivateRoute element={<ObjectifsListNplus1 />} roles={['RESPONSABLE_N1']} />}
        />

        <Route
          path="/objectifdetailsnplus1/:id"
          element={<PrivateRoute element={<ObjectifDetailsNplus1 />} roles={['RESPONSABLE_N1']} />}
        />


        <Route
          path="/drh-dashboard"
          element={<PrivateRoute element={<DRHDashboard />} roles={['DRH']} />}
        />
        <Route
          path="/admin-dashboard"
          element={<PrivateRoute element={<AdminDashboard />} roles={['ADMIN']} />}
        />

        {/* Pour l’Agent, les pages avec Navbar */}
        <Route
          path="/objectifs"
          element={<PrivateRoute element={<><Navbar /><ObjectifsPage /></>} roles={['ADMIN', 'AGENT', 'DRH', 'RESPONSABLE_N1']} />}
        />
        <Route
          path="/creer-objectifs"
          element={<PrivateRoute element={<><Navbar /><CreerObjectif /></>} roles={['ADMIN', 'AGENT', 'DRH']} />}
        />
        <Route
          path="/agent-home"
          element={<PrivateRoute element={<AgentHome />} roles={['AGENT']} />}
        />

        <Route
          path="/objectifs/create"
          element={<PrivateRoute element={<><Navbar /><CreateObjectifPage /></>} roles={['AGENT', 'DRH', 'ADMIN', 'RESPONSABLE_N1']} />}
        />
        <Route
          path="/objectifs/:id/edit"
          element={<PrivateRoute element={<><Navbar /><EditObjectifPage /></>} roles={['AGENT', 'DRH', 'ADMIN']} />}
        />

        {/* Routes Suivi & Exécution (réalisations) */}
        <Route
          path="/realisations"
          element={<PrivateRoute element={<><Navbar /><RealisationsPage /></>} roles={['AGENT', 'RESPONSABLE_N1']} />}
        />
<Route
          path="/objectifs-sous-responsable"
          element={<PrivateRoute element={<><Navbar /><ObjectifsSousResponsable /></>} roles={['DRH', 'RESPONSABLE_N1']} />}
        />


        <Route
          path="/realisations/create"
          element={<PrivateRoute element={<><Navbar /><CreateRealisationPage /></>} roles={['AGENT']} />}
        />
        <Route
          path="/realisations/:id/edit"
          element={<PrivateRoute element={<><Navbar /><EditRealisationPage /></>} roles={['AGENT']} />}
        />


        <Route
          path="/auto-evaluation"
          element={<PrivateRoute element={<><Navbar /><AutoEvaluationPage /></>} roles={['AGENT']} />}
        />

        {/* Vous pouvez aussi ajouter d’autres pages agent protégées ici */}

        {/* Route fallback */}
        <Route path="*" element={<h2>Page non trouvée</h2>} />

        <Route path="evaluation" element={<ConsulterEvaluationPage />} />
        <Route
          path="/contestation"
          element={<PrivateRoute element={<><Navbar /><ContestationPage /></>} roles={['AGENT']} />}
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute
              element={<Dashboard objectifs={[]} performance_moyenne={0} />}
              roles={['AGENT']}
            />
          }
        />      <Route
          path="/agent-dashboard"
          element={
            <PrivateRoute
              element={<AgentDashboard />}
              roles={['AGENT']}

            />
          }
        />

        {/* --- Routes subordonnés --- */}
        <Route path="/mes-subordonnees" element={<MesSubordonnees />} />
        <Route path="/mes-subordonnee/:id" element={<SubordonneesObjectifs />} />


        <Route path="/objectif-superieur/:id" element={<ObjectifDetails />} />

        <Route
          path="/objectif-superieur/:id"
          element={<ObjectifSubordonnees />}
        />
        <Route path="/objectif-superieur/:id" element={<InfosObjectif />} />

        {/* Liste des objectifs d’un agent subordonné */}
        <Route path="/mes-subordonnes/:id/objectifs" element={<SubordonneesObjectifs />} />

        {/* Détail d’un objectif spécifique (ObjectifSubordonnees) */}
        <Route path="/objectifs-superieur/:objectifId" element={<ObjectifSubordonnees />} />
        <Route path="/objectifs/:id" element={<ObjectifDetails />} />
        <Route path="/objectifs-sous-responsable" element={<ObjectifsSousResponsable />} />

      </Routes>
    </div>
  );
};

export default App;