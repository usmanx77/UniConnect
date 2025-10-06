# UniConnect - Supabase Backend

Production-ready backend for a university-isolated social networking platform.

## Overview

UniConnect is a secure, scalable social platform designed for universities. Each university operates as an isolated network where students can connect, share content, join societies, attend events, and message each other - all while maintaining strict data privacy and university-level access control.

## Features

### Core Functionality
- **University Isolation**: Complete data segregation by university
- **Email Domain Validation**: Signup restricted to registered university domains
- **Social Graph**: Connection requests, acceptance, and friend management
- **Content Feed**: Posts with granular visibility (university, connections, society)
- **Societies/Clubs**: Public and private group management
- **Events**: University-wide and society-specific events with RSVP
- **Messaging**: DMs, group chats, and society rooms
- **Stories**: 24-hour ephemeral content
- **Notifications**: Real-time in-app notifications
- **Search**: Full-text search for posts, people, and societies
- **Reports & Moderation**: User-generated content reporting system

### Security Features
- Row Level Security (RLS) on all tables
- University-scoped data access
- Server-side university ID derivation
- Least privilege access by default
- Secure helper functions using `auth.uid()`
- Comprehensive audit trails

### Performance Optimizations
- Denormalized counters with trigger maintenance
- Strategic indexing (B-tree, GIN, partial indexes)
- Full-text search vectors on posts and profiles
- Optimized feed queries
- Realtime subscriptions via logical replication

## Quick Start

### Prerequisites
- Supabase project (create at [supabase.com](https://supabase.com))
- Node.js 18+ (for frontend integration)

### 1. Apply the Migration

The database schema is in `migrations/001_uniconnect_schema.sql`. Apply it through the Supabase dashboard or CLI.

**Via Dashboard:**
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `001_uniconnect_schema.sql`
3. Execute the SQL

**Via Command:**
```bash
# The migration has already been applied if you're seeing this README
# Check applied migrations:
# SELECT * FROM supabase_migrations.schema_migrations;
```

### 2. Configure Storage Buckets

Follow the instructions in [`STORAGE.md`](./STORAGE.md) to create and configure storage buckets for:
- User avatars and covers
- Post images/videos
- Story media
- Society logos
- Event banners
- Chat attachments

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project settings > API.

### 4. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 5. Generate TypeScript Types (Optional but Recommended)

```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

### 6. Integrate with Frontend

See [`CLIENT_SNIPPETS.md`](./CLIENT_SNIPPETS.md) for comprehensive integration examples.

## Database Schema

### Core Tables

#### Identity & Auth
- `universities` - University master data
- `university_domains` - Email domain allowlist for signup gating
- `profiles` - Extended user profiles (1:1 with auth.users)
- `interests` - Taxonomy for user interests
- `user_interests` - User-interest mapping

#### Social Graph
- `connections` - Friend connections with request/accept flow

#### Communities
- `societies` - University clubs and organizations
- `society_members` - Membership with roles (member, admin, owner)
- `events` - University and society events
- `event_rsvps` - RSVP tracking (going, interested, not_going)

#### Content
- `posts` - Main content feed with visibility controls
- `post_likes`, `post_comments`, `comment_likes` - Engagement
- `bookmarks` - Saved posts
- `stories` - 24-hour ephemeral content
- `story_views` - Story view tracking

#### Messaging
- `rooms` - Chat rooms (DM, group, society)
- `room_members` - Room membership
- `messages` - Chat messages
- `message_reactions` - Emoji reactions

#### System
- `notifications` - In-app notifications
- `reports` - Content/user reports
- `moderation_log` - Admin action audit trail

### Helper Functions

```sql
-- Authorization helpers
current_user_id() → uuid
current_university_id() → uuid
same_university(university_id) → boolean
are_connected(user_a, user_b) → boolean
is_society_member(society_id, user_id) → boolean
can_view_post(post_id) → boolean

-- Utility functions
ensure_dm_room(user1, user2) → uuid  -- Create or get DM room
notify(user_id, type, title, message, ...) → uuid  -- Send notification
```

### Feed & Inbox Views

```sql
-- Get university feed for a user
SELECT * FROM v_feed_university(user_id, limit, offset);

-- Get user's inbox with unread counts
SELECT * FROM v_inbox(user_id);

-- Get user's accepted connections
SELECT * FROM v_my_connections;
```

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled with policies enforcing:

1. **University Isolation**: Users only access data from their university
2. **Ownership**: Users manage their own data
3. **Visibility Controls**: Posts respect university/connections/society visibility
4. **Membership Requirements**: Private societies and society-scoped content require membership

### Key Security Principles

- **Never trust client-sent IDs**: `university_id` is always server-derived
- **Use `auth.uid()` everywhere**: Current user identification via Supabase Auth
- **Least privilege**: Users only see what they need to see
- **Server-side validation**: Triggers enforce data integrity

### Example Policies

```sql
-- Posts: Visibility-based access
CREATE POLICY "Users can view posts based on visibility"
  ON posts FOR SELECT
  TO authenticated
  USING (can_view_post(id));

-- Profiles: Same university only
CREATE POLICY "Users can view profiles in their university"
  ON profiles FOR SELECT
  TO authenticated
  USING (same_university(university_id));

-- Messages: Room members only
CREATE POLICY "Users can view messages in their rooms"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_id AND rm.user_id = auth.uid()
    )
  );
