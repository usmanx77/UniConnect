import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { HomePage } from "../HomePage";
import { ProfilePage } from "../ProfilePage";
import { ConnectionsPage } from "../ConnectionsPage";
import { SocietiesPage } from "../SocietiesPage";
import { SocietyRoomPage } from "../SocietyRoomPage";
import { EventsPage } from "../EventsPage";
import { ChatPage } from "../ChatPage";
import { BookmarksPage } from "../BookmarksPage";
import { AdvancedSearchPage } from "../AdvancedSearchPage";
import { SettingsPage } from "../SettingsPage";
import { TopNav } from "../TopNav";
import { BottomNav } from "../BottomNav";
import { Sidebar } from "./Sidebar";
import { CreatePostDialog } from "../CreatePostDialog";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { APP_NAME } from "../../lib/constants";

export function MainLayout() {
  const { currentPage, darkMode, toggleDarkMode, navigate } = useApp();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        title={APP_NAME}
        showSearch={currentPage === "home"}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onSearchClick={() => navigate("search")}
      />

      <Sidebar />

      <main className="md:ml-64">
        {currentPage === "home" && (
          <HomePage onOpenCreatePost={() => setCreatePostOpen(true)} />
        )}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "connections" && <ConnectionsPage />}
        {currentPage === "societies" && <SocietiesPage />}
        {currentPage === "society-room" && <SocietyRoomPage />}
        {currentPage === "events" && <EventsPage />}
        {currentPage === "chat" && <ChatPage />}
        {currentPage === "bookmarks" && <BookmarksPage />}
        {currentPage === "search" && <AdvancedSearchPage />}
        {currentPage === "settings" && <SettingsPage />}
      </main>

      <BottomNav />

      {/* Floating Action Button for Quick Post */}
      {currentPage === "home" && (
        <Button
          size="icon"
          onClick={() => setCreatePostOpen(true)}
          className="fixed bottom-[88px] right-6 md:bottom-6 md:right-6 w-14 h-14 rounded-full shadow-lg shadow-primary/30 z-40"
          aria-label="Create new post"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Create Post Dialog */}
      <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </div>
  );
}
