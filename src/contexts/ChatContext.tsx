import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { chatService } from "../lib/services/chatService";
import type { 
  ChatRoom, 
  EnhancedMessage, 
  TypingUser, 
  CreateRoomInput, 
  SendMessageInput 
} from "../lib/services/chatService";
import { useAuth } from "./AuthContext";

interface ChatContextValue {
  // State
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: EnhancedMessage[];
  typingUsers: TypingUser[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: EnhancedMessage[];

  // Actions
  setCurrentRoom: (room: ChatRoom | null) => void;
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string) => Promise<void>;
  sendMessage: (input: SendMessageInput) => Promise<void>;
  createRoom: (input: CreateRoomInput) => Promise<ChatRoom>;
  editMessage: (messageId: string, newBody: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  markAsRead: () => Promise<void>;
  searchMessages: (query: string) => Promise<void>;
  clearSearch: () => void;
  refreshMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<EnhancedMessage[]>([]);

  // Refs for subscriptions
  const messageSubscriptionRef = useRef<any>(null);
  const typingSubscriptionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load rooms on mount
  useEffect(() => {
    if (user) {
      loadRooms();
    }
  }, [user]);

  // Set up real-time subscriptions when current room changes
  useEffect(() => {
    if (currentRoom) {
      setupRealtimeSubscriptions(currentRoom.id);
    } else {
      cleanupSubscriptions();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [currentRoom]);

  // Set up typing status listener
  useEffect(() => {
    const handleTypingStatusChange = (event: CustomEvent) => {
      if (currentRoom && event.detail.roomId === currentRoom.id) {
        setTypingUsers(event.detail.typingUsers);
      }
    };

    window.addEventListener('typingStatusChanged', handleTypingStatusChange as EventListener);
    return () => {
      window.removeEventListener('typingStatusChanged', handleTypingStatusChange as EventListener);
    };
  }, [currentRoom]);

  const setupRealtimeSubscriptions = (roomId: string) => {
    // Subscribe to new messages
    messageSubscriptionRef.current = chatService.subscribeToMessages(roomId, (message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark as read if user is viewing this room
      if (currentRoom?.id === roomId) {
        markAsRead();
      }
    });

    // Subscribe to typing indicators
    typingSubscriptionRef.current = chatService.subscribeToTyping(roomId, (users) => {
      setTypingUsers(users);
    });
  };

  const cleanupSubscriptions = () => {
    if (messageSubscriptionRef.current) {
      messageSubscriptionRef.current.unsubscribe();
      messageSubscriptionRef.current = null;
    }
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current();
      typingSubscriptionRef.current = null;
    }
  };

  const loadRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const roomsData = await chatService.getRooms();
      setRooms(roomsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat rooms');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const messagesData = await chatService.getMessages(roomId);
      setMessages(messagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (input: SendMessageInput) => {
    try {
      setError(null);
      const message = await chatService.sendMessage(input);
      setMessages(prev => [...prev, message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, []);

  const createRoom = useCallback(async (input: CreateRoomInput): Promise<ChatRoom> => {
    try {
      setError(null);
      const room = await chatService.createRoom(input);
      setRooms(prev => [room, ...prev]);
      return room;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      throw err;
    }
  }, []);

  const editMessage = useCallback(async (messageId: string, newBody: string) => {
    try {
      setError(null);
      await chatService.editMessage(messageId, newBody);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, body: newBody, is_edited: true, edited_at: new Date().toISOString() }
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit message');
      throw err;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      setError(null);
      await chatService.addReaction(messageId, emoji);
      // Update local state optimistically
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === messageId) {
            const existingReaction = msg.reactions.find(r => r.emoji === emoji);
            if (existingReaction) {
              return {
                ...msg,
                reactions: msg.reactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, users: [...r.users, user?.id || ''] }
                    : r
                )
              };
            } else {
              return {
                ...msg,
                reactions: [...msg.reactions, { emoji, users: [user?.id || ''], count: 1 }]
              };
            }
          }
          return msg;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reaction');
      throw err;
    }
  }, [user]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      setError(null);
      await chatService.removeReaction(messageId, emoji);
      // Update local state optimistically
      setMessages(prev => 
        prev.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: Math.max(0, r.count - 1), users: r.users.filter(id => id !== user?.id) }
                  : r
              ).filter(r => r.count > 0)
            };
          }
          return msg;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove reaction');
      throw err;
    }
  }, [user]);

  const startTyping = useCallback(() => {
    if (!currentRoom) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing
    chatService.startTyping(currentRoom.id);

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [currentRoom]);

  const stopTyping = useCallback(() => {
    if (!currentRoom) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    chatService.stopTyping(currentRoom.id);
  }, [currentRoom]);

  const markAsRead = useCallback(async () => {
    if (!currentRoom) return;

    try {
      await chatService.markAsRead(currentRoom.id);
      // Update local state
      setRooms(prev => 
        prev.map(room => 
          room.id === currentRoom.id 
            ? { ...room, unread_count: 0 }
            : room
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [currentRoom]);

  const searchMessages = useCallback(async (query: string) => {
    try {
      setError(null);
      setSearchQuery(query);
      if (query.trim()) {
        const results = await chatService.searchMessages(query, currentRoom?.id);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search messages');
    }
  }, [currentRoom]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const refreshMessages = useCallback(async () => {
    if (currentRoom) {
      await loadMessages(currentRoom.id);
    }
  }, [currentRoom, loadMessages]);

  // Handle room selection
  const handleSetCurrentRoom = useCallback(async (room: ChatRoom | null) => {
    setCurrentRoom(room);
    if (room) {
      await loadMessages(room.id);
      await markAsRead();
    } else {
      setMessages([]);
    }
  }, [loadMessages, markAsRead]);

  const value: ChatContextValue = {
    // State
    rooms,
    currentRoom,
    messages,
    typingUsers,
    isLoading,
    error,
    searchQuery,
    searchResults,

    // Actions
    setCurrentRoom: handleSetCurrentRoom,
    loadRooms,
    loadMessages,
    sendMessage,
    createRoom,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
    markAsRead,
    searchMessages,
    clearSearch,
    refreshMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}