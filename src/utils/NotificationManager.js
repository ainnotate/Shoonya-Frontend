// SimpleNotification.js
import React, { useState, useEffect } from 'react';
import notificationService from './NotificationService';
import './NotificationManager.css';

const Notification = ({ notification, onClose }) => {
  const { id, message, type } = notification;
  
  return (
    <div className={`simple-notification simple-notification-${type}`}>
      <div className="simple-notification-content">{message}</div>
      <button className="simple-notification-close" onClick={() => onClose(id)}>×</button>
    </div>
  );
};

const SimpleNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to notifications from the service
    const unsubscribe = notificationService.subscribe(setNotifications);
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="simple-notification-container">
      {notifications.map((notification) => (
        <Notification 
          key={notification.id} 
          notification={notification} 
          onClose={(id) => notificationService.removeNotification(id)} 
        />
      ))}
    </div>
  );
};

export default SimpleNotificationManager;