import { useState } from "react";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import { StoriesBar } from "./StoriesBar";
import { Calendar, TrendingUp, Users, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { PullToRefresh } from "./PullToRefresh";
import { Skeleton } from "./ui/skeleton";
import { motion } from "motion/react";
import { toast } from "sonner";
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
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground/70">
              UniConnect
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
              A refined way to experience campus life.
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Discover conversations, events and people through a serene, minimalist surface inspired by the smooth polish of
              Apple design principles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onOpenCreatePost}
              className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-6 py-2 text-sm font-semibold shadow-[0_20px_45px_-25px_rgba(10,132,255,0.7)] transition-transform hover:-translate-y-0.5"
            >
              Compose a Story
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/60 bg-white/50 px-6 py-2 text-sm font-semibold text-foreground backdrop-blur dark:border-white/10 dark:bg-white/10"
            >
              Explore Insights
            </Button>
          </div>
        </div>

        {/* Stories Bar */}
        <div className="mb-8">
          <StoriesBar />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Feed */}
          <div className="space-y-6 lg:col-span-2">
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
                  <Card className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
                    <div className="mb-4 flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="mb-4 h-20 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden space-y-6 lg:block">
            {/* Suggested Connections */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-[92px] rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
            >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">People You May Know</h3>
                </div>
                <div className="space-y-4">
                  {suggestedConnections.map((connection) => (
                    <div key={connection.id} className="flex items-start gap-4 rounded-2xl border border-white/50 bg-white/40 p-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-xs font-semibold text-foreground">
                          {connection.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-foreground">{connection.name}</h4>
                        <p className="truncate text-xs text-muted-foreground">
                          {connection.department}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {connection.mutualConnections} mutual connections
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 rounded-full border-white/60 bg-white/60 px-4 py-2 text-xs font-semibold text-foreground dark:border-white/15 dark:bg-white/10"
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="mt-6 w-full rounded-full border border-transparent bg-white/60 py-2 text-sm font-semibold text-primary transition hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  View All Suggestions
                </Button>
              </motion.div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Upcoming Events</h3>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <div
                      key={i}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-white/50 via-white/40 to-white/30 p-3 transition-all hover:-translate-y-0.5 hover:bg-white/60 dark:from-white/10 dark:via-white/5 dark:to-white/0"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${event.color} opacity-5 transition-opacity group-hover:opacity-10`} />
                      <div className="relative">
                        <h4 className="text-sm font-medium mb-1 text-foreground">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.date} • {event.organizer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="mt-6 w-full rounded-full border border-transparent bg-white/60 py-2 text-sm font-semibold text-primary transition hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  View All Events
                </Button>
              </motion.div>

              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Trending Topics</h3>
                </div>
                <div className="space-y-2">
                  {trendingTopics.map((topic, i) => (
                    <button
                      key={i}
                      className="group block w-full rounded-2xl border border-transparent bg-white/40 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/70 dark:bg-white/5 dark:hover:border-white/15 dark:hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-primary group-hover:underline">{topic.tag}</p>
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