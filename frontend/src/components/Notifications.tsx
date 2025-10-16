// src/components/Notifications.tsx
import React from 'react';

interface NotificationsProps {
  notifications: any[];
}

const Notifications: React.FC<NotificationsProps> = ({ notifications }) => {
  return (
    <div className="notifications">
      <h3>Notifications récentes</h3>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>
            <p>{notif.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
