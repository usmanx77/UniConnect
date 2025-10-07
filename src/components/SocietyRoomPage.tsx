import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { 
  ArrowLeft, 
  Users, 
  Send,
  Smile,
  Image as ImageIcon,
  Calendar
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

export function SocietyRoomPage() {
  const { navigate, currentSocietyId } = useApp();
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  // Mock society data
  const society = {
    id: currentSocietyId || "1",
    name: "Computer Science Society",
    description: "Exploring technology, coding, and innovation together. Join us for weekly meetups, hackathons, and tech talks!",
    logo: "💻",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop",
    members: 234,
    isJoined: true,
    category: "Academic",
  };

  // Mock messages
  const messages: Message[] = [
    {
      id: "1",
      senderId: "1",
      senderName: "Sarah Johnson",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      content: "Hey everyone! Don't forget about our meetup tomorrow at 4 PM in the computer lab!",
      timestamp: "10:23 AM",
    },
    {
      id: "2",
      senderId: "2",
      senderName: "Mike Chen",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      content: "I'll be there! Should I bring my laptop?",
      timestamp: "10:25 AM",
    },
    {
      id: "3",
      senderId: "1",
      senderName: "Sarah Johnson",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      content: "Yes please! We'll be working on the hackathon project.",
      timestamp: "10:26 AM",
    },
    {
      id: "4",
      senderId: "current",
      senderName: "You",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current",
      content: "Sounds great! What tech stack are we using?",
      timestamp: "10:30 AM",
      isOwn: true,
    },
    {
      id: "5",
      senderId: "1",
      senderName: "Sarah Johnson",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      content: "React + Node.js + MongoDB. We can discuss more details tomorrow!",
      timestamp: "10:32 AM",
    },
    {
      id: "6",
      senderId: "3",
      senderName: "Alex Kumar",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      content: "Perfect! I've been learning React recently.",
      timestamp: "10:35 AM",
    },
  ];

  const members = [
    { id: "1", name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", role: "Admin" },
    { id: "2", name: "Mike Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike", role: "Member" },
    { id: "3", name: "Alex Kumar", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", role: "Member" },
    { id: "4", name: "Emily Rodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily", role: "Moderator" },
    { id: "5", name: "David Miller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david", role: "Member" },
  ];

  const upcomingEvents = [
    {
      id: "1",
      title: "Weekly Coding Meetup",
      date: "Tomorrow, 4:00 PM",
      location: "Computer Lab A",
      attendees: 18,
    },
    {
      id: "2",
      title: "Hackathon 2025",
      date: "Oct 15, 9:00 AM",
      location: "Main Auditorium",
      attendees: 45,
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle sending message
      setMessageInput("");
    }
  };

  return (
    <div className="fixed inset-0 md:ml-64 pt-[68px] pb-[72px] md:pb-0 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("societies")}
            className="rounded-xl flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">{society.logo}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate">{society.name}</h3>
            <p className="text-xs text-muted-foreground">{society.members} members</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
            <TabsTrigger 
              value="chat" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="about"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              About
            </TabsTrigger>
            <TabsTrigger 
              value="members"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Members
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <img src={message.senderAvatar} alt={message.senderName} />
                    </Avatar>
                    <div className={`flex-1 min-w-0 ${message.isOwn ? 'flex flex-col items-end' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">{message.senderName}</span>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl max-w-[85%] ${
                          message.isOwn
                            ? 'bg-primary text-white'
                            : 'bg-card border border-border'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="max-w-3xl mx-auto flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl flex-shrink-0 hidden md:flex"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="rounded-full pr-10 bg-input-background"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="icon"
                  className="rounded-full flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4 max-w-3xl mx-auto">
              {/* Cover Image */}
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={society.coverImage}
                  alt={society.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* Description */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <h4 className="mb-2">About</h4>
                <p className="text-sm text-muted-foreground">
                  {society.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Members</span>
                  </div>
                  <p className="text-xl">{society.members}</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Events</span>
                  </div>
                  <p className="text-xl">{upcomingEvents.length}</p>
                </div>
              </div>

              {/* Upcoming Events */}
              <div>
                <h4 className="mb-3">Upcoming Events</h4>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-card border border-border rounded-2xl p-4"
                    >
                      <h4 className="mb-1">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.date} • {event.location}
                      </p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">{event.attendees} attending</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {activeTab === "members" && (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <h4>{society.members} Members</h4>
              </div>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <img src={member.avatar} alt={member.name} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl flex-shrink-0">
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}