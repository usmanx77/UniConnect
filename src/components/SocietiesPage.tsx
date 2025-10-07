import { useState } from "react";
import { Users, TrendingUp, Sparkles, Grid3x3, LogIn, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useApp } from "../contexts/AppContext";
import { Avatar } from "./ui/avatar";

export function SocietiesPage() {
  const { navigate } = useApp();
  const [joinedSocieties, setJoinedSocieties] = useState<string[]>([
    "Computer Science Society",
    "Photography Club",
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const allSocietiesData = [
    {
      id: "cs-society",
      name: "Computer Science Society",
      description: "Exploring technology, coding, and innovation together",
      members: 234,
      category: "Academic",
      logo: "💻",
      trending: true,
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=200&fit=crop",
      activeNow: 23,
      recentActivity: "Sarah posted in #projects",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=cs1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=cs2",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=cs3",
      ],
    },
    {
      id: "drama-club",
      name: "Drama Club",
      description: "Express yourself through theater and performance",
      members: 156,
      category: "Arts",
      logo: "🎭",
      trending: false,
      coverImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=200&fit=crop",
      activeNow: 12,
      recentActivity: "Alex shared new rehearsal photos",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=drama1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=drama2",
      ],
    },
    {
      id: "athletics-club",
      name: "Athletics Club",
      description: "Stay fit, compete, and have fun with sports",
      members: 312,
      category: "Sports",
      logo: "⚽",
      trending: true,
      coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=200&fit=crop",
      activeNow: 45,
      recentActivity: "Match schedule updated",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=ath1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=ath2",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=ath3",
      ],
    },
    {
      id: "debate-society",
      name: "Debate Society",
      description: "Sharpen your critical thinking and public speaking",
      members: 189,
      category: "Academic",
      logo: "🎤",
      trending: false,
      coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=200&fit=crop",
      activeNow: 8,
      recentActivity: "New topic posted for discussion",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=debate1",
      ],
    },
    {
      id: "music-society",
      name: "Music Society",
      description: "For music lovers, performers, and creators",
      members: 267,
      category: "Arts",
      logo: "🎵",
      trending: true,
      coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=200&fit=crop",
      activeNow: 34,
      recentActivity: "Jam session this Friday!",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=music1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=music2",
      ],
    },
    {
      id: "photography-club",
      name: "Photography Club",
      description: "Capture moments and develop your photography skills",
      members: 198,
      category: "Arts",
      logo: "📸",
      trending: false,
      coverImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=200&fit=crop",
      activeNow: 15,
      recentActivity: "Photo contest submissions open",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=photo1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=photo2",
      ],
    },
    {
      id: "environmental-society",
      name: "Environmental Society",
      description: "Fighting climate change and promoting sustainability",
      members: 143,
      category: "Social",
      logo: "🌱",
      trending: false,
      coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=200&fit=crop",
      activeNow: 6,
      recentActivity: "Campus cleanup event planned",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=env1",
      ],
    },
    {
      id: "business-club",
      name: "Business Club",
      description: "Network and learn about entrepreneurship",
      members: 221,
      category: "Academic",
      logo: "💼",
      trending: false,
      coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=200&fit=crop",
      activeNow: 18,
      recentActivity: "Startup pitch event next week",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=biz1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=biz2",
      ],
    },
    {
      id: "gaming-society",
      name: "Gaming Society",
      description: "Connect with fellow gamers and compete",
      members: 289,
      category: "Hobbies",
      logo: "🎮",
      trending: true,
      coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=200&fit=crop",
      activeNow: 67,
      recentActivity: "Tournament brackets updated",
      memberAvatars: [
        "https://api.dicebear.com/7.x/avataaars/svg?seed=game1",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=game2",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=game3",
      ],
    },
  ];

  const categories = [
    { name: "Academic", icon: "📚", count: allSocietiesData.filter(s => s.category === "Academic").length },
    { name: "Arts", icon: "🎨", count: allSocietiesData.filter(s => s.category === "Arts").length },
    { name: "Sports", icon: "🏅", count: allSocietiesData.filter(s => s.category === "Sports").length },
    { name: "Social", icon: "🤝", count: allSocietiesData.filter(s => s.category === "Social").length },
    { name: "Hobbies", icon: "🎯", count: allSocietiesData.filter(s => s.category === "Hobbies").length },
  ];

  const mySocieties = allSocietiesData
    .filter(s => joinedSocieties.includes(s.name))
    .map(s => ({
      ...s,
      unreadPosts: Math.floor(Math.random() * 10),
    }));

  const trendingSocieties = allSocietiesData.filter(s => s.trending);

  const filteredSocieties = allSocietiesData.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleJoin = (societyName: string) => {
    if (joinedSocieties.includes(societyName)) {
      setJoinedSocieties(joinedSocieties.filter(s => s !== societyName));
    } else {
      setJoinedSocieties([...joinedSocieties, societyName]);
    }
  };

  const enterRoom = (societyId: string) => {
    navigate("society-room", societyId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="mb-2">Societies & Communities</h2>
        <p className="text-muted-foreground">Join communities that match your interests</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder="Search societies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xl rounded-xl h-11 bg-input-background border-border"
        />
      </div>

      {/* My Societies Section */}
      {mySocieties.length > 0 && !searchQuery && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3>My Societies</h3>
              <Badge variant="secondary" className="rounded-full">
                {mySocieties.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            {mySocieties.map((society, i) => (
              <div 
                key={i} 
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => enterRoom(society.id)}
              >
                {/* Cover Image */}
                <div 
                  className="h-24 bg-gradient-to-r from-primary/20 to-purple-500/20 relative"
                  style={{
                    backgroundImage: society.coverImage ? `url(${society.coverImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  {society.unreadPosts > 0 && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="rounded-full shadow-md">
                        {society.unreadPosts} new
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-4 -mt-8 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-3xl flex-shrink-0">
                      {society.logo}
                    </div>
                    <div className="flex-1 min-w-0 mt-6">
                      <h4 className="mb-1 truncate">{society.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{society.members}</span>
                        </div>
                        {society.activeNow && (
                          <div className="flex items-center gap-1 text-primary">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span>{society.activeNow} active</span>
                          </div>
                        )}
                      </div>
                      {society.recentActivity && (
                        <p className="text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          {society.recentActivity}
                        </p>
                      )}
                    </div>
                    <Button 
                      className="rounded-xl flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        enterRoom(society.id);
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Enter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      {!searchQuery && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3>Trending This Week</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingSocieties.map((society, i) => (
              <div 
                key={i} 
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => joinedSocieties.includes(society.name) && enterRoom(society.id)}
              >
                {/* Cover Image */}
                <div 
                  className="h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 relative"
                  style={{
                    backgroundImage: society.coverImage ? `url(${society.coverImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="rounded-full text-xs shadow-md">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                </div>
                
                <div className="p-5 -mt-8 relative">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-3xl flex-shrink-0">
                      {society.logo}
                    </div>
                    <div className="flex-1 min-w-0 mt-2">
                      <h4 className="mb-1">{society.name}</h4>
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-lg">
                        {society.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {society.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{society.members}</span>
                    </div>
                    {society.activeNow && (
                      <div className="flex items-center gap-1 text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span>{society.activeNow} online</span>
                      </div>
                    )}
                  </div>

                  {/* Member Avatars */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {society.memberAvatars?.slice(0, 3).map((avatar, idx) => (
                        <Avatar key={idx} className="w-6 h-6 border-2 border-card">
                          <img src={avatar} alt="" className="w-full h-full" />
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      +{society.members - (society.memberAvatars?.length || 0)} members
                    </span>
                  </div>
                  
                  {joinedSocieties.includes(society.name) ? (
                    <Button
                      className="w-full rounded-xl h-10 group-hover:bg-primary group-hover:text-white transition-colors"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        enterRoom(society.id);
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Enter Room
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-xl h-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleJoin(society.name);
                      }}
                    >
                      Join Society
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category Section */}
      {!searchQuery && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5 text-primary" />
              <h3>Browse by Category</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((category, i) => (
              <button
                key={i}
                className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md hover:border-primary transition-all text-left group"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="mb-1 group-hover:text-primary transition-colors">{category.name}</h4>
                <p className="text-sm text-muted-foreground">{category.count} societies</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All Societies Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3>{searchQuery ? `Search Results (${filteredSocieties.length})` : "All Societies"}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSocieties.map((society, i) => (
            <div 
              key={i} 
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => joinedSocieties.includes(society.name) && enterRoom(society.id)}
            >
              {/* Cover Image */}
              <div 
                className="h-28 bg-gradient-to-r from-primary/20 to-purple-500/20 relative"
                style={{
                  backgroundImage: society.coverImage ? `url(${society.coverImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>
              
              <div className="p-5 -mt-8 relative">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl bg-card border-4 border-card shadow-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {society.logo}
                  </div>
                  <div className="flex-1 min-w-0 mt-1">
                    <h4 className="mb-1">{society.name}</h4>
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-lg">
                      {society.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {society.description}
                </p>
                
                <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{society.members}</span>
                  </div>
                  {society.activeNow && (
                    <div className="flex items-center gap-1 text-primary">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span>{society.activeNow} online</span>
                    </div>
                  )}
                </div>

                {/* Member Avatars */}
                {society.memberAvatars && society.memberAvatars.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {society.memberAvatars.slice(0, 3).map((avatar, idx) => (
                        <Avatar key={idx} className="w-6 h-6 border-2 border-card">
                          <img src={avatar} alt="" className="w-full h-full" />
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      +{society.members - society.memberAvatars.length} members
                    </span>
                  </div>
                )}
                
                {joinedSocieties.includes(society.name) ? (
                  <Button
                    className="w-full rounded-xl h-10 group-hover:bg-primary group-hover:text-white transition-colors"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      enterRoom(society.id);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Enter Room
                  </Button>
                ) : (
                  <Button
                    className="w-full rounded-xl h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleJoin(society.name);
                    }}
                  >
                    Join Society
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {filteredSocieties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No societies found matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
}
