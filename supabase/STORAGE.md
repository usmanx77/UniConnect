# Supabase Storage Configuration

## Overview

UniConnect uses Supabase Storage for all media assets with strict privacy controls based on content visibility and university isolation.

## Storage Buckets

Create the following buckets in your Supabase dashboard or via SQL:

| Bucket Name | Public | Description |
|-------------|--------|-------------|
| `avatars` | Yes | User profile avatars |
| `covers` | Yes | User profile cover images |
| `post-images` | No | Post media (images/videos) - visibility-controlled |
| `story-images` | No | Story media - 24h TTL, university-only |
| `society-logos` | Yes | Society logos and branding |
| `society-covers` | Yes | Society cover images |
| `event-banners` | Yes | Event promotional images |
| `chat-attachments` | No | DM and group chat files - room members only |

## Storage Policies

### Setup Instructions

For each bucket, you need to create policies using the Supabase dashboard (Storage > Policies) or via the SQL API.

### Policy Templates

#### 1. Avatars Bucket (Public)

```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### 2. Covers Bucket (Public)

```sql
-- Allow authenticated users to upload their own cover
CREATE POLICY "Users can upload own cover"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own cover
CREATE POLICY "Users can update own cover"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own cover
CREATE POLICY "Users can delete own cover"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access
CREATE POLICY "Covers are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');
```

#### 3. Post Images (Visibility-Controlled)

```sql
-- Allow authenticated users to upload post images
CREATE POLICY "Users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow post authors to delete their post images
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Read access based on post visibility (requires metadata)
CREATE POLICY "Users can view post images based on visibility"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'post-images'
  AND (
    -- Owner can always view
    (storage.foldername(name))[1] = auth.uid()::text
    -- Or check post visibility via metadata
    OR can_view_post((metadata->>'post_id')::uuid)
  )
);
```

**Important**: When uploading post images, include post_id in metadata:

```typescript
const { data, error } = await supabase.storage
  .from('post-images')
  .upload(`${userId}/${filename}`, file, {
    metadata: {
      post_id: postId
    }
  });
```

#### 4. Story Images (24h TTL, University Only)

```sql
-- Allow authenticated users to upload stories
CREATE POLICY "Users can upload story images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow story authors to delete their stories
CREATE POLICY "Users can delete own story images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Read access for same university users (requires metadata)
CREATE POLICY "Users can view stories from same university"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'story-images'
  AND (
    -- Owner can always view
    (storage.foldername(name))[1] = auth.uid()::text
    -- Or check university match via story
    OR EXISTS (
      SELECT 1 FROM stories s
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE s.id = (metadata->>'story_id')::uuid
        AND s.university_id = p.university_id
        AND s.expires_at > now()
    )
  )
);
```

#### 5. Society Logos & Covers (Public)

```sql
-- Allow society admins to upload logo
CREATE POLICY "Society admins can upload logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'society-logos'
  AND EXISTS (
    SELECT 1 FROM society_members sm
    WHERE sm.society_id = (metadata->>'society_id')::uuid
      AND sm.user_id = auth.uid()
      AND sm.role IN ('admin', 'owner')
  )
);

-- Society admins can update
CREATE POLICY "Society admins can update logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'society-logos'
  AND EXISTS (
    SELECT 1 FROM society_members sm
    WHERE sm.society_id = (metadata->>'society_id')::uuid
      AND sm.user_id = auth.uid()
      AND sm.role IN ('admin', 'owner')
  )
);

-- Society admins can delete
CREATE POLICY "Society admins can delete logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'society-logos'
  AND EXISTS (
    SELECT 1 FROM society_members sm
    WHERE sm.society_id = (metadata->>'society_id')::uuid
      AND sm.user_id = auth.uid()
      AND sm.role IN ('admin', 'owner')
  )
);

-- Public read
CREATE POLICY "Society logos are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'society-logos');

-- Repeat similar policies for society-covers
```

#### 6. Event Banners (Public)

```sql
-- Allow event creators to upload banner
CREATE POLICY "Event creators can upload banner"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-banners'
  AND EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = (metadata->>'event_id')::uuid
      AND e.created_by = auth.uid()
  )
);

-- Event creators can update/delete
CREATE POLICY "Event creators can update banner"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-banners'
  AND EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = (metadata->>'event_id')::uuid
      AND e.created_by = auth.uid()
  )
);

CREATE POLICY "Event creators can delete banner"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-banners'
  AND EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = (metadata->>'event_id')::uuid
      AND e.created_by = auth.uid()
  )
);

-- Public read
CREATE POLICY "Event banners are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-banners');
```

#### 7. Chat Attachments (Room Members Only)

```sql
-- Allow room members to upload attachments
CREATE POLICY "Room members can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND EXISTS (
    SELECT 1 FROM room_members rm
    WHERE rm.room_id = (metadata->>'room_id')::uuid
      AND rm.user_id = auth.uid()
  )
);

-- Allow uploaders to delete
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Read access for room members only
CREATE POLICY "Room members can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND EXISTS (
    SELECT 1 FROM room_members rm
    WHERE rm.room_id = (metadata->>'room_id')::uuid
      AND rm.user_id = auth.uid()
  )
);
```

## File Upload Conventions

### Folder Structure

Use the following folder structure for organized storage:

```
avatars/
  {user_id}/
    avatar.jpg

