# UniConnect Client Integration Guide

TypeScript examples for integrating with Supabase backend.

## Environment Setup

### .env File

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Initialize Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper to get current user's profile
export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return data;
};
```

### Generate TypeScript Types

```bash
# Run this command to generate types from your schema
npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

## Authentication

### 1. Check Email Domain During Signup

```typescript
// Validate email domain before signup
const validateEmailDomain = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1];

  const { data, error } = await supabase
    .from('university_domains')
    .select('university_id, universities(name, short_name)')
    .eq('domain', domain)
    .maybeSingle();

  if (error || !data) {
    throw new Error(`Email domain ${domain} is not registered with any university. Please use your university email.`);
  }

  return true;
};
```

### 2. Sign Up with Email/Password

```typescript
interface SignUpData {
  email: string;
  password: string;
  name: string;
  department: string;
  batch: string;
}

const signUp = async (userData: SignUpData) => {
  // Validate domain first
  await validateEmailDomain(userData.email);

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        department: userData.department,
        batch: userData.batch
      }
    }
  });

  if (authError) throw authError;

  // Profile is created automatically via trigger
  // But we need to update it with additional info
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        department: userData.department,
        batch: userData.batch
      });

    if (profileError) throw profileError;
  }

  return authData;
};
```

### 3. Sign In

```typescript
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
};
```

### 4. Sign Out

```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### 5. Auth State Listener

```typescript
// In your root component or auth context
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile
        const profile = await getCurrentProfile();
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

## Onboarding & Profile

### 1. Update Profile After Signup

```typescript
interface OnboardingData {
  bio?: string;
  interests: string[]; // Array of interest IDs
  avatar?: File;
}

const completeOnboarding = async (data: OnboardingData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Upload avatar if provided
  let avatarUrl = undefined;
  if (data.avatar) {
    const filePath = `${user.id}/avatar.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, data.avatar, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    avatarUrl = publicUrl;
  }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      bio: data.bio,
      avatar_url: avatarUrl
    })
    .eq('id', user.id);

  if (profileError) throw profileError;

  // Add interests
  if (data.interests.length > 0) {
    const interestRows = data.interests.map(interestId => ({
      user_id: user.id,
      interest_id: interestId
    }));

    const { error: interestsError } = await supabase
      .from('user_interests')
      .insert(interestRows);

    if (interestsError) throw interestsError;
  }

  return true;
};
```

### 2. Get Available Interests

```typescript
const getInterests = async () => {
  const { data, error } = await supabase
    .from('interests')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};
```

### 3. Update Profile

```typescript
const updateProfile = async (updates: Partial<Profile>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

## Posts & Feed

### 1. Create Post

```typescript
interface CreatePostData {
  content: string;
  visibility: 'university' | 'connections' | 'society';
  societyId?: string;
  media?: File[];
}

const createPost = async (postData: CreatePostData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Upload media files first
  const mediaUrls: any[] = [];
  if (postData.media && postData.media.length > 0) {
    for (let i = 0; i < postData.media.length; i++) {
      const file = postData.media[i];
      const timestamp = Date.now();
      const filePath = `${user.id}/temp_${timestamp}_${i}.${file.type.split('/')[1]}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      mediaUrls.push({
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: filePath,
        size: file.size
      });
    }
  }

  // Create post (university_id is set by trigger)
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: postData.content,
      visibility: postData.visibility,
      society_id: postData.societyId,
      media: mediaUrls
    })
    .select()
    .single();

  if (error) throw error;

  // Update media metadata with post_id
  if (mediaUrls.length > 0) {
    for (const media of mediaUrls) {
      await supabase.storage
        .from('post-images')
        .update(media.url, undefined, {
          metadata: { post_id: data.id }
        });
    }
  }

  return data;
};
```

### 2. Get University Feed

```typescript
interface FeedPost {
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  media: any[];
  visibility: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked: boolean;
  is_bookmarked: boolean;
}

const getUniversityFeed = async (limit = 50, offset = 0): Promise<FeedPost[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('v_feed_university', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset
    });

  if (error) throw error;
  return data;
};
```

### 3. Like a Post

```typescript
const likePost = async (postId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_likes')
    .insert({
      post_id: postId,
      user_id: user.id
    });

  if (error) throw error;
};

