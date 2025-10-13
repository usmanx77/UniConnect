import { Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PostCard } from "./PostCard";
import { useApp } from "../contexts/AppContext";

export function ProfilePage() {
  const { navigate } = useApp();
  
  const userPosts = [
    {
      id: "1",
      authorId: "user-123",
      author: "You",
      department: "Computer Science",
      batch: "Fall 2023",
      timeAgo: "1d ago",
      content: "Had an amazing time at the hackathon! Our team built a sustainable campus app. Thanks to everyone who participated! 🎉",
      image: "https://images.unsplash.com/photo-1632834380561-d1e05839a33a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjYW1wdXN8ZW58MXx8fHwxNzU5Njk0NjMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      reactions: { like: 42, love: 0, celebrate: 0, support: 0, insightful: 0 },
      totalReactions: 42,
      comments: 15,
      liked: false,
    },
  ];

  const societies = [
    { name: "Computer Science Society", role: "Member", logo: "💻" },
    { name: "Debate Club", role: "Active Member", logo: "🎤" },
    { name: "Photography Society", role: "Member", logo: "📸" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-2 pt-2 pb-20 md:px-4 md:pt-6 md:pb-6">
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6 relative">
        <div className="h-32 bg-gradient-to-r from-primary to-purple-600"></div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-xl absolute top-4 right-4"
          onClick={() => navigate("settings")}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-4">
            <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
              <AvatarFallback className="bg-primary text-white text-2xl">A</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="mb-1">Alex Thompson</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Computer Science • Fall 2023
              </p>
              <p className="text-sm">
                Passionate about AI and sustainability. Building solutions that matter.
              </p>
            </div>
          </div>

          <div className="flex gap-6 py-4 border-t border-border">
            <div>
              <p className="text-muted-foreground text-sm">Posts</p>
              <p>24</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Friends</p>
              <p>156</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Societies</p>
              <p>3</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start rounded-xl mb-6">
          <TabsTrigger value="posts" className="rounded-xl">Posts</TabsTrigger>
          <TabsTrigger value="societies" className="rounded-xl">Societies</TabsTrigger>
          <TabsTrigger value="events" className="rounded-xl">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="societies" className="space-y-4">
          {societies.map((society, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl">
                  {society.logo}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm">{society.name}</h4>
                  <p className="text-xs text-muted-foreground">{society.role}</p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  View
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground">No upcoming events</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