covers/
  {user_id}/
    cover.jpg

post-images/
  {user_id}/
    {post_id}_1.jpg
    {post_id}_2.jpg

story-images/
  {user_id}/
    {story_id}.jpg

society-logos/
  {society_id}/
    logo.png

society-covers/
  {society_id}/
    cover.jpg

event-banners/
  {event_id}/
    banner.jpg

chat-attachments/
  {user_id}/
    {room_id}/
      {timestamp}_{filename}
```

### Metadata Requirements

Always include relevant IDs in metadata for policy enforcement:

- **Post images**: `{ post_id: uuid }`
- **Story images**: `{ story_id: uuid }`
- **Society assets**: `{ society_id: uuid }`
- **Event banners**: `{ event_id: uuid }`
- **Chat attachments**: `{ room_id: uuid, message_id: uuid }`

### File Size Limits

Configure bucket-level limits in Supabase dashboard:

- Avatars: 2MB max
- Covers: 5MB max
- Post images: 10MB max per file
- Story images: 10MB max
- Society/Event assets: 5MB max
- Chat attachments: 20MB max

### File Type Validation

Implement client-side validation for allowed MIME types:

- **Images**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Videos**: `video/mp4`, `video/quicktime` (for stories/posts)
- **Documents**: `application/pdf`, `application/msword`, etc. (for chat)

## Security Best Practices

1. **Never trust client-sent metadata**: Validate ownership server-side
2. **Use signed URLs** for private content with expiration
3. **Implement virus scanning** via Edge Functions if handling user documents
4. **Set up CDN caching** for public assets (avatars, logos)
5. **Monitor storage usage** and implement quotas per user/university
6. **Enable file versioning** for critical assets
7. **Implement cleanup jobs** for orphaned files (e.g., deleted posts)

## Cleanup & Maintenance

### Auto-delete expired stories

Create a database function triggered daily:

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_story RECORD;
BEGIN
  FOR expired_story IN
    SELECT id, media_url FROM stories WHERE expires_at < now()
  LOOP
    -- Delete from storage (implement via Edge Function)
    -- DELETE FROM storage.objects WHERE name = extract_path(expired_story.media_url);

    -- Delete from database
    DELETE FROM stories WHERE id = expired_story.id;
  END LOOP;
END;
$$;
```

### Delete orphaned post images

When a post is deleted, clean up associated images via a trigger or Edge Function.

## Example Upload Flow

### Upload Avatar

```typescript
const uploadAvatar = async (file: File) => {
  const userId = supabase.auth.user()?.id;
  const filePath = `${userId}/avatar.jpg`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  return publicUrl;
};
```

### Upload Post Image with Visibility

```typescript
const uploadPostImage = async (file: File, postId: string) => {
  const userId = supabase.auth.user()?.id;
  const timestamp = Date.now();
  const filePath = `${userId}/${postId}_${timestamp}.jpg`;

  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(filePath, file, {
      contentType: file.type,
      metadata: {
        post_id: postId
      }
    });

  if (error) throw error;

  // Get signed URL (expires in 1 hour)
  const { data: { signedUrl } } = await supabase.storage
    .from('post-images')
    .createSignedUrl(filePath, 3600);

  return signedUrl;
};
```

### Upload Chat Attachment

```typescript
const uploadChatAttachment = async (file: File, roomId: string, messageId: string) => {
  const userId = supabase.auth.user()?.id;
  const timestamp = Date.now();
  const filePath = `${userId}/${roomId}/${timestamp}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('chat-attachments')
    .upload(filePath, file, {
      contentType: file.type,
      metadata: {
        room_id: roomId,
        message_id: messageId
      }
    });

  if (error) throw error;

  // Get signed URL (expires in 24 hours)
  const { data: { signedUrl } } = await supabase.storage
    .from('chat-attachments')
    .createSignedUrl(filePath, 86400);

  return {
    url: signedUrl,
    filename: file.name,
    size: file.size,
    type: file.type
  };
};
```

## Monitoring & Analytics

Track storage metrics:

- Total storage per university
- Storage per user
- Upload frequency
- Failed uploads
- Bandwidth usage

Create a monitoring view:

```sql
CREATE OR REPLACE VIEW v_storage_stats AS
SELECT
  p.university_id,
  u.name as university_name,
  COUNT(DISTINCT p.id) as user_count,
  COUNT(DISTINCT posts.id) as total_posts,
  COUNT(DISTINCT stories.id) as total_stories,
  SUM(posts.media::jsonb->0->>'size')::bigint as estimated_storage_bytes
FROM profiles p
INNER JOIN universities u ON u.id = p.university_id
LEFT JOIN posts ON posts.author_id = p.id
LEFT JOIN stories ON stories.author_id = p.id
GROUP BY p.university_id, u.name;
```

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check RLS policies on storage.objects
2. **Metadata not accessible**: Ensure metadata is set during upload
3. **Signed URL expired**: Refresh URL before use
4. **File not found**: Verify path and bucket name
5. **Upload fails**: Check bucket exists and file size limits

### Debug Storage Policy

```sql
-- Check if user can access file
SELECT storage.can_access_object(
  'post-images',
  'user-id/post-id_123.jpg',
  'SELECT'
);
```
