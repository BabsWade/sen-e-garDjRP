import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Notifications from './Notifications';

interface Notification {
    id: number;
    message: string;
    statut: 'Envoyé' | 'Lu';
    lue_le: string | null;
}

const NotificationsContainer: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications/');
            setNotifications(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axios.post(`/api/notifications/${id}/marquer_lue/`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, statut: 'Lu', lue_le: new Date().toISOString() } : n)
            );
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return <Notifications notifications={notifications} onMarkAsRead={markAsRead} />;
};

export default NotificationsContainer;
