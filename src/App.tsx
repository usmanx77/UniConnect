import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { StoryProvider } from "./contexts/StoryContext";
import { ChatProvider } from "./contexts/ChatContext";
import { AppRouter } from "./components/AppRouter";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <StoryProvider>
              <ChatProvider>
                <AppRouter />
                <Toaster position="top-center" />
              </ChatProvider>
            </StoryProvider>
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
