// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  batch: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  connections: number;
  societies: number;
  isOnline?: boolean;
  lastSeen?: string;
  badges?: Badge[];
  photos?: string[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

// Reaction Types
export type ReactionType = "like" | "love" | "celebrate" | "support" | "insightful";

export interface Reaction {
  userId: string;
  userName: string;
  type: ReactionType;
}

export interface ReactionSummary {
  like: number;
  love: number;
  celebrate: number;
  support: number;
  insightful: number;
}

// Poll Types
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: string;
  allowMultiple: boolean;
}

// Post Types
export interface Post {
  id: string;
  authorId: string;
  author: string;
  department: string;
  batch: string;
  timeAgo: string;
  content: string;
  image?: string;
  images?: string[];
  attachments?: Attachment[];
  poll?: Poll;
  reactions: ReactionSummary;
  totalReactions: number;
  userReaction?: ReactionType;
  comments: number;
  liked?: boolean;
  avatar?: string;
  isBookmarked?: boolean;
  tags?: string[];
  mentions?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface CreatePostInput {
  content: string;
  image?: string;
  images?: string[];
  attachments?: File[];
  pollOptions?: string[];
  pollQuestion?: string;
  tags?: string[];
  mentions?: string[];
}

// Story Types
export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  department: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  backgroundColor?: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  viewedBy: string[];
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar?: string;
  stories: Story[];
  hasUnviewed: boolean;
  latestStoryTime: string;
}

// Connection Types
export interface Connection {
  id: string;
  name: string;
  department: string;
  batch: string;
  mutualConnections?: number;
  avatar?: string;
}

export interface ConnectionRequest extends Connection {
  requestedAt: string;
}

// Society Types
export interface Society {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  logo: string;
  coverImage?: string;
  unreadPosts?: number;
  isJoined?: boolean;
  memberAvatars?: string[];
  pinnedPosts?: Post[];
  channels?: SocietyChannel[];
}

export interface SocietyChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  unreadCount?: number;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  image: string;
  interested: number;
}

export type RSVPStatus = "going" | "interested" | null;

// Chat Types
export type ChatRoomType = "dm" | "group" | "society";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  type?: "text" | "image" | "file";
  attachmentUrl?: string;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
  isTyping?: boolean;
}

// Notification Types
export type NotificationType = 
  | "connection_request"
  | "connection_accepted"
  | "post_reaction"
  | "post_comment"
  | "event_reminder"
  | "society_invite"
  | "mention"
  | "achievement";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  avatar?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionData?: Record<string, unknown>;
}

// Search Types
export interface SearchFilters {
  query: string;
  type?: "all" | "posts" | "people" | "societies" | "events";
  department?: string;
  batch?: string;
  dateRange?: "today" | "week" | "month" | "all";
}

export interface SearchResult {
  posts: Post[];
  people: Connection[];
  societies: Society[];
  events: Event[];
}

// Suggestion Types
export interface SuggestedConnection extends Connection {
  reason: string;
  matchScore: number;
}

// Navigation Types
export type PageRoute = "home" | "profile" | "connections" | "societies" | "society-room" | "events" | "chat" | "bookmarks" | "search" | "settings";

// App State Types
export interface AppState {
  currentPage: PageRoute;
  darkMode: boolean;
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  unreadNotifications: number;
  currentSocietyId?: string;
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OnboardingData {
  department: string;
  batch: string;
  interests: string[];
}

// Additional Types for missing definitions
export interface ChatMember {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: "member" | "admin" | "owner";
  lastReadAt?: string;
  joinedAt: string;
  isOnline: boolean;
}

export interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

export interface MessageAttachment {
  id: string;
  type: "image" | "video" | "file" | "audio" | string;
  url: string;
  size: number;
  filename: string;
  name?: string;
  metadata?: {
    mimeType?: string;
    [key: string]: unknown;
  };
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface EnhancedMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  replyTo?: string;
  editedAt?: string;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface ChatRoom {
  id: string;
  roomType: ChatRoomType;
  name?: string;
  avatarUrl?: string;
  universityId?: string;
  societyId?: string;
  createdBy: string;
  lastMessageAt?: string;
  createdAt: string;
  members: ChatMember[];
  unreadCount: number;
  typingUsers: TypingUser[];
  isOnline?: boolean;
  lastMessage?: ChatMessage;
}

export interface Users {
  id: string;
  name: string;
  avatar?: string;
}

export interface CreateRoomInput {
  roomType: ChatRoomType;
  name?: string;
  memberIds: string[];
  societyId?: string;
}

export interface SendMessageInput {
  roomId: string;
  body?: string;
  attachments?: File[];
  replyTo?: string;
}

// Icon components (these will be imported from lucide-react)
export interface IconProps {
  className?: string;
  size?: number;
}

declare global {
  interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
  }

  interface NotificationOptions {
    actions?: NotificationAction[];
  }
}

export {};
