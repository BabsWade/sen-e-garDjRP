// src/pages/ObjectifsPage.tsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

type StatutObjectif = 'en_attente' | 'valide' | 'rejete';

interface Objectif {
    id: number;
    libelle: string;
    type_kpi: string;
    cible: string;
    poids: string;
    annee: number;
    service: string;
    periode: string;
    taux_avancement: number;
    statut: StatutObjectif;
    commentaire_rejet?: string;
}

const ObjectifsPage = () => {
    const [objectifs, setObjectifs] = useState<Objectif[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchObjectifs = async () => {
            try {
                const response = await api.get('objectifs/');
                setObjectifs(response.data);
            } catch (error) {
                console.error('Error fetching objectifs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchObjectifs();
    }, []);

    const labelsStatut: Record<StatutObjectif, string> = {
        en_attente: "En attente",
        valide: "Validé",
        rejete: "Rejeté",
    };

    const couleursStatut: Record<StatutObjectif, string> = {
        en_attente: "gray",
        valide: "green",
        rejete: "red",
    };

    return (
        <div>
       
            <h1>Mes Objectifs</h1>
            <div style={{ marginBottom: '1rem' }}>
                <Link to="/objectifs/create">
                    <button>Créer un objectif</button>
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {objectifs.map((objectif) => (
                        <li key={objectif.id} style={{ marginBottom: '1rem' }}>
                            <strong>{objectif.libelle}</strong><br />
                            KPI Type: {objectif.type_kpi} <br />
                            Cible: {objectif.cible} <br />
                            Poids: {objectif.poids} <br />
                            Période: {objectif.periode} <br />
                            Service: {objectif.service} <br />
                            <strong>Taux d’avancement :</strong> {objectif.taux_avancement}% <br />

                            <span style={{ fontWeight: 'bold', color: couleursStatut[objectif.statut] }}>
                                {labelsStatut[objectif.statut]}
                                {objectif.statut === 'rejete' && objectif.commentaire_rejet
                                    ? `: ${objectif.commentaire_rejet}`
                                    : null}
                            </span>

                            {objectif.statut === 'en_attente' && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <Link to={`/objectifs/${objectif.id}/edit`}>
                                        <button>Modifier</button>
                                    </Link>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ObjectifsPage;
