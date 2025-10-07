import { useState, useEffect } from "react";
import { Bell, BellOff, X, Check, Trash2, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { notificationService, type ChatNotification } from "../lib/services/notificationService";
import { formatDistanceToNow } from "date-fns";

interface ChatNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatNotifications({ isOpen, onClose }: ChatNotificationsProps) {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const initializeNotifications = async () => {
    await notificationService.initialize();
    setPermissionGranted(notificationService.isPermissionGranted());
  };

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const notifs = await notificationService.getNotifications("current-user-id"); // Replace with actual user ID
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionGranted(granted);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev: ChatNotification[]) => 
        prev.map((notif: ChatNotification) => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead("current-user-id"); // Replace with actual user ID
      setNotifications((prev: ChatNotification[]) => 
        prev.map((notif: ChatNotification) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // TODO: Implement delete notification API call
      setNotifications((prev: ChatNotification[]) => 
        prev.filter((notif: ChatNotification) => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: ChatNotification) => {
    // Navigate to chat room
    window.dispatchEvent(new CustomEvent('navigateToChat', {
      detail: { roomId: notification.room_id }
    }));
    
    // Mark as read if not already
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    onClose();
  };

  const unreadCount = notifications.filter((n: ChatNotification) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center">
      <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!permissionGranted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestPermission}
                >
                  Enable
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!permissionGranted ? (
            <div className="p-6 text-center">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-sm font-medium mb-2">Notifications Disabled</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enable notifications to receive updates about new messages and chat activity.
              </p>
              <Button onClick={handleRequestPermission}>
                Enable Notifications
              </Button>
            </div>
          ) : isLoading ? (
            <div className="p-6 text-center">
              <div className="text-sm text-muted-foreground">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-sm font-medium mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Actions */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  </span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        !notification.read ? 'bg-accent/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {notification.sender_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              in {notification.room_name}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message_preview}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem                       onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  );
}