const unlikePost = async (postId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
};
```

### 4. Comment on Post

```typescript
const commentOnPost = async (postId: string, content: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content
    })
    .select(`
      *,
      profiles:user_id (name, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
};
```

### 5. Get Post Comments

```typescript
const getPostComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      profiles:user_id (id, name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};
```

### 6. Bookmark Post

```typescript
const bookmarkPost = async (postId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      post_id: postId
    });

  if (error) throw error;
};

const unbookmarkPost = async (postId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId);

  if (error) throw error;
};
```

### 7. Get User's Bookmarks

```typescript
const getMyBookmarks = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      created_at,
      posts (
        *,
        profiles:author_id (name, avatar_url)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
```

## Connections

### 1. Send Connection Request

```typescript
const sendConnectionRequest = async (userId: string) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('connections')
    .insert({
      requester: currentUser.id,
      requestee: userId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 2. Accept Connection Request

```typescript
const acceptConnectionRequest = async (connectionId: string) => {
  const { data, error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 3. Get My Connections

```typescript
const getMyConnections = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      requester_profile:requester (id, name, avatar_url, department, batch),
      requestee_profile:requestee (id, name, avatar_url, department, batch)
    `)
    .eq('status', 'accepted')
    .or(`requester.eq.${user.id},requestee.eq.${user.id}`);

  if (error) throw error;

  // Map to get the other user's profile
  return data.map(conn => ({
    ...conn,
    connection: conn.requester === user.id
      ? conn.requestee_profile
      : conn.requester_profile
  }));
};
```

### 4. Get Pending Requests

```typescript
const getPendingRequests = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('connections')
    .select(`
      *,
      requester_profile:requester (id, name, avatar_url, department, batch)
    `)
    .eq('requestee', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
```

## Societies

### 1. Create Society

```typescript
interface CreateSocietyData {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  logo?: File;
}

const createSociety = async (societyData: CreateSocietyData) => {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  if (!user || !profile) throw new Error('Not authenticated');

  // Create society
  const { data: society, error: societyError } = await supabase
    .from('societies')
    .insert({
      university_id: profile.university_id,
      name: societyData.name,
      description: societyData.description,
      category: societyData.category,
      is_private: societyData.isPrivate,
      created_by: user.id
    })
    .select()
    .single();

  if (societyError) throw societyError;

  // Upload logo if provided
  if (societyData.logo) {
    const filePath = `${society.id}/logo.png`;
    const { error: uploadError } = await supabase.storage
      .from('society-logos')
      .upload(filePath, societyData.logo, {
        metadata: { society_id: society.id }
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('society-logos')
      .getPublicUrl(filePath);

    await supabase
      .from('societies')
      .update({ logo_url: publicUrl })
      .eq('id', society.id);
  }

  // Add creator as owner
  const { error: memberError } = await supabase
    .from('society_members')
    .insert({
      society_id: society.id,
      user_id: user.id,
      role: 'owner'
    });

  if (memberError) throw memberError;

  return society;
};
```

### 2. Get My Societies

```typescript
const getMySocieties = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('society_members')
    .select(`
      role,
      joined_at,
      societies (*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
};
```

### 3. Join Society

```typescript
const joinSociety = async (societyId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('society_members')
    .insert({
      society_id: societyId,
      user_id: user.id,
      role: 'member'
    });

  if (error) throw error;
};
```

### 4. Leave Society

```typescript
const leaveSociety = async (societyId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('society_members')
    .delete()
    .eq('society_id', societyId)
    .eq('user_id', user.id);

  if (error) throw error;
};
```

## Events

### 1. Create Event

```typescript
interface CreateEventData {
  title: string;
  description: string;
  location: string;
  startsAt: string; // ISO date string
  endsAt: string;
  visibility: 'university' | 'society';
  societyId?: string;
  banner?: File;
}

const createEvent = async (eventData: CreateEventData) => {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  if (!user || !profile) throw new Error('Not authenticated');

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      university_id: profile.university_id,
      society_id: eventData.societyId,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      starts_at: eventData.startsAt,
      ends_at: eventData.endsAt,
      visibility: eventData.visibility,
      created_by: user.id
    })
    .select()
    .single();

  if (error) throw error;

  // Upload banner if provided
  if (eventData.banner) {
    const filePath = `${event.id}/banner.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('event-banners')
      .upload(filePath, eventData.banner, {
        metadata: { event_id: event.id }
      });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('event-banners')
        .getPublicUrl(filePath);

      await supabase
        .from('events')
        .update({ banner_url: publicUrl })
        .eq('id', event.id);
    }
  }

  return event;
};
```

### 2. RSVP to Event

```typescript
const rsvpEvent = async (eventId: string, status: 'going' | 'interested' | 'not_going') => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: user.id,
      status
    });

  if (error) throw error;
};
```

### 3. Get Upcoming Events

```typescript
const getUpcomingEvents = async () => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      creator:created_by (name, avatar_url),
      society:society_id (name, logo_url)
    `)
    .eq('university_id', profile.university_id)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  if (error) throw error;
  return data;
};
```

## Messaging

### 1. Create or Get DM Room

```typescript
const getOrCreateDMRoom = async (otherUserId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('ensure_dm_room', {
      p_user1: user.id,
      p_user2: otherUserId
    });

  if (error) throw error;
  return data;
};
```

