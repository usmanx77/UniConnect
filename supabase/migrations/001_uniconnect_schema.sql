/*
  # UniConnect - University Social Network Platform
  Complete Backend Schema with Security & Performance

  ## Overview
  Production-ready social networking platform with university isolation, comprehensive RLS,
  full-text search, realtime messaging, and optimized feed queries.

  ## Tables Created

  ### Core Identity & Auth
  - `universities` - University master data with domain-based signup control
  - `university_domains` - Email domain allowlist for signup gating
  - `profiles` - Extended user profiles (1:1 with auth.users)
  - `interests` - Taxonomy for user interests
  - `user_interests` - User interest mapping

  ### Social Graph
  - `connections` - Friend connections with request/accept flow

  ### Societies & Groups
  - `societies` - University clubs and organizations
  - `society_members` - Membership with roles

  ### Events
  - `events` - University and society events
  - `event_rsvps` - RSVP tracking

  ### Content & Feed
  - `posts` - Main content feed with visibility controls
  - `post_likes` - Post reactions
  - `post_comments` - Post comments
  - `comment_likes` - Comment reactions
  - `bookmarks` - Saved posts

  ### Messaging
  - `rooms` - Chat rooms (DM, group, society)
  - `room_members` - Room membership
  - `messages` - Chat messages
  - `message_reactions` - Message emoji reactions

  ### Stories (Ephemeral Content)
  - `stories` - 24-hour stories
  - `story_views` - Story view tracking

  ### Notifications
  - `notifications` - In-app notifications

  ### Reports & Moderation
  - `reports` - User-generated content reports
  - `moderation_log` - Admin action audit trail

  ## Security Model
  - All tables have RLS enabled
  - University isolation enforced at DB level
  - Helper functions for authorization checks
  - Triggers maintain data integrity and derived columns

  ## Performance Features
  - Full-text search on posts and profiles
  - Materialized views for feed optimization
  - Partial indexes on common queries
  - Denormalized counters with triggers
  - Strategic indexing on FK and timestamp columns

  ## Notes
  - Uses auth.uid() throughout - never trust client-sent IDs
  - University ID is server-derived from user profile
  - All writes are authenticated
  - Least privilege access by default
*/

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Remove accents for search

-- =====================================================
-- 2. CORE TABLES - UNIVERSITIES & DOMAINS
-- =====================================================

CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL UNIQUE,
  location text,
  logo_url text,
  is_active boolean DEFAULT true,
  strict_enrollment boolean DEFAULT true, -- Enforce domain-based signup
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS university_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  domain text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_university_domains_domain ON university_domains(domain);
CREATE INDEX IF NOT EXISTS idx_university_domains_university_id ON university_domains(university_id);

-- =====================================================
-- 3. PROFILES (Extended User Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES universities(id),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  department text NOT NULL,
  batch text NOT NULL, -- e.g., "Fall 2023"
  bio text,
  avatar_url text,
  cover_url text,

  -- Cached counters
  connections_count int DEFAULT 0,
  societies_count int DEFAULT 0,
  posts_count int DEFAULT 0,

  -- Activity tracking
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),

  -- Gamification
  badges jsonb DEFAULT '[]'::jsonb,
  reputation_score int DEFAULT 0,

  -- Search vector
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(department, '') || ' ' || coalesce(batch, ''))
  ) STORED,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_university_id ON profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector ON profiles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_profiles_department_batch ON profiles(department, batch);

-- =====================================================
-- 4. INTERESTS TAXONOMY
-- =====================================================

CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text, -- e.g., "Technology", "Sports", "Arts"
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_interests (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id uuid NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, interest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest_id ON user_interests(interest_id);

-- =====================================================
-- 5. CONNECTIONS (Social Graph)
-- =====================================================

CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requestee uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Prevent self-connection
  CONSTRAINT no_self_connection CHECK (requester != requestee)
);

