import { Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useIsMobile } from "./ui/use-mobile";
import { useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { useNotifications } from "../contexts/NotificationContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { APP_NAME } from "../lib/constants";

interface TopNavProps {
  title?: string;
  showSearch?: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSearchClick?: () => void;
}

export function TopNav({ title = APP_NAME, showSearch = false, darkMode, onToggleDarkMode, onSearchClick }: TopNavProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { navigate } = useApp();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isBrandTitle = title === APP_NAME;

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-40 backdrop-blur-sm bg-card/95 h-[70px]">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isMobile ? (
            <button
              onClick={() => navigate("home")}
              className="rounded-full hover:bg-accent p-1 transition-colors"
              aria-label="Go to home"
            >
              <span className="text-lg font-bold text-primary font-brand">CampusLoif</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("profile")}
              className="rounded-full hover:bg-accent p-1 transition-colors"
              aria-label="Go to profile"
            >
              <Avatar className="w-8 h-8 rounded-full">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-primary to-purple-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || APP_NAME.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </button>
          )}
          <h1 className={`hidden sm:block text-xl ${isBrandTitle ? "font-brand" : "font-semibold"} text-foreground`}>{title}</h1>
        </div>

        {showSearch && (
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onSearchClick}
              className="w-full text-left relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="w-full pl-10 pr-4 py-2 bg-input-background rounded-full border border-border hover:border-primary transition-colors cursor-pointer">
                <span className="text-sm text-muted-foreground">
                  Search students, societies, events...
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="flex items-center gap-1">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full md:hidden hover:bg-accent"
              onClick={onSearchClick}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative hover:bg-accent"
            onClick={() => setNotificationOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
          {isMobile ? (
            <button
              onClick={() => navigate("profile")}
              className="rounded-full hover:bg-accent p-1 transition-colors"
              aria-label="Go to profile"
            >
              <Avatar className="w-8 h-8 rounded-full">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-primary to-purple-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || APP_NAME.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-accent"
              onClick={onToggleDarkMode}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      <NotificationPanel open={notificationOpen} onOpenChange={setNotificationOpen} />
    </header>
  );
}
