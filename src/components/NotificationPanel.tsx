import { motion, AnimatePresence } from "motion/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { 
  UserPlus, 
  Heart, 
  MessageCircle, 
  Calendar, 
  Users, 
  AtSign, 
  Award,
  X,
  CheckCheck
} from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import type { NotificationType } from "../types";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notificationIcons: Record<NotificationType, any> = {
  connection_request: UserPlus,
  connection_accepted: UserPlus,
  post_reaction: Heart,
  post_comment: MessageCircle,
  event_reminder: Calendar,
  society_invite: Users,
  mention: AtSign,
  achievement: Award,
};

const notificationColors: Record<NotificationType, string> = {
  connection_request: "text-primary",
  connection_accepted: "text-primary",
  post_reaction: "text-destructive",
  post_comment: "text-primary",
  event_reminder: "text-accent-foreground",
  society_invite: "text-primary",
  mention: "text-primary",
  achievement: "text-primary",
};

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs rounded-xl"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                  <CheckCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  const colorClass = notificationColors[notification.type];

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 hover:bg-accent transition-colors cursor-pointer relative group ${
                        !notification.read ? "bg-accent/50" : ""
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        {/* Icon/Avatar */}
                        <div className="flex-shrink-0">
                          {notification.avatar ? (
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary text-white">
                                {notification.title[0]}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={`w-10 h-10 rounded-full bg-accent flex items-center justify-center ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm mb-1">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        )}

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}