import { Bookmark } from "lucide-react";
import { PostCard } from "./PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function BookmarksPage() {
  const bookmarkedPosts = [
    {
      id: "1",
      authorId: "1",
      author: "Sarah Johnson",
      department: "Computer Science",
      batch: "Fall 2023",
      timeAgo: "2d ago",
      content: "Comprehensive guide to Machine Learning algorithms. Saved this for reference! 🔖",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
      reactions: { like: 156, love: 34, celebrate: 12, support: 8, insightful: 45 },
      totalReactions: 255,
      comments: 42,
      isBookmarked: true,
    },
    {
      id: "2",
      authorId: "2",
      author: "David Miller",
      department: "Engineering",
      batch: "Spring 2024",
      timeAgo: "1w ago",
      content: "Study resources for finals week. This list is gold! 📚",
      reactions: { like: 89, love: 23, celebrate: 5, support: 34, insightful: 28 },
      totalReactions: 179,
      comments: 28,
      isBookmarked: true,
    },
  ];

  const bookmarkedEvents = [];
  const bookmarkedSocieties = [];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bookmark className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2>Bookmarks</h2>
          <p className="text-sm text-muted-foreground">Your saved content</p>
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start rounded-xl mb-6">
          <TabsTrigger value="posts" className="rounded-xl">
            Posts ({bookmarkedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-xl">
            Events ({bookmarkedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="societies" className="rounded-xl">
            Societies ({bookmarkedSocieties.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookmarked posts yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Bookmark posts to find them easily later
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookmarked events yet</p>
          </div>
        </TabsContent>

        <TabsContent value="societies" className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookmarked societies yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}