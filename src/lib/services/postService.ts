import type { Post, CreatePostInput } from "../../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class PostService {
  async createPost(input: CreatePostInput): Promise<Post> {
    await delay(800);

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: "user-123",
      author: "You",
      department: "Computer Science",
      batch: "Fall 2023",
      timeAgo: "Just now",
      content: input.content,
      image: input.image,
      likes: 0,
      comments: 0,
      liked: false,
    };

    return newPost;
  }

  async getPosts(_page = 1, _limit = 10): Promise<Post[]> {
    await delay(600);

    // Mock posts data
    const mockPosts: Post[] = [
      {
        id: "1",
        authorId: "user-456",
        author: "Sarah Johnson",
        department: "Computer Science",
        batch: "Fall 2023",
        timeAgo: "2h ago",
        content: "Just finished my Machine Learning project! The results are amazing. Can't wait to present it next week. Anyone else working on AI projects this semester?",
        image: "https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NTk3MTI0OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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

    return mockPosts;
  }

  async likePost(_postId: string): Promise<void> {
    await delay(300);
    // In real app, would send API request
  }

  async unlikePost(_postId: string): Promise<void> {
    await delay(300);
    // In real app, would send API request
  }

  async deletePost(_postId: string): Promise<void> {
    await delay(500);
    // In real app, would send API request
  }
}

export const postService = new PostService();
