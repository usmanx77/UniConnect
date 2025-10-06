import { useState } from "react";
import { Search, Send, MoreVertical, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "See you at the event!",
      timestamp: "2h ago",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      lastMessage: "Thanks for the notes 📚",
      timestamp: "5h ago",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      lastMessage: "Let's study tomorrow?",
      timestamp: "1d ago",
      unread: 1,
      online: true,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "other",
      text: "Hey! Are you coming to the tech talk tomorrow?",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Yes! I'm really excited about it. Are you going too?",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "Definitely! We should sit together",
      timestamp: "10:33 AM",
    },
    {
      id: 4,
      sender: "me",
      text: "Sounds great! See you there 😊",
      timestamp: "10:35 AM",
    },
    {
      id: 5,
      sender: "other",
      text: "See you at the event!",
      timestamp: "2h ago",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)] md:h-[calc(100vh-160px)] border border-border rounded-2xl overflow-hidden bg-card">
        {/* Conversations List */}
        <div className={`border-r border-border ${selectedChat !== null ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b border-border">
            <h3 className="mb-3 text-sm">Messages</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search conversations..."
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors border-b border-border ${
                  selectedChat === conv.id ? "bg-accent" : ""
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-white">
                      {conv.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm truncate">{conv.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {conv.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`md:col-span-2 flex flex-col ${selectedChat === null ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-xl"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-white">
                    {conversations.find((c) => c.id === selectedChat)?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-sm">
                    {conversations.find((c) => c.id === selectedChat)?.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender === "me"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-accent text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "me" ? "text-white/70" : "text-muted-foreground"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="rounded-xl"
                  />
                  <Button size="icon" className="rounded-xl flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm mb-2">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
