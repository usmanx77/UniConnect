import { createContext, useContext, useState, ReactNode } from "react";
import type { StoryGroup, Story } from "../types";

interface StoryContextValue {
  storyGroups: StoryGroup[];
  addStory: (story: Omit<Story, "id" | "createdAt" | "expiresAt" | "views" | "viewedBy">) => void;
  viewStory: (storyId: string, userId: string) => void;
  deleteStory: (storyId: string) => void;
}

const StoryContext = createContext<StoryContextValue | undefined>(undefined);

// Mock stories for demo
const INITIAL_STORY_GROUPS: StoryGroup[] = [
  {
    userId: "user1",
    userName: "Sarah Johnson",
    userAvatar: undefined,
    hasUnviewed: true,
    latestStoryTime: "2h ago",
    stories: [
      {
        id: "story1",
        userId: "user1",
        userName: "Sarah Johnson",
        userAvatar: undefined,
        department: "Computer Science",
        content: "Working on my ML project! 🚀",
        mediaUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
        mediaType: "image",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        views: 45,
        viewedBy: [],
      },
    ],
  },
  {
    userId: "user2",
    userName: "Michael Chen",
    userAvatar: undefined,
    hasUnviewed: true,
    latestStoryTime: "4h ago",
    stories: [
      {
        id: "story2",
        userId: "user2",
        userName: "Michael Chen",
        userAvatar: undefined,
        department: "Business",
        content: "Great marketing event today!",
        backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        views: 32,
        viewedBy: [],
      },
    ],
  },
  {
    userId: "user3",
    userName: "Emily Rodriguez",
    userAvatar: undefined,
    hasUnviewed: false,
    latestStoryTime: "6h ago",
    stories: [
      {
        id: "story3",
        userId: "user3",
        userName: "Emily Rodriguez",
        userAvatar: undefined,
        department: "Psychology",
        content: "Study session vibes ✨",
        mediaUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
        mediaType: "image",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        views: 78,
        viewedBy: ["currentUser"],
      },
    ],
  },
];

export function StoryProvider({ children }: { children: ReactNode }) {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>(INITIAL_STORY_GROUPS);

  const addStory = (story: Omit<Story, "id" | "createdAt" | "expiresAt" | "views" | "viewedBy">) => {
    const newStory: Story = {
      ...story,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      views: 0,
      viewedBy: [],
    };

    setStoryGroups((prev) => {
      const existingGroupIndex = prev.findIndex((g) => g.userId === story.userId);
      
      if (existingGroupIndex !== -1) {
        const updated = [...prev];
        updated[existingGroupIndex] = {
          ...updated[existingGroupIndex],
          stories: [newStory, ...updated[existingGroupIndex].stories],
          latestStoryTime: "Just now",
        };
        return updated;
      } else {
        return [
          {
            userId: story.userId,
            userName: story.userName,
            userAvatar: story.userAvatar,
            hasUnviewed: true,
            latestStoryTime: "Just now",
            stories: [newStory],
          },
          ...prev,
        ];
      }
    });
  };

  const viewStory = (storyId: string, userId: string) => {
    setStoryGroups((prev) =>
      prev.map((group) => ({
        ...group,
        stories: group.stories.map((story) =>
          story.id === storyId
            ? {
                ...story,
                views: story.views + 1,
                viewedBy: [...story.viewedBy, userId],
              }
            : story
        ),
        hasUnviewed: group.userId === userId ? false : group.hasUnviewed,
      }))
    );
  };

  const deleteStory = (storyId: string) => {
    setStoryGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          stories: group.stories.filter((s) => s.id !== storyId),
        }))
        .filter((group) => group.stories.length > 0)
    );
  };

  return (
    <StoryContext.Provider value={{ storyGroups, addStory, viewStory, deleteStory }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error("useStories must be used within StoryProvider");
  }
  return context;
}