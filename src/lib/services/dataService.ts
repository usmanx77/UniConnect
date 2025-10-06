import type { Post, Connection, Society, Event, Chat } from "../../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data Store
const mockPosts: Post[] = [
  {
    id: "1",
    authorId: "user-456",
    author: "Sarah Johnson",
    department: "Computer Science",
    batch: "Fall 2023",
    timeAgo: "2h ago",
    content: "Just finished my Machine Learning project! The results are amazing. Can't wait to present it next week. Anyone else working on AI projects this semester?",
    image: "https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NTk3MTI0OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    likes: 24,
    comments: 8,
    liked: true,
  },
  {
    id: "2",
    authorId: "user-789",
    author: "Michael Chen",
    department: "Business Administration",
    batch: "Spring 2024",
    timeAgo: "4h ago",
    content: "Reminder: Marketing Club meets tomorrow at 5 PM in Building A, Room 203. We'll be discussing the upcoming campus event. See you there! 🚀",
    likes: 15,
    comments: 5,
  },
];

const mockConnections: Connection[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    department: "Computer Science",
    batch: "Fall 2023",
    mutualConnections: 12,
  },
  {
    id: "2",
    name: "Michael Chen",
    department: "Business Administration",
    batch: "Spring 2024",
    mutualConnections: 8,
  },
];

const mockSocieties: Society[] = [
  {
    id: "1",
    name: "Computer Science Society",
    description: "For all CS enthusiasts",
    members: 234,
    category: "Technology",
    logo: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200",
    unreadPosts: 3,
  },
  {
    id: "2",
    name: "Entrepreneurship Club",
    description: "Building the future",
    members: 156,
    category: "Academic",
    logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200",
  },
];

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Tech Career Fair 2025",
    date: "2025-10-15",
    time: "10:00 AM",
    location: "Main Auditorium",
    organizer: "Career Services",
    attendees: 234,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
    interested: 156,
  },
  {
    id: "2",
    title: "Startup Pitch Night",
    date: "2025-10-20",
    time: "6:00 PM",
    location: "Innovation Hub",
    organizer: "Entrepreneurship Club",
    attendees: 89,
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600",
    interested: 67,
  },
];

const mockChats: Chat[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    lastMessage: "See you at the study session!",
    time: "10m ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    lastMessage: "Thanks for the notes!",
    time: "1h ago",
    unread: 0,
    online: false,
  },
];

class DataService {
  async getPosts(): Promise<Post[]> {
    await delay(500);
    return [...mockPosts];
  }

  async getConnections(): Promise<Connection[]> {
    await delay(400);
    return [...mockConnections];
  }

  async getSocieties(): Promise<Society[]> {
    await delay(400);
    return [...mockSocieties];
  }

  async getEvents(): Promise<Event[]> {
    await delay(400);
    return [...mockEvents];
  }

  async getChats(): Promise<Chat[]> {
    await delay(300);
    return [...mockChats];
  }
}

export const dataService = new DataService();
