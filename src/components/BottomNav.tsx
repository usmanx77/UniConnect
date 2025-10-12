import { Home, Users, Calendar, MessageCircle, MoreHorizontal, UserPlus, Bookmark, Settings } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import type { PageRoute } from "../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { Button } from "./ui/button";

export function BottomNav() {
  const { currentPage, navigate } = useApp();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const mainNavItems = [
    { id: "home" as PageRoute, icon: Home, label: "Home" },
    { id: "connections" as PageRoute, icon: UserPlus, label: "Circle" },
    { id: "societies" as PageRoute, icon: Users, label: "Societies" },
    { id: "chat" as PageRoute, icon: MessageCircle, label: "Chat" },
  ];

  const moreMenuItems = [
    { id: "events" as PageRoute, icon: Calendar, label: "Events" },
    { id: "bookmarks" as PageRoute, icon: Bookmark, label: "Bookmarks" },
    { id: "settings" as PageRoute, icon: Settings, label: "Settings" },
  ];

  const handleNavigation = (pageId: PageRoute) => {
    navigate(pageId);
    setMoreMenuOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50" aria-label="Mobile navigation">
      <div className="flex items-center justify-around px-2 py-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu */}
        <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                ["events", "bookmarks", "settings"].includes(currentPage)
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-lg font-semibold">More Options</SheetTitle>
              <SheetDescription>
                Access additional features and settings
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-2 pb-6">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => handleNavigation(item.id)}
                    className="w-full justify-start gap-3 h-12 rounded-lg font-medium"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
