import type {
  MessageAttachment,
  MessageReaction,
  ChatRoom,
  ChatMember,
  ChatMessage,
  EnhancedMessage,
  TypingUser,
  CreateRoomInput,
  SendMessageInput,
} from "../../types";
import { createClient, type RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

type SupabaseProfile = {
  name: string;
  avatar_url?: string | null;
  is_online?: boolean | null;
};

type SupabaseRoomMemberRow = {
  user_id: string;
  role: 'member' | 'admin' | 'owner';
  last_read_at?: string | null;
  joined_at: string;
  profiles?: SupabaseProfile | null;
};

type SupabaseLastMessage = {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  read?: boolean | null;
  type?: string | null;
  attachment_url?: string | null;
};

type SupabaseRoomRow = {
  id: string;
  room_type: 'dm' | 'group' | 'society';
  name?: string | null;
  avatar_url?: string | null;
  university_id?: string | null;
  society_id?: string | null;
  created_by: string;
  last_message_at?: string | null;
  created_at: string;
  unread_count?: number | null;
  is_online?: boolean | null;
  room_members?: SupabaseRoomMemberRow[];
  last_message?: SupabaseLastMessage | null;
};

type SupabaseMessageReaction = {
  emoji: string;
  user_id?: string;
  userId?: string;
};

type SupabaseAttachment = {
  id?: string;
  path?: string;
  type?: string;
  fileType?: string;
  url: string;
  size?: number;
  filename?: string;
  name?: string;
  metadata?: Record<string, unknown>;
};

type SupabaseMessageRow = {
  id: string;
  room_id: string;
  author_id: string;
  body?: string | null;
  content?: string | null;
  attachments?: SupabaseAttachment[] | null;
  message_reactions?: SupabaseMessageReaction[] | null;
  reply_to?: string | null;
  edited_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  is_deleted?: boolean | null;
  profiles?: SupabaseProfile | null;
};

class ChatService {
  private typingUsers = new Map<string, Map<string, TypingUser>>();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();

  // Room Management
  async getRooms(): Promise<ChatRoom[]> {
    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members!inner(
            user_id,
            role,
            last_read_at,
            joined_at,
            profiles!inner(
              name,
              avatar_url,
              is_online
            )
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      return rooms.map(room => this.mapRoom(room));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Failed to fetch chat rooms');
    }
  }

  async createRoom(input: CreateRoomInput): Promise<ChatRoom> {
    try {
      // For DM rooms, check if room already exists
      if (input.roomType === 'dm' && input.memberIds.length === 2) {
        const existingRoom = await this.findDMRoom(input.memberIds[0], input.memberIds[1]);
        if (existingRoom) return existingRoom;
      }

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_type: input.roomType,
          name: input.name,
          society_id: input.societyId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add members to room
      const memberInserts = input.memberIds.map(userId => ({
        room_id: room.id,
        user_id: userId,
        role: 'member' as const
      }));

      const { error: membersError } = await supabase
        .from('room_members')
        .insert(memberInserts);

      if (membersError) throw membersError;

      // Fetch the complete room data
      const completeRoom = await this.getRoomById(room.id);
      return completeRoom;
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error('Failed to create chat room');
    }
  }

  async getRoomById(roomId: string): Promise<ChatRoom> {
    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members!inner(
            user_id,
            role,
            last_read_at,
            joined_at,
            profiles!inner(
              name,
              avatar_url,
              is_online
            )
          )
        `)
        .eq('id', roomId)
        .single();

      if (error) throw error;

      return this.mapRoom(room);
    } catch (error) {
      console.error('Error fetching room:', error);
      throw new Error('Failed to fetch chat room');
    }
  }

  private async findDMRoom(userId1: string, userId2: string): Promise<ChatRoom | null> {
    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members!inner(
            user_id,
            role,
            last_read_at,
            joined_at,
            profiles!inner(
              name,
              avatar_url,
              is_online
            )
          )
        `)
        .eq('room_type', 'dm')
        .or(`and(user_id.eq.${userId1},user_id.eq.${userId2}),and(user_id.eq.${userId2},user_id.eq.${userId1})`);

      if (error) throw error;

      // Find room that has both users
      const dmRoom = rooms.find((room: SupabaseRoomRow) =>
        (room.room_members || []).some((member) => member.user_id === userId1) &&
        (room.room_members || []).some((member) => member.user_id === userId2)
      );

      if (!dmRoom) return null;

      return this.mapRoom(dmRoom);
    } catch (error) {
      console.error('Error finding DM room:', error);
      return null;
    }
  }

  // Message Management
  async getMessages(roomId: string, limit = 50, offset = 0): Promise<EnhancedMessage[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!inner(
            name,
            avatar_url
          ),
          message_reactions(
            emoji,
            user_id
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return messages.map(msg => this.mapMessage(msg)).reverse(); // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  async sendMessage(input: SendMessageInput): Promise<EnhancedMessage> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('User not authenticated');

      // Upload attachments if any
      let attachments: MessageAttachment[] = [];
      if (input.attachments && input.attachments.length > 0) {
        attachments = await this.uploadAttachments(input.attachments);
      }

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          room_id: input.roomId,
          author_id: currentUser.id,
          body: input.body,
          attachments: attachments,
          reply_to: input.replyTo
        })
        .select(`
          *,
          profiles!inner(
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Update room's last_message_at
      await supabase
        .from('rooms')
        .update({ last_message_at: message.created_at })
        .eq('id', input.roomId);

      return this.mapMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async editMessage(messageId: string, newBody: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          body: newBody,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('Failed to edit message');
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  // Message Reactions
  async addReaction(messageId: string, emoji: string): Promise<void> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: currentUser.id,
          emoji
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('Failed to add reaction');
    }
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', currentUser.id)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new Error('Failed to remove reaction');
    }
  }

  // Typing Indicators
  async startTyping(roomId: string): Promise<void> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('User not authenticated');

      const typingUser: TypingUser = {
        userId: currentUser.id,
        userName: currentUser.user_metadata?.name || currentUser.email || 'Unknown',
        timestamp: Date.now()
      };

      // Clear existing timeout
      const existingTimeout = this.typingTimeouts.get(currentUser.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout to stop typing after 3 seconds
      const timeout = setTimeout(() => {
        this.stopTyping(roomId);
      }, 3000);

      this.typingTimeouts.set(currentUser.id, timeout);

      // Update typing users
      if (!this.typingUsers.has(roomId)) {
        this.typingUsers.set(roomId, new Map());
      }
      this.typingUsers.get(roomId)!.set(currentUser.id, typingUser);

      // Broadcast typing status (in a real app, this would be via WebSocket)
      this.broadcastTypingStatus(roomId);
    } catch (error) {
      console.error('Error starting typing:', error);
    }
  }

  async stopTyping(roomId: string): Promise<void> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      // Clear timeout
      const timeout = this.typingTimeouts.get(currentUser.id);
      if (timeout) {
        clearTimeout(timeout);
        this.typingTimeouts.delete(currentUser.id);
      }

      // Remove from typing users
      const roomTypingUsers = this.typingUsers.get(roomId);
      if (roomTypingUsers) {
        roomTypingUsers.delete(currentUser.id);
        if (roomTypingUsers.size === 0) {
          this.typingUsers.delete(roomId);
        }
      }

      // Broadcast typing status
      this.broadcastTypingStatus(roomId);
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  }

  // Read Status
  async markAsRead(roomId: string): Promise<void> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('room_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', currentUser.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking as read:', error);
      throw new Error('Failed to mark as read');
    }
  }

  // Search
  async searchMessages(query: string, roomId?: string): Promise<EnhancedMessage[]> {
    try {
      let queryBuilder = supabase
        .from('messages')
        .select(`
          *,
          profiles!inner(
            name,
            avatar_url
          ),
          message_reactions(
            emoji,
            user_id
          )
        `)
        .textSearch('body', query);

      if (roomId) {
        queryBuilder = queryBuilder.eq('room_id', roomId);
      }

      const { data: messages, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return messages.map(msg => this.mapMessage(msg));
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  // Real-time Subscriptions
  subscribeToMessages(roomId: string, callback: (message: EnhancedMessage) => void) {
    return supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        }, 
        async (payload: RealtimePostgresChangesPayload<SupabaseMessageRow>) => {
          const message = payload.new;

          if (
            !message ||
            typeof message !== 'object' ||
            !('id' in message)
          ) {
            return;
          }

          const messageRow = message as SupabaseMessageRow;

          // Fetch complete message data
          const { data: completeMessage } = await supabase
            .from('messages')
            .select(`
              *,
              profiles!inner(
                name,
                avatar_url
              ),
              message_reactions(
                emoji,
                user_id
              )
            `)
            .eq('id', messageRow.id)
            .single();

          if (completeMessage) {
            callback(this.mapMessage(completeMessage));
          }
        })
      .subscribe();
  }

  subscribeToTyping(roomId: string, callback: (typingUsers: TypingUser[]) => void) {
    // In a real implementation, this would use WebSocket or Supabase realtime
    // For now, we'll use a simple polling mechanism
    const interval = setInterval(() => {
      const roomTypingUsers = this.typingUsers.get(roomId);
      if (roomTypingUsers) {
        const typingArray = Array.from(roomTypingUsers.values())
          .filter(user => Date.now() - user.timestamp < 5000); // 5 second timeout
        callback(typingArray);
      }
    }, 1000);

    return () => clearInterval(interval);
  }

  // Helper Methods
  private mapMember(member: SupabaseRoomMemberRow): ChatMember {
    return {
      userId: member.user_id,
      name: member.profiles?.name ?? "Unknown",
      avatarUrl: member.profiles?.avatar_url ?? undefined,
      role: member.role,
      lastReadAt: member.last_read_at ?? undefined,
      joinedAt: member.joined_at,
      isOnline: Boolean(member.profiles?.is_online ?? false),
    };
  }

  private normalizeMessageType(
    type: string | null | undefined,
  ): ChatMessage["type"] | undefined {
    switch (type) {
      case "text":
      case "image":
      case "file":
        return type;
      default:
        return undefined;
    }
  }

  private mapRoom(room: SupabaseRoomRow): ChatRoom {
    const members = Array.isArray(room.room_members)
      ? room.room_members.map((member) => this.mapMember(member))
      : [];

    return {
      id: room.id,
      roomType: room.room_type,
      name: room.name ?? undefined,
      avatarUrl: room.avatar_url ?? undefined,
      universityId: room.university_id ?? undefined,
      societyId: room.society_id ?? undefined,
      createdBy: room.created_by,
      lastMessageAt: room.last_message_at ?? undefined,
      createdAt: room.created_at,
      members,
      unreadCount: room.unread_count ?? 0,
      typingUsers: [],
      isOnline: room.is_online ?? undefined,
      lastMessage: room.last_message
        ? {
            id: room.last_message.id,
            senderId: room.last_message.sender_id,
            senderName: room.last_message.sender_name,
            content: room.last_message.content,
            timestamp: room.last_message.timestamp,
            read: Boolean(room.last_message.read ?? false),
            type: this.normalizeMessageType(room.last_message.type),
            attachmentUrl: room.last_message.attachment_url ?? undefined,
          }
        : undefined,
    };
  }

  private mapAttachments(attachments: SupabaseAttachment[] | null | undefined): MessageAttachment[] {
    if (!Array.isArray(attachments)) {
      return [];
    }

    return attachments.map((attachment) => ({
      id: attachment.id ?? attachment.path ?? `${Date.now()}-${Math.random()}`,
      type: attachment.type ?? attachment.fileType ?? "file",
      url: attachment.url,
      size: attachment.size ?? 0,
      filename: attachment.filename ?? attachment.name ?? "attachment",
      name: attachment.name,
      metadata: attachment.metadata,
    }));
  }

  private mapMessage(message: SupabaseMessageRow): EnhancedMessage {
    return {
      id: message.id,
      roomId: message.room_id,
      authorId: message.author_id,
      authorName: message.profiles?.name ?? "Unknown",
      authorAvatar: message.profiles?.avatar_url ?? undefined,
      content: message.body ?? message.content ?? "",
      attachments: this.mapAttachments(message.attachments),
      reactions: this.groupReactions(message.message_reactions),
      replyTo: message.reply_to ?? undefined,
      editedAt: message.edited_at ?? undefined,
      createdAt: message.created_at,
      updatedAt: message.updated_at ?? undefined,
      isEdited: Boolean(message.edited_at),
      isDeleted: Boolean(message.is_deleted),
    };
  }

  private groupReactions(reactions: SupabaseMessageReaction[] | null | undefined): MessageReaction[] {
    if (!Array.isArray(reactions)) {
      return [];
    }

    const grouped = reactions.reduce((acc, reaction) => {
      const key = reaction.emoji;
      if (!key) {
        return acc;
      }

      if (!acc[key]) {
        acc[key] = {
          emoji: key,
          users: [],
          count: 0,
        };
      }

      const userId = reaction.user_id ?? reaction.userId;
      if (userId) {
        acc[key].users.push(userId);
      }
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, MessageReaction>);

    return Object.values(grouped);
  }

  private async uploadAttachments(files: File[]): Promise<MessageAttachment[]> {
    const attachments: MessageAttachment[] = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `chat-attachments/${fileName}`;

        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        attachments.push({
          id: data.path,
          type: this.getFileType(file.type),
          url: publicUrl,
          filename: file.name,
          size: file.size,
          metadata: {
            mimeType: file.type
          }
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        // Continue with other files
      }
    }

    return attachments;
  }

  private getFileType(mimeType: string): 'image' | 'video' | 'file' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }

  private broadcastTypingStatus(roomId: string): void {
    // In a real implementation, this would broadcast via WebSocket
    // For now, we'll use a simple event system
    const event = new CustomEvent('typingStatusChanged', {
      detail: { roomId, typingUsers: Array.from(this.typingUsers.get(roomId)?.values() || []) }
    });
    window.dispatchEvent(event);
  }
}

export const chatService = new ChatService();