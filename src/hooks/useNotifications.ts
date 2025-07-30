import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  newJobs: boolean;
  urgentJobs: boolean;
  reminders: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    push: true,
    email: true,
    sms: false,
    newJobs: true,
    urgentJobs: true,
    reminders: true
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedNotifications = localStorage.getItem('app-notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }

    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === 'granted') {
      toast({
        title: "Notifications enabled",
        description: "You'll now receive push notifications"
      });
      return true;
    } else {
      toast({
        title: "Permission denied",
        description: "Enable notifications in your browser settings",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update notification settings
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('notification-settings', JSON.stringify(updated));

    toast({
      title: "Settings updated",
      description: "Notification preferences saved"
    });
  };

  // Add new notification
  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep only 50 most recent
    setNotifications(updatedNotifications);
    localStorage.setItem('app-notifications', JSON.stringify(updatedNotifications));

    // Show browser notification if enabled and permitted
    if (settings.push && permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: newNotification.id
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default'
    });
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('app-notifications', JSON.stringify(updated));
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('app-notifications', JSON.stringify(updated));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('app-notifications');
    toast({
      title: "Notifications cleared",
      description: "All notifications have been removed"
    });
  };

  // Send test notification
  const sendTestNotification = () => {
    addNotification({
      title: "Test Notification",
      message: "This is a test notification to verify your settings are working correctly.",
      type: "info"
    });
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-notification for urgent jobs (would be called from job monitoring)
  const notifyUrgentJob = (customerName: string, jobType: string) => {
    if (settings.urgentJobs) {
      addNotification({
        title: "Urgent Job Alert",
        message: `${customerName} has submitted an urgent ${jobType} job`,
        type: "warning",
        actionUrl: "/dashboard"
      });
    }
  };

  // Auto-notification for new jobs
  const notifyNewJob = (customerName: string, jobType: string) => {
    if (settings.newJobs) {
      addNotification({
        title: "New Job Received",
        message: `${customerName} has submitted a ${jobType} job`,
        type: "info",
        actionUrl: "/dashboard"
      });
    }
  };

  return {
    notifications,
    settings,
    permission,
    unreadCount,
    requestPermission,
    updateSettings,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    sendTestNotification,
    notifyUrgentJob,
    notifyNewJob
  };
};