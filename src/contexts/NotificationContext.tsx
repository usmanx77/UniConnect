import { createContext, useContext, useState, ReactNode } from "react";
import type { Notification } from "../types";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Mock notifications for demo
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "connection_request",
    title: "New Connection Request",
    message: "Sarah Chen wants to connect with you",
    avatar: undefined,
    timestamp: "2m ago",
    read: false,
  },
  {
    id: "2",
    type: "post_reaction",
    title: "Michael loved your post",
    message: "Your post about the hackathon received a new reaction",
    timestamp: "1h ago",
    read: false,
  },
  {
    id: "3",
    type: "event_reminder",
    title: "Event Tomorrow",
    message: "Tech Talk: AI & Ethics starts at 5 PM",
    timestamp: "3h ago",
    read: false,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: "Just now",
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}