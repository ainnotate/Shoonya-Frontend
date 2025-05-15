// NotificationService.js
class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
  }

  // Add a listener function that will be called when notifications change
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Add a notification
  addNotification(message, type = 'info', duration = 5000) {
    const id = Date.now().toString();
    const notification = {
      id,
      message,
      type,
      createdAt: new Date()
    };

    this.notifications = [...this.notifications, notification];
    this.notifyListeners();

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }

    return id;
  }

  // Remove a notification
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clearNotifications() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Helper methods for different notification types
  showSuccess(message, duration = 5000) {
    return this.addNotification(message, 'success', duration);
  }

  showError(message, duration = 5000) {
    return this.addNotification(message, 'error', duration);
  }

  showWarning(message, duration = 5000) {
    return this.addNotification(message, 'warning', duration);
  }

  showInfo(message, duration = 5000) {
    return this.addNotification(message, 'info', duration);
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;