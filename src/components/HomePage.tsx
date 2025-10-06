import { useState } from "react";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import { StoriesBar } from "./StoriesBar";
import { Calendar, TrendingUp, Users, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { PullToRefresh } from "./PullToRefresh";
import { Skeleton } from "./ui/skeleton";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import type { SuggestedConnection } from "../types";

interface HomePageProps {
  onOpenCreatePost?: () => void;
}

export function HomePage({ onOpenCreatePost }: HomePageProps) {
  const [posts, setPosts] = useState([
    {
      id: "1",
      authorId: "1",
      author: "Sarah Johnson",
      department: "Computer Science",
      batch: "Fall 2023",
      timeAgo: "2h ago",
      content: "Just finished my Machine Learning project! The results are amazing. Can't wait to present it next week. Anyone else working on AI projects this semester?",
      image: "https://images.unsplash.com/photo-1582192904915-d89c7250b235?w=800",
      reactions: { like: 24, love: 5, celebrate: 3, support: 2, insightful: 8 },
      totalReactions: 42,
      comments: 8,
      liked: true,
    },
    {
      id: "2",
      authorId: "2",
      author: "Michael Chen",
      department: "Business Administration",
      batch: "Spring 2024",
      timeAgo: "4h ago",
      content: "Reminder: Marketing Club meets tomorrow at 5 PM in Building A, Room 203. We'll be discussing the upcoming campus event. See you there! 🚀",
      reactions: { like: 15, love: 2, celebrate: 5, support: 1, insightful: 0 },
      totalReactions: 23,
      comments: 5,
    },
    {
      id: "3",
      authorId: "3",
      author: "Emily Rodriguez",
      department: "Psychology",
      batch: "Fall 2023",
      timeAgo: "6h ago",
      content: "Looking for study partners for the Cognitive Psychology exam. Anyone interested in forming a study group? Let's ace this together! 📚",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
      reactions: { like: 31, love: 4, celebrate: 0, support: 12, insightful: 3 },
      totalReactions: 50,
      comments: 12,
    },
    {
      id: "4",
      authorId: "4",
      author: "David Miller",
      department: "Engineering",
      batch: "Spring 2024",
      timeAgo: "8h ago",
      content: "What's your take on sustainable energy solutions?",
      poll: {
        id: "poll1",
        question: "What's your take on sustainable energy solutions?",
        options: [
          { id: "1", text: "Solar Power", votes: 145, voters: [] },
          { id: "2", text: "Wind Energy", votes: 89, voters: [] },
          { id: "3", text: "Hydroelectric", votes: 56, voters: [] },
          { id: "4", text: "Nuclear", votes: 34, voters: [] },
        ],
        totalVotes: 324,
        endsAt: "in 2 days",
        allowMultiple: false,
      },
      reactions: { like: 47, love: 3, celebrate: 2, support: 8, insightful: 19 },
      totalReactions: 79,
      comments: 19,
    },
    {
      id: "5",
      authorId: "5",
      author: "Jessica Wang",
      department: "Computer Science",
      batch: "Fall 2023",
      timeAgo: "1d ago",
      content: "Campus tour highlights! Check out these amazing spots around our university 📸",
      images: [
        "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
      ],
      reactions: { like: 89, love: 23, celebrate: 12, support: 5, insightful: 2 },
      totalReactions: 131,
      comments: 24,
    },
  ]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const upcomingEvents = [
    { title: "Tech Talk: AI & Ethics", date: "Oct 12", organizer: "CS Society", color: "from-blue-500 to-cyan-500" },
    { title: "Fall Sports Day", date: "Oct 15", organizer: "Athletics Club", color: "from-orange-500 to-red-500" },
    { title: "Career Fair 2024", date: "Oct 20", organizer: "University", color: "from-purple-500 to-pink-500" },
  ];

  const trendingTopics = [
    { tag: "#CampusLife", posts: 342 },
    { tag: "#StudyTips", posts: 287 },
    { tag: "#CareerWeek", posts: 198 },
    { tag: "#UniversityEvents", posts: 156 },
  ];

  const suggestedConnections: SuggestedConnection[] = [
    {
      id: "1",
      name: "Alex Kumar",
      department: "Computer Science",
      batch: "Fall 2023",
      mutualConnections: 8,
      reason: "Same department",
      matchScore: 95,
    },
    {
      id: "2",
      name: "Maria Garcia",
      department: "Computer Science",
      batch: "Spring 2024",
      mutualConnections: 5,
      reason: "Same department",
      matchScore: 88,
    },
  ];

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Feed refreshed!");
  };

  const loadMorePosts = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const morePosts = [
        {
          id: `${posts.length + 1}`,
          authorId: `${posts.length + 1}`,
          author: "New User",
          department: "Engineering",
          batch: "Fall 2023",
          timeAgo: "2d ago",
          content: "Another interesting post from the feed!",
          reactions: { like: 12, love: 3, celebrate: 1, support: 0, insightful: 2 },
          totalReactions: 18,
          comments: 4,
        },
      ];
      setPosts([...posts, ...morePosts]);
      setIsLoadingMore(false);
    }, 1000);
  };

  const { targetRef } = useInfiniteScroll(loadMorePosts);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:pb-6">
        {/* Stories Bar */}
        <div className="mb-6">
          <StoriesBar />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              <PostComposer onOpenCreatePost={onOpenCreatePost} />
              
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}

              {/* Infinite Scroll Trigger */}
              <div ref={targetRef} className="py-4">
                {isLoadingMore && (
                  <div className="space-y-4">
                    <Card className="p-4 rounded-2xl">
                      <div className="flex items-start gap-3 mb-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full mb-3" />
                      <Skeleton className="h-48 w-full rounded-xl" />
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block space-y-4">
              {/* Suggested Connections */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border p-4 shadow-sm sticky top-[92px]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-sm">People You May Know</h3>
                </div>
                <div className="space-y-3">
                  {suggestedConnections.map((connection) => (
                    <div key={connection.id} className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {connection.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm truncate">{connection.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {connection.department}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {connection.mutualConnections} mutual
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-xl flex-shrink-0">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 rounded-xl text-sm">
                  View All Suggestions
                </Button>
              </motion.div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-sm">Upcoming Events</h3>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <div key={i} className="relative p-3 bg-gradient-to-r rounded-xl overflow-hidden group cursor-pointer">
                      <div className={`absolute inset-0 bg-gradient-to-r ${event.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                      <div className="relative">
                        <h4 className="text-sm mb-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.date} • {event.organizer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 rounded-xl">
                  View All Events
                </Button>
              </motion.div>

              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-sm">Trending Topics</h3>
                </div>
                <div className="space-y-2">
                  {trendingTopics.map((topic, i) => (
                    <button
                      key={i}
                      className="block w-full text-left px-3 py-2 rounded-xl hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-primary group-hover:underline">{topic.tag}</p>
                        <Sparkles className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
      </div>
    </PullToRefresh>
  );
}