```

## Data Flows

### User Signup Flow

1. User enters email (e.g., `student@minhaj.edu.pk`)
2. Client validates domain against `university_domains` table
3. User completes signup via Supabase Auth
4. `validate_profile_university()` trigger:
   - Extracts domain from email
   - Looks up `university_id` from `university_domains`
   - Sets `university_id` on profile
   - Fails if domain not registered (strict enforcement)

### Post Creation Flow

1. User creates post with visibility setting
2. Client sends: `author_id`, `content`, `visibility`, `society_id?`
3. `set_post_university()` trigger derives `university_id` from author's profile
4. Post saved with server-derived university ID
5. RLS policies control who can see it based on visibility

### Connection Request Flow

1. User A sends connection request to User B
2. Inserted into `connections` with status='pending'
3. `notify_connection_request()` trigger sends notification to User B
4. User B accepts → status updated to 'accepted'
5. `update_connections_count()` trigger increments counter on both profiles
6. Trigger sends acceptance notification to User A

### Messaging Flow

1. User calls `ensure_dm_room(user1_id, user2_id)`
2. Function checks if DM room exists between users
3. If not, creates room and adds both members
4. User sends message to room
5. `update_room_last_message()` trigger updates room's timestamp
6. Realtime subscription notifies other user

## Realtime Features

Enable realtime on key tables in Supabase dashboard:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
```

**Frontend subscription example:**

```typescript
const subscription = supabase
  .channel('room:123')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.123`
    },
    (payload) => console.log('New message:', payload.new)
  )
  .subscribe();
```

## Performance Considerations

### Indexing Strategy

- **B-tree indexes**: Foreign keys, timestamps, status columns
- **GIN indexes**: Full-text search vectors (posts, profiles)
- **Partial indexes**: Filtered indexes for common queries (e.g., accepted connections, active stories)
- **Composite indexes**: Multi-column queries (e.g., university + visibility + timestamp)

### Query Optimization

1. **Use `maybeSingle()` for 0-or-1 queries**: Avoids throwing errors
2. **Limit columns in SELECT**: Only fetch needed data
3. **Implement pagination**: Use limit/offset or cursor-based
4. **Debounce search**: Wait 300ms before search queries
5. **Cache profile data**: Store current user's profile in context

### Scaling Considerations

- **Connection pooling**: Use Supavisor for pooling (enabled by default)
- **Read replicas**: For high read loads (Supabase Pro+)
- **CDN for storage**: Public assets served via CDN
- **Materialized views**: For complex analytics queries
- **Partitioning**: For very large tables (posts, messages)

## Maintenance Tasks

### Daily

- Clean up expired stories:
  ```sql
  DELETE FROM stories WHERE expires_at < now();
  ```

### Weekly

- Review moderation reports
- Check for orphaned files in storage
- Monitor query performance (pg_stat_statements)

### Monthly

- Vacuum analyze database
- Review and optimize indexes
- Audit RLS policy performance
- Check storage usage per university

### Monitoring Queries

```sql
-- Active stories count
SELECT COUNT(*) FROM stories WHERE expires_at > now();