### 2. Send Message

```typescript
interface SendMessageData {
  roomId: string;
  body?: string;
  attachments?: File[];
}

const sendMessage = async (messageData: SendMessageData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Upload attachments if any
  const attachmentData: any[] = [];
  if (messageData.attachments && messageData.attachments.length > 0) {
    for (const file of messageData.attachments) {
      const timestamp = Date.now();
      const filePath = `${user.id}/${messageData.roomId}/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          metadata: { room_id: messageData.roomId }
        });

      if (uploadError) throw uploadError;

      const { data: { signedUrl } } = await supabase.storage
        .from('chat-attachments')
        .createSignedUrl(filePath, 86400); // 24h expiry

      attachmentData.push({
        type: file.type,
        url: signedUrl,
        filename: file.name,
        size: file.size
      });
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      room_id: messageData.roomId,
      author_id: user.id,
      body: messageData.body,
      attachments: attachmentData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 3. Get Inbox

```typescript
const getInbox = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('v_inbox', {
      p_user_id: user.id
    });

  if (error) throw error;
  return data;
};
```

### 4. Get Room Messages

```typescript
const getRoomMessages = async (roomId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      author:author_id (id, name, avatar_url)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse(); // Most recent at bottom
};
```

### 5. Mark Room as Read

```typescript
const markRoomAsRead = async (roomId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('room_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id);

  if (error) throw error;
};
```

## Notifications

### 1. Get My Notifications

```typescript
const getNotifications = async (unreadOnly = false) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false });

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};
```

### 2. Mark Notification as Read

```typescript
const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
};
```

### 3. Mark All Notifications as Read

```typescript
const markAllNotificationsAsRead = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) throw error;
};
```

## Realtime Subscriptions

### 1. Subscribe to New Posts

```typescript
const subscribeToNewPosts = (callback: (post: any) => void) => {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const subscription = supabase
    .channel('posts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `university_id=eq.${profile.university_id}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return subscription;
};
```

### 2. Subscribe to Room Messages

```typescript
const subscribeToRoomMessages = (roomId: string, callback: (message: any) => void) => {
  const subscription = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return subscription;
};

// Usage in component
useEffect(() => {
  const subscription = subscribeToRoomMessages(roomId, (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  });

  return () => {
    supabase.removeChannel(subscription);
  };
}, [roomId]);
```

### 3. Subscribe to Notifications

```typescript
const subscribeToNotifications = (callback: (notification: any) => void) => {
  const user = await getCurrentUser();
  if (!user) return null;

  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return subscription;
};
```

### 4. Subscribe to Post Likes

```typescript
const subscribeToPostLikes = (postId: string, callback: (like: any) => void) => {
  const subscription = supabase
    .channel(`post_likes:${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'post_likes',
        filter: `post_id=eq.${postId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          callback({ type: 'like', data: payload.new });
        } else if (payload.eventType === 'DELETE') {
          callback({ type: 'unlike', data: payload.old });
        }
      }
    )
    .subscribe();

  return subscription;
};
```

## Search

### 1. Search Posts

```typescript
const searchPosts = async (query: string) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (name, avatar_url)
    `)
    .eq('university_id', profile.university_id)
    .textSearch('search_vector', query)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};
```

### 2. Search People

```typescript
const searchPeople = async (query: string) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, department, batch')
    .eq('university_id', profile.university_id)
    .textSearch('search_vector', query)
    .limit(20);

  if (error) throw error;
  return data;
};
```

### 3. Search Societies

```typescript
const searchSocieties = async (query: string) => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('university_id', profile.university_id)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
};
```

## Error Handling

### Centralized Error Handler

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);

  if (error.code === 'PGRST116') {
    throw new ApiError('Resource not found', 'NOT_FOUND');
  }

  if (error.code === '23505') {
    throw new ApiError('Resource already exists', 'DUPLICATE');
  }

  if (error.code === '42501') {
    throw new ApiError('Permission denied', 'FORBIDDEN');
  }

  throw new ApiError(
    error.message || 'An unexpected error occurred',
    error.code,
    error
  );
};

// Usage
try {
  await createPost(postData);
} catch (error) {
  handleSupabaseError(error);
}
```

## Performance Tips

1. **Use select() to limit columns**: Only fetch what you need
2. **Implement pagination**: Use limit/offset or cursor-based pagination
3. **Cache profile data**: Store current user's profile in context
4. **Debounce search**: Wait 300ms before searching
5. **Unsubscribe from realtime**: Always clean up subscriptions
6. **Use maybeSingle()**: For queries that return 0 or 1 row
7. **Batch operations**: Use upsert for multiple inserts
8. **Optimize images**: Resize before upload, use WebP format
