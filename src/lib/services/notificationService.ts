import { supabase } from '../supabaseClient';

export interface ChatNotification {
  id: string;
  type: 'new_message' | 'message_reaction' | 'typing_start' | 'typing_stop';
  room_id: string;
  room_name: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_preview?: string;
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private permissionGranted = false;
  private registration: ServiceWorkerRegistration | null = null;

  async initialize() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
    } else {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permissionGranted = permission === 'granted';
    return this.permissionGranted;
  }

  async showNotification(notification: ChatNotification) {
    if (!this.permissionGranted) {
      console.warn('Notification permission not granted');
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: notification.message_preview || 'New message',
      icon: notification.sender_avatar || '/default-avatar.png',
      badge: '/badge.png',
      tag: `chat-${notification.room_id}`,
      data: {
        room_id: notification.room_id,
        sender_id: notification.sender_id,
        type: notification.type
      },
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/reply-icon.png'
        },
        {
          action: 'mark_read',
          title: 'Mark as Read',
          icon: '/mark-read-icon.png'
        }
      ],
      requireInteraction: false,
      silent: false
    };

    try {
      const notificationInstance = new Notification(
        `${notification.sender_name} in ${notification.room_name}`,
        notificationOptions
      );

      // Handle notification click
      notificationInstance.onclick = () => {
        window.focus();
        // Navigate to chat room
        window.dispatchEvent(new CustomEvent('navigateToChat', {
          detail: { roomId: notification.room_id }
        }));
        notificationInstance.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notificationInstance.close();
      }, 5000);

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  async sendPushNotification(notification: ChatNotification) {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return;
    }

    try {
      await this.registration.showNotification(
        `${notification.sender_name} in ${notification.room_name}`,
        {
          body: notification.message_preview || 'New message',
          icon: notification.sender_avatar || '/default-avatar.png',
          badge: '/badge.png',
          tag: `chat-${notification.room_id}`,
          data: {
            room_id: notification.room_id,
            sender_id: notification.sender_id,
            type: notification.type
          },
          actions: [
            {
              action: 'reply',
              title: 'Reply',
              icon: '/reply-icon.png'
            },
            {
              action: 'mark_read',
              title: 'Mark as Read',
              icon: '/mark-read-icon.png'
            }
          ],
          requireInteraction: false,
          silent: false
        }
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  async getNotifications(userId: string): Promise<ChatNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'new_message')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map(notif => ({
        id: notif.id,
        type: notif.type as any,
        room_id: notif.action_data?.room_id || '',
        room_name: notif.action_data?.room_name || 'Unknown Room',
        sender_id: notif.action_data?.sender_id || '',
        sender_name: notif.action_data?.sender_name || 'Unknown User',
        sender_avatar: notif.avatar_url,
        message_preview: notif.message,
        timestamp: notif.timestamp,
        read: notif.read
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('type', 'new_message');

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async subscribeToNotifications(userId: string, callback: (notification: ChatNotification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        async (payload) => {
          const notif = payload.new as any;
          
          if (notif.type === 'new_message') {
            const notification: ChatNotification = {
              id: notif.id,
              type: notif.type,
              room_id: notif.action_data?.room_id || '',
              room_name: notif.action_data?.room_name || 'Unknown Room',
              sender_id: notif.action_data?.sender_id || '',
              sender_name: notif.action_data?.sender_name || 'Unknown User',
              sender_avatar: notif.avatar_url,
              message_preview: notif.message,
              timestamp: notif.timestamp,
              read: notif.read
            };

            // Show browser notification
            await this.showNotification(notification);
            
            // Call callback
            callback(notification);
          }
        })
      .subscribe();
  }

  // Utility methods
  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }
}

export const notificationService = new NotificationService();