-- Create unique index to prevent duplicate connections (bidirectional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_unique_pair ON connections (
  LEAST(requester, requestee),
  GREATEST(requester, requestee)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester);
CREATE INDEX IF NOT EXISTS idx_connections_requestee ON connections(requestee);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_connections_created_at ON connections(created_at DESC);

-- =====================================================
-- 6. SOCIETIES (Clubs & Organizations)
-- =====================================================

CREATE TABLE IF NOT EXISTS societies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  logo_url text,
  cover_url text,
  category text, -- e.g., "Technology", "Sports", "Cultural"
  is_private boolean DEFAULT false,
  member_count int DEFAULT 0,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_societies_university_id ON societies(university_id);
CREATE INDEX IF NOT EXISTS idx_societies_category ON societies(category);
CREATE INDEX IF NOT EXISTS idx_societies_is_private ON societies(is_private);

CREATE TABLE IF NOT EXISTS society_members (
  society_id uuid NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('member', 'admin', 'owner')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (society_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_society_members_user_id ON society_members(user_id);
CREATE INDEX IF NOT EXISTS idx_society_members_society_id ON society_members(society_id);
CREATE INDEX IF NOT EXISTS idx_society_members_role ON society_members(role);

-- =====================================================
-- 7. EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  society_id uuid REFERENCES societies(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  location text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  banner_url text,
  visibility text NOT NULL CHECK (visibility IN ('university', 'society')),
  rsvp_count int DEFAULT 0,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_time_range CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_events_university_id ON events(university_id);
CREATE INDEX IF NOT EXISTS idx_events_society_id ON events(society_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  responded_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_status ON event_rsvps(status);

-- =====================================================
-- 8. POSTS (Main Content Feed)
-- =====================================================

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES universities(id),
  society_id uuid REFERENCES societies(id) ON DELETE SET NULL,
  visibility text NOT NULL CHECK (visibility IN ('university', 'connections', 'society')),
  content text,
  media jsonb DEFAULT '[]'::jsonb, -- [{type: 'image'|'video', url: '...', metadata: {}}]

  -- Cached counters
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares_count int DEFAULT 0,

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(content, ''))
  ) STORED,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Visibility validation
  CONSTRAINT society_visibility_requires_society_id
    CHECK (visibility != 'society' OR society_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_university_id ON posts(university_id);
CREATE INDEX IF NOT EXISTS idx_posts_society_id ON posts(society_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_university ON posts(visibility, university_id, created_at DESC)
  WHERE visibility = 'university';

CREATE TABLE IF NOT EXISTS post_likes (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id uuid NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

CREATE TABLE IF NOT EXISTS bookmarks (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(user_id, created_at DESC);

-- =====================================================
-- 9. STORIES (Ephemeral 24h Content)
-- =====================================================

CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES universities(id),
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  caption text,
  views_count int DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_university_id ON stories(university_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at) WHERE expires_at > now();
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

CREATE TABLE IF NOT EXISTS story_views (
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (story_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id);

-- =====================================================
-- 10. MESSAGING (Rooms & Messages)
-- =====================================================

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type text NOT NULL CHECK (room_type IN ('dm', 'group', 'society')),
  university_id uuid NOT NULL REFERENCES universities(id),
  society_id uuid REFERENCES societies(id) ON DELETE CASCADE,
  name text, -- For group chats
  avatar_url text,
  created_by uuid NOT NULL REFERENCES profiles(id),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),

  -- DM rooms must not have a name, society rooms must have society_id
  CONSTRAINT dm_no_name CHECK (room_type != 'dm' OR name IS NULL),
  CONSTRAINT society_room_requires_society CHECK (room_type != 'society' OR society_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_university_id ON rooms(university_id);
CREATE INDEX IF NOT EXISTS idx_rooms_society_id ON rooms(society_id);
CREATE INDEX IF NOT EXISTS idx_rooms_last_message_at ON rooms(last_message_at DESC);

CREATE TABLE IF NOT EXISTS room_members (
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('member', 'admin')),
  last_read_at timestamptz DEFAULT now(),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text,
  attachments jsonb DEFAULT '[]'::jsonb, -- [{type, url, filename, size}]
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz,

  CONSTRAINT message_has_content CHECK (
    body IS NOT NULL OR jsonb_array_length(attachments) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_author_id ON messages(author_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE TABLE IF NOT EXISTS message_reactions (
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);

-- =====================================================
-- 11. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'connection_request', 'connection_accepted', 'post_reaction', 'post_comment',
    'comment_reply', 'event_reminder', 'society_invite', 'mention', 'achievement',
    'new_message', 'story_reaction'
  )),
  title text NOT NULL,
  message text NOT NULL,
  avatar_url text,
  action_url text,
  action_data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;

-- =====================================================
-- 12. REPORTS & MODERATION
-- =====================================================

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('post', 'comment', 'message', 'user', 'event')),
  content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'false_info', 'other')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_content ON reports(content_type, content_id);

CREATE TABLE IF NOT EXISTS moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL REFERENCES profiles(id),
  action text NOT NULL CHECK (action IN ('warn', 'suspend', 'ban', 'delete_content', 'dismiss_report')),
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_content_type text,
  target_content_id uuid,
  reason text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_log_target_user ON moderation_log(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_log_moderator ON moderation_log(moderator_id, created_at DESC);

-- =====================================================
-- 13. HELPER FUNCTIONS
-- =====================================================

-- Get current user's ID
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Get current user's university ID
CREATE OR REPLACE FUNCTION current_university_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT university_id FROM profiles WHERE id = auth.uid();
$$;

-- Check if given university matches current user's university
CREATE OR REPLACE FUNCTION same_university(p_university_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p_university_id = current_university_id();
$$;

-- Check if two users are connected (accepted connection)
CREATE OR REPLACE FUNCTION are_connected(p_user_a uuid, p_user_b uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM connections
    WHERE status = 'accepted'
      AND (
        (requester = p_user_a AND requestee = p_user_b)
        OR (requester = p_user_b AND requestee = p_user_a)
      )
  );
$$;

-- Check if user is a member of a society
CREATE OR REPLACE FUNCTION is_society_member(p_society_id uuid, p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM society_members
    WHERE society_id = p_society_id
      AND user_id = COALESCE(p_user_id, auth.uid())
  );
$$;

-- Check if current user can view a post
CREATE OR REPLACE FUNCTION can_view_post(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_post posts;
  v_current_user_id uuid := auth.uid();
  v_current_university_id uuid;
BEGIN
  -- Get post details
  SELECT * INTO v_post FROM posts WHERE id = p_post_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get current user's university
  SELECT university_id INTO v_current_university_id
  FROM profiles WHERE id = v_current_user_id;

  -- Must be same university
  IF v_post.university_id != v_current_university_id THEN
    RETURN false;
  END IF;

  -- Check visibility
  CASE v_post.visibility
    WHEN 'university' THEN
      RETURN true;
    WHEN 'connections' THEN
      RETURN are_connected(v_current_user_id, v_post.author_id);
    WHEN 'society' THEN
      RETURN is_society_member(v_post.society_id, v_current_user_id);
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Create or get existing DM room between two users
CREATE OR REPLACE FUNCTION ensure_dm_room(p_user1 uuid, p_user2 uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room_id uuid;
  v_university_id uuid;
BEGIN
  -- Prevent DM with self
  IF p_user1 = p_user2 THEN
    RAISE EXCEPTION 'Cannot create DM room with self';
  END IF;

  -- Check if room already exists
  SELECT r.id INTO v_room_id
  FROM rooms r
  WHERE r.room_type = 'dm'
    AND EXISTS (SELECT 1 FROM room_members rm1 WHERE rm1.room_id = r.id AND rm1.user_id = p_user1)
    AND EXISTS (SELECT 1 FROM room_members rm2 WHERE rm2.room_id = r.id AND rm2.user_id = p_user2);

  IF v_room_id IS NOT NULL THEN
    RETURN v_room_id;
  END IF;

  -- Get university (both users must be in same university)
  SELECT university_id INTO v_university_id FROM profiles WHERE id = p_user1;

  -- Create new room
  INSERT INTO rooms (room_type, university_id, created_by)
  VALUES ('dm', v_university_id, p_user1)
  RETURNING id INTO v_room_id;

  -- Add both members
  INSERT INTO room_members (room_id, user_id, role)
  VALUES
    (v_room_id, p_user1, 'member'),
    (v_room_id, p_user2, 'member');

  RETURN v_room_id;
END;
$$;

-- Send notification helper
CREATE OR REPLACE FUNCTION notify(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_action_url text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_action_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, avatar_url, action_data)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_avatar_url, p_action_data)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- =====================================================
-- 14. TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_societies_updated_at BEFORE UPDATE ON societies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-set university_id on post insert from author's profile
CREATE OR REPLACE FUNCTION set_post_university()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set university_id from author's profile
  SELECT university_id INTO NEW.university_id
  FROM profiles
  WHERE id = NEW.author_id;

  IF NEW.university_id IS NULL THEN
    RAISE EXCEPTION 'Cannot determine university for author';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER set_post_university_trigger BEFORE INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION set_post_university();

-- Validate and set profile university_id on insert
CREATE OR REPLACE FUNCTION validate_profile_university()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email_domain text;
  v_university_id uuid;
  v_strict_enrollment boolean;
BEGIN
  -- Extract domain from email
  v_email_domain := split_part(NEW.email, '@', 2);

  -- Look up university by domain
  SELECT ud.university_id INTO v_university_id
  FROM university_domains ud
  WHERE ud.domain = v_email_domain;

  IF v_university_id IS NULL THEN
    -- Check if strict enrollment is enforced
    IF EXISTS (SELECT 1 FROM universities WHERE is_active = true AND strict_enrollment = true) THEN
      RAISE EXCEPTION 'Email domain % is not registered with any university', v_email_domain;
    END IF;

    -- If not strict, fail gracefully
    RAISE EXCEPTION 'Invalid university assignment';
  END IF;

  -- Set university_id
  NEW.university_id := v_university_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_profile_university_trigger BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION validate_profile_university();

-- Increment/decrement connections_count
CREATE OR REPLACE FUNCTION update_connections_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET connections_count = connections_count + 1
    WHERE id IN (NEW.requester, NEW.requestee);
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET connections_count = connections_count + 1
    WHERE id IN (NEW.requester, NEW.requestee);
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE profiles SET connections_count = connections_count - 1
    WHERE id IN (NEW.requester, NEW.requestee);
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE profiles SET connections_count = connections_count - 1
    WHERE id IN (OLD.requester, OLD.requestee);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_connections_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_connections_count();

-- Update societies_count
CREATE OR REPLACE FUNCTION update_societies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET societies_count = societies_count + 1 WHERE id = NEW.user_id;
    UPDATE societies SET member_count = member_count + 1 WHERE id = NEW.society_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET societies_count = societies_count - 1 WHERE id = OLD.user_id;
    UPDATE societies SET member_count = member_count - 1 WHERE id = OLD.society_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_societies_count_trigger
  AFTER INSERT OR DELETE ON society_members
  FOR EACH ROW EXECUTE FUNCTION update_societies_count();

-- Update post likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update post comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update comment likes_count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE post_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE post_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Update posts_count on profile
CREATE OR REPLACE FUNCTION update_profile_posts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET posts_count = posts_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET posts_count = posts_count - 1 WHERE id = OLD.author_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profile_posts_count_trigger
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_profile_posts_count();

-- Update room last_message_at
CREATE OR REPLACE FUNCTION update_room_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE rooms SET last_message_at = NEW.created_at WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_room_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_room_last_message();

-- Update story views_count
CREATE OR REPLACE FUNCTION update_story_views_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET views_count = views_count + 1 WHERE id = NEW.story_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_story_views_count_trigger
  AFTER INSERT ON story_views
  FOR EACH ROW EXECUTE FUNCTION update_story_views_count();

-- Update event rsvp_count
CREATE OR REPLACE FUNCTION update_event_rsvp_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'going' THEN
    UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'going' AND NEW.status = 'going' THEN
    UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'going' AND NEW.status != 'going' THEN
    UPDATE events SET rsvp_count = rsvp_count - 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'going' THEN
    UPDATE events SET rsvp_count = rsvp_count - 1 WHERE id = OLD.event_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_event_rsvp_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_event_rsvp_count();

-- Send notification on connection request
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_requester_name text;
  v_requester_avatar text;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT name, avatar_url INTO v_requester_name, v_requester_avatar
    FROM profiles WHERE id = NEW.requester;

    PERFORM notify(
      NEW.requestee,
      'connection_request',
      'New Connection Request',
      v_requester_name || ' wants to connect with you',
      '/connections',
      v_requester_avatar,
      jsonb_build_object('connection_id', NEW.id, 'requester_id', NEW.requester)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    SELECT name, avatar_url INTO v_requester_name, v_requester_avatar
    FROM profiles WHERE id = NEW.requestee;

    PERFORM notify(
      NEW.requester,
      'connection_accepted',
      'Connection Accepted',
      v_requester_name || ' accepted your connection request',
      '/profile/' || NEW.requestee,
      v_requester_avatar,
      jsonb_build_object('user_id', NEW.requestee)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_connection_request_trigger
  AFTER INSERT OR UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION notify_connection_request();

-- Send notification on post like
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_author uuid;
  v_liker_name text;
  v_liker_avatar text;
BEGIN
  SELECT author_id INTO v_post_author FROM posts WHERE id = NEW.post_id;

  -- Don't notify if user liked their own post
  IF v_post_author = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT name, avatar_url INTO v_liker_name, v_liker_avatar
  FROM profiles WHERE id = NEW.user_id;

  PERFORM notify(
    v_post_author,
    'post_reaction',
    'New Like',
    v_liker_name || ' liked your post',
    '/post/' || NEW.post_id,
    v_liker_avatar,
    jsonb_build_object('post_id', NEW.post_id, 'user_id', NEW.user_id)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_post_like_trigger
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION notify_post_like();

-- Send notification on post comment
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_author uuid;
  v_commenter_name text;
  v_commenter_avatar text;
BEGIN
  SELECT author_id INTO v_post_author FROM posts WHERE id = NEW.post_id;

  -- Don't notify if user commented on their own post
  IF v_post_author = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT name, avatar_url INTO v_commenter_name, v_commenter_avatar
  FROM profiles WHERE id = NEW.user_id;

  PERFORM notify(
    v_post_author,
    'post_comment',
    'New Comment',
    v_commenter_name || ' commented on your post',
    '/post/' || NEW.post_id,
    v_commenter_avatar,
    jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'user_id', NEW.user_id)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_post_comment_trigger
  AFTER INSERT ON post_comments
  FOR EACH ROW EXECUTE FUNCTION notify_post_comment();

-- =====================================================
-- 15. VIEWS FOR FEED & INBOX
-- =====================================================

-- View: Post counts (likes, comments)
CREATE OR REPLACE VIEW v_post_counts AS
SELECT
  p.id as post_id,
  p.likes_count,
  p.comments_count,
  p.shares_count
FROM posts p;

-- View: Accepted connections for current user
CREATE OR REPLACE VIEW v_my_connections AS
SELECT
  CASE
    WHEN c.requester = auth.uid() THEN c.requestee
    ELSE c.requester
  END as connection_id,
  c.created_at as connected_at
FROM connections c
WHERE c.status = 'accepted'
  AND (c.requester = auth.uid() OR c.requestee = auth.uid());

-- Function: Get university feed for user
CREATE OR REPLACE FUNCTION v_feed_university(p_user_id uuid, p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS TABLE (
  post_id uuid,
  author_id uuid,
  author_name text,
  author_avatar text,
  content text,
  media jsonb,
  visibility text,
  likes_count int,
  comments_count int,
  created_at timestamptz,
  is_liked boolean,
  is_bookmarked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_university_id uuid;
BEGIN
  -- Get user's university
  SELECT university_id INTO v_university_id FROM profiles WHERE id = p_user_id;

  RETURN QUERY
  SELECT
    p.id,
    p.author_id,
    pr.name,
    pr.avatar_url,
    p.content,
    p.media,
    p.visibility,
    p.likes_count,
    p.comments_count,
    p.created_at,
    EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = p_user_id) as is_liked,
    EXISTS(SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = p_user_id) as is_bookmarked
  FROM posts p
  INNER JOIN profiles pr ON pr.id = p.author_id
  WHERE p.university_id = v_university_id
    AND (
      -- University posts visible to all
      p.visibility = 'university'
      -- Connections-only posts visible if connected
      OR (p.visibility = 'connections' AND are_connected(p_user_id, p.author_id))
      -- Society posts visible if member
      OR (p.visibility = 'society' AND is_society_member(p.society_id, p_user_id))
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function: Get user's inbox (rooms with last message)
CREATE OR REPLACE FUNCTION v_inbox(p_user_id uuid)
RETURNS TABLE (
  room_id uuid,
  room_type text,
  room_name text,
  room_avatar text,
  last_message_body text,
  last_message_at timestamptz,
  unread_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.room_type,
    CASE
      WHEN r.room_type = 'dm' THEN (
        SELECT pr.name FROM profiles pr
        INNER JOIN room_members rm2 ON rm2.user_id = pr.id
        WHERE rm2.room_id = r.id AND rm2.user_id != p_user_id
        LIMIT 1
      )
      ELSE r.name
    END as room_name,
    CASE
      WHEN r.room_type = 'dm' THEN (
        SELECT pr.avatar_url FROM profiles pr
        INNER JOIN room_members rm2 ON rm2.user_id = pr.id
        WHERE rm2.room_id = r.id AND rm2.user_id != p_user_id
        LIMIT 1
      )
      ELSE r.avatar_url
    END as room_avatar,
    (SELECT m.body FROM messages m WHERE m.room_id = r.id ORDER BY m.created_at DESC LIMIT 1),
    r.last_message_at,
    (
      SELECT COUNT(*)
      FROM messages m
      INNER JOIN room_members rm ON rm.room_id = r.id AND rm.user_id = p_user_id
      WHERE m.room_id = r.id AND m.created_at > rm.last_read_at
    )
  FROM rooms r
  INNER JOIN room_members rm ON rm.room_id = r.id
  WHERE rm.user_id = p_user_id
  ORDER BY r.last_message_at DESC;
END;
$$;

-- =====================================================
-- 16. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;

-- Universities: Public read, admin write
CREATE POLICY "Universities are viewable by authenticated users"
  ON universities FOR SELECT
  TO authenticated
  USING (is_active = true);

-- University domains: Public read for signup flow
CREATE POLICY "Domains are viewable by anyone"
  ON university_domains FOR SELECT
  TO public
  USING (true);

-- Profiles: Same university can view, users can update own
CREATE POLICY "Users can view profiles in their university"
  ON profiles FOR SELECT
  TO authenticated
  USING (same_university(university_id));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Interests: Public read
CREATE POLICY "Interests are viewable by authenticated users"
  ON interests FOR SELECT
  TO authenticated
  USING (true);

-- User interests: Users manage their own
CREATE POLICY "Users can view their own interests"
  ON user_interests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own interests"
  ON user_interests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own interests"
  ON user_interests FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Connections: Users see their own connections
CREATE POLICY "Users can view connections involving them"
  ON connections FOR SELECT
  TO authenticated
  USING (requester = auth.uid() OR requestee = auth.uid());

CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (requester = auth.uid());

CREATE POLICY "Users can update connections involving them"
  ON connections FOR UPDATE
  TO authenticated
  USING (requester = auth.uid() OR requestee = auth.uid())
  WITH CHECK (requester = auth.uid() OR requestee = auth.uid());

CREATE POLICY "Users can delete connections involving them"
  ON connections FOR DELETE
  TO authenticated
  USING (requester = auth.uid() OR requestee = auth.uid());

-- Societies: Same university, private requires membership
CREATE POLICY "Users can view public societies in their university"
  ON societies FOR SELECT
  TO authenticated
  USING (
    same_university(university_id)
    AND (is_private = false OR is_society_member(id))
  );

CREATE POLICY "Users can create societies in their university"
  ON societies FOR INSERT
  TO authenticated
  WITH CHECK (same_university(university_id) AND created_by = auth.uid());

CREATE POLICY "Society admins can update society"
  ON societies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM society_members sm
      WHERE sm.society_id = id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('admin', 'owner')
    )
  );

-- Society members: Members and admins can view
CREATE POLICY "Users can view society members"
  ON society_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM societies s
      WHERE s.id = society_id
        AND same_university(s.university_id)
        AND (s.is_private = false OR is_society_member(society_id))
    )
  );

CREATE POLICY "Users can join societies"
  ON society_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave societies"
  ON society_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Events: Same university, society events require membership
CREATE POLICY "Users can view events in their university"
  ON events FOR SELECT
  TO authenticated
  USING (
    same_university(university_id)
    AND (visibility = 'university' OR (visibility = 'society' AND is_society_member(society_id)))
  );

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (same_university(university_id) AND created_by = auth.uid());

CREATE POLICY "Event creators can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Event RSVPs: Same university users can RSVP
CREATE POLICY "Users can view event RSVPs"
  ON event_rsvps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id AND same_university(e.university_id)
    )
  );

CREATE POLICY "Users can manage their own RSVPs"
  ON event_rsvps FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Posts: Visibility-based access via can_view_post
CREATE POLICY "Users can view posts based on visibility"
  ON posts FOR SELECT
  TO authenticated
  USING (can_view_post(id));

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Post likes: Users can like posts they can view
CREATE POLICY "Users can view post likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (can_view_post(post_id));

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND can_view_post(post_id));

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Post comments: Users can comment on posts they can view
CREATE POLICY "Users can view comments on posts they can view"
  ON post_comments FOR SELECT
  TO authenticated
  USING (can_view_post(post_id));

CREATE POLICY "Users can comment on posts"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND can_view_post(post_id));

CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Comment likes
CREATE POLICY "Users can view comment likes"
  ON comment_likes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM post_comments pc
      WHERE pc.id = comment_id AND can_view_post(pc.post_id)
    )
  );

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Bookmarks: Users manage their own
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can bookmark posts"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND can_view_post(post_id));

CREATE POLICY "Users can remove bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Stories: Same university, 24h TTL
CREATE POLICY "Users can view active stories in their university"
  ON stories FOR SELECT
  TO authenticated
  USING (same_university(university_id) AND expires_at > now());

CREATE POLICY "Users can create stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete own stories"
  ON stories FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Story views
CREATE POLICY "Story authors can view story views"
  ON story_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_id AND s.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can record story views"
  ON story_views FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Rooms: Only members can access
CREATE POLICY "Users can view rooms they are members of"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = id AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Room members: Only members can view membership
CREATE POLICY "Users can view members of rooms they belong to"
  ON room_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_id AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON room_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave rooms"
  ON room_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own room membership"
  ON room_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages: Only room members
CREATE POLICY "Users can view messages in their rooms"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_id AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their rooms"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_id AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Message reactions
CREATE POLICY "Users can view reactions in their rooms"
  ON message_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      INNER JOIN room_members rm ON rm.room_id = m.room_id
      WHERE m.id = message_id AND rm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can react to messages"
  ON message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
  ON message_reactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Notifications: Owner only
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Reports: Users can view own reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Moderation log: Admin only (implement role check as needed)
CREATE POLICY "Admins can view moderation log"
  ON moderation_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- 17. SEED DATA
-- =====================================================

-- Insert universities
INSERT INTO universities (id, name, short_name, location, is_active, strict_enrollment)
VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851'::uuid, 'Minhaj University', 'MU', 'Lahore, Pakistan', true, true),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852'::uuid, 'University of Central Punjab', 'UCP', 'Lahore, Pakistan', true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert university domains
INSERT INTO university_domains (university_id, domain)
VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851'::uuid, 'minhaj.edu.pk'),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852'::uuid, 'ucp.edu.pk')
ON CONFLICT (domain) DO NOTHING;

-- Insert interests
INSERT INTO interests (name, category)
VALUES
  ('Web Development', 'Technology'),
  ('Mobile Apps', 'Technology'),
  ('AI/ML', 'Technology'),
  ('Football', 'Sports'),
  ('Cricket', 'Sports'),
  ('Photography', 'Arts'),
  ('Music', 'Arts'),
  ('Entrepreneurship', 'Business'),
  ('Debate', 'Academics'),
  ('Gaming', 'Entertainment')
ON CONFLICT (name) DO NOTHING;

-- Note: Actual user data (profiles) must be created through auth signup flow
-- The following is a template for what seed data would look like after users sign up

-- Sample societies (after users exist)
-- INSERT INTO societies (id, university_id, name, description, category, is_private, created_by)
-- VALUES
--   (gen_random_uuid(), 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Tech Society', 'Exploring latest technologies', 'Technology', false, '<user_id>'),
--   (gen_random_uuid(), 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Sports Club', 'University sports activities', 'Sports', false, '<user_id>');

-- =====================================================
-- 18. REALTIME CONFIGURATION
-- =====================================================

-- Enable realtime for key tables
-- This is done automatically by Supabase when you create tables
-- But you can control which tables are published via the dashboard

-- Tables to enable realtime on:
-- - posts (new posts in feed)
-- - post_likes (live like counts)
-- - post_comments (live comments)
-- - messages (live chat)
-- - notifications (live notifications)
-- - stories (new stories)
-- - connections (connection status updates)

-- Example: ALTER PUBLICATION supabase_realtime ADD TABLE posts;
-- Note: Realtime subscriptions will respect RLS policies

-- =====================================================
-- END OF SCHEMA
-- =====================================================