-- Posts by university
SELECT u.name, COUNT(p.id)
FROM universities u
LEFT JOIN posts p ON p.university_id = u.id
GROUP BY u.name;

-- Top societies by members
SELECT s.name, s.member_count, u.name as university
FROM societies s
INNER JOIN universities u ON u.id = s.university_id
ORDER BY s.member_count DESC
LIMIT 10;

-- Unread notifications by user
SELECT user_id, COUNT(*)
FROM notifications
WHERE read = false
GROUP BY user_id
ORDER BY COUNT(*) DESC
LIMIT 20;
```

## Extending the Schema

### Adding a New Feature

1. **Create tables** with RLS enabled
2. **Add foreign keys** to maintain referential integrity
3. **Create indexes** for query performance
4. **Write helper functions** for complex authorization logic
5. **Define RLS policies** enforcing security rules
6. **Add triggers** for derived columns and notifications
7. **Update TypeScript types** via codegen
8. **Document** in this README

### Example: Adding Polls

```sql
-- Polls table
CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL, -- [{id: uuid, text: string, votes: int}]
  multiple_choice boolean DEFAULT false,
  closes_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Poll votes
CREATE TABLE poll_votes (
  poll_id uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (poll_id, user_id, option_id)
);

-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies (inherit post visibility)
CREATE POLICY "Users can view polls on posts they can see"
  ON polls FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = post_id AND can_view_post(p.id)
    )
  );

-- Add indexes
CREATE INDEX idx_polls_post_id ON polls(post_id);
CREATE INDEX idx_poll_votes_poll_id ON poll_votes(poll_id);
```

## Troubleshooting

### Common Issues

#### "Email domain not registered"

**Problem**: User trying to sign up with unregistered domain

**Solution**: Add domain to `university_domains` table:

```sql
INSERT INTO university_domains (university_id, domain)
VALUES ('uni-id', 'example.edu');
```

#### "Cannot determine university for author"

**Problem**: Post creation failing because author has no profile

**Solution**: Ensure profile exists and has `university_id`:

```sql
SELECT id, university_id FROM profiles WHERE id = 'user-id';
```

#### "Permission denied" on query

**Problem**: RLS policy blocking access

**Solution**: Check policies and use helper functions:

```sql
-- Check if user can view post
SELECT can_view_post('post-id');

-- Check user's university
SELECT current_university_id();
```

#### Slow feed queries

**Problem**: Feed taking too long to load

**Solution**:
1. Check if indexes exist: `\d posts`
2. Use EXPLAIN ANALYZE to profile query
3. Ensure university_id is indexed
4. Consider materialized views for complex feeds

### Debug Queries

```sql
-- Check RLS policies on a table
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- View user's profile data
SELECT * FROM profiles WHERE id = auth.uid();

-- Check connection status between users
SELECT * FROM connections
WHERE (requester = 'user1' OR requestee = 'user1')
  AND (requester = 'user2' OR requestee = 'user2');

-- Get all tables with RLS enabled
SELECT schemaname, tablename
FROM pg_tables
WHERE rowsecurity = true;
```

## API Documentation

See [`CLIENT_SNIPPETS.md`](./CLIENT_SNIPPETS.md) for:
- Authentication flows
- CRUD operations
- Realtime subscriptions
- File uploads
- Error handling
- Performance tips

## Storage Configuration

See [`STORAGE.md`](./STORAGE.md) for:
- Bucket creation
- RLS policies for files
- Upload conventions
- Metadata requirements
- Security best practices

## Migration History

| Version | File | Description | Date |
|---------|------|-------------|------|
| 001 | `001_uniconnect_schema.sql` | Initial schema with all tables, RLS, triggers, seed data | 2025-10-06 |

## Support & Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security

## License

[Specify your license here]

## Contributors

[Add contributors here]

---

**Built with [Supabase](https://supabase.com) - The Open Source Firebase Alternative**
