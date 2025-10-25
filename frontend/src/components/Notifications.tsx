// src/components/Notifications.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Notification {
    id: number;
    message: string;
    date_envoi: string;
    statut: string;
    lue_le?: string;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications/'); // Adapter l'URL à ton API
            setNotifications(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des notifications', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axios.post(`/api/notifications/${id}/marquer_lue/`);
            fetchNotifications(); // Recharger les notifications
        } catch (error) {
            console.error('Erreur lors du marquage comme lu', error);
        }
    };

    return (
        <div className="notifications">
            <h3>Notifications récentes</h3>
            <ul>
                {notifications.map((notif) => (
                    <li key={notif.id} style={{ fontWeight: notif.statut === 'Lu' ? 'normal' : 'bold' }}>
                        <p>{notif.message}</p>
                        <small>{new Date(notif.date_envoi).toLocaleString()}</small>
                        {notif.statut !== 'Lu' && (
                            <button onClick={() => markAsRead(notif.id)}>Marquer comme lu</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
