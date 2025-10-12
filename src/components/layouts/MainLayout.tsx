import { useState, Suspense, lazy } from "react";
import { useApp } from "../../contexts/AppContext";
import { TopNav } from "../TopNav";
import { BottomNav } from "../BottomNav";
import { Sidebar } from "./Sidebar";
import { CreatePostDialog } from "../CreatePostDialog";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { APP_NAME } from "../../lib/constants";
import { LoadingSpinner } from "../LoadingSpinner";

// Lazy load page components for better code splitting
const HomePage = lazy(() => import("../HomePage").then(module => ({ default: module.HomePage })));
const ProfilePage = lazy(() => import("../ProfilePage").then(module => ({ default: module.ProfilePage })));
const ConnectionsPage = lazy(() => import("../ConnectionsPage").then(module => ({ default: module.ConnectionsPage })));
const SocietiesPage = lazy(() => import("../SocietiesPage").then(module => ({ default: module.SocietiesPage })));
const SocietyRoomPage = lazy(() => import("../SocietyRoomPage").then(module => ({ default: module.SocietyRoomPage })));
const EventsPage = lazy(() => import("../EventsPage").then(module => ({ default: module.EventsPage })));
const ChatPage = lazy(() => import("../ChatPage").then(module => ({ default: module.ChatPage })));
const BookmarksPage = lazy(() => import("../BookmarksPage").then(module => ({ default: module.BookmarksPage })));
const AdvancedSearchPage = lazy(() => import("../AdvancedSearchPage").then(module => ({ default: module.AdvancedSearchPage })));
const SettingsPage = lazy(() => import("../SettingsPage").then(module => ({ default: module.SettingsPage })));

export function MainLayout() {
  const { currentPage, darkMode, toggleDarkMode, navigate } = useApp();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_-20%,rgba(10,132,255,0.18),transparent_55%),radial-gradient(900px_circle_at_90%_0%,rgba(94,92,230,0.14),transparent_50%)]"
      />

      <div className="relative min-h-screen bg-white/40 backdrop-blur-[2px] dark:bg-black/60">
        <TopNav
          title={APP_NAME}
          showSearch={currentPage === "home"}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onSearchClick={() => navigate("search")}
        />

        <Sidebar />

        <main className="md:ml-64 pt-[60px] md:pt-0">
          <Suspense fallback={<LoadingSpinner fullScreen size="lg" text="Loading page..." />}>
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
          </Suspense>
        </main>

        <BottomNav />

        {/* Floating Action Button for Quick Post */}
        {currentPage === "home" && (
          <Button
            size="icon"
            onClick={() => setCreatePostOpen(true)}
            className="fixed bottom-[88px] right-6 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-[0_25px_45px_-20px_rgba(10,132,255,0.55)] transition-transform hover:scale-[1.02] focus-visible:scale-[1.02]"
            aria-label="Create new post"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Create Post Dialog */}
        <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
      </div>
    </div>
  );
}
