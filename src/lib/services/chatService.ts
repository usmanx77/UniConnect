import type { 
  MessageAttachment,
  MessageReaction
} from "../../types";
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced Chat Types - using types from main types file

export interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: number;
}

export interface CreateRoomInput {
  room_type: 'dm' | 'group' | 'society';
  name?: string;
  member_ids: string[];
  society_id?: string;
}

export interface SendMessageInput {
  room_id: string;
  body?: string;
  attachments?: File[];
  reply_to?: string;
}

export interface ChatRoom {
  id: string;
  room_type: 'direct' | 'group' | 'society';
  name: string;
  avatar_url?: string;
  university_id?: string;
  society_id?: string;
  created_by: string;
  last_message_at?: string;
  created_at: string;
  members: ChatMember[];
  unreadCount: number;
  isOnline: boolean;
  is_typing: TypingUser[];
}

export interface ChatMember {
  user_id: string;
  name: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member';
  is_online: boolean;
  last_read_at?: string;
  joined_at: string;
}

export interface EnhancedMessage {
  id: string;
  room_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  body: string;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  reply_to?: string;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

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

      return rooms.map(room => ({
        id: room.id,
        room_type: room.room_type,
        name: room.name,
        avatar_url: room.avatar_url,
        university_id: room.university_id,
        society_id: room.society_id,
        created_by: room.created_by,
        last_message_at: room.last_message_at,
        created_at: room.created_at,
        members: room.room_members.map(member => ({
          user_id: member.user_id,
          name: member.profiles.name,
          avatar_url: member.profiles.avatar_url,
          role: member.role,
          last_read_at: member.last_read_at,
          joined_at: member.joined_at,
          is_online: member.profiles.is_online
        })),
        unread_count: 0, // Will be calculated separately
        is_typing: []
      }));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Failed to fetch chat rooms');
    }
  }

  async createRoom(input: CreateRoomInput): Promise<ChatRoom> {
    try {
      // For DM rooms, check if room already exists
      if (input.room_type === 'dm' && input.member_ids.length === 2) {
        const existingRoom = await this.findDMRoom(input.member_ids[0], input.member_ids[1]);
        if (existingRoom) return existingRoom;
      }

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_type: input.room_type,
          name: input.name,
          society_id: input.society_id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add members to room
      const memberInserts = input.member_ids.map(user_id => ({
        room_id: room.id,
        user_id,
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

      return {
        id: room.id,
        room_type: room.room_type,
        name: room.name,
        avatar_url: room.avatar_url,
        university_id: room.university_id,
        society_id: room.society_id,
        created_by: room.created_by,
        last_message_at: room.last_message_at,
        created_at: room.created_at,
        members: room.room_members.map(member => ({
          user_id: member.user_id,
          name: member.profiles.name,
          avatar_url: member.profiles.avatar_url,
          role: member.role,
          last_read_at: member.last_read_at,
          joined_at: member.joined_at,
          is_online: member.profiles.is_online
        })),
        unread_count: 0,
        is_typing: []
      };
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
      const dmRoom = rooms.find(room => 
        room.room_members.some(m => m.user_id === userId1) &&
        room.room_members.some(m => m.user_id === userId2)
      );

      if (!dmRoom) return null;

      return {
        id: dmRoom.id,
        room_type: dmRoom.room_type,
        name: dmRoom.name,
        avatar_url: dmRoom.avatar_url,
        university_id: dmRoom.university_id,
        society_id: dmRoom.society_id,
        created_by: dmRoom.created_by,
        last_message_at: dmRoom.last_message_at,
        created_at: dmRoom.created_at,
        members: dmRoom.room_members.map(member => ({
          user_id: member.user_id,
          name: member.profiles.name,
          avatar_url: member.profiles.avatar_url,
          role: member.role,
          last_read_at: member.last_read_at,
          joined_at: member.joined_at,
          is_online: member.profiles.is_online
        })),
        unread_count: 0,
        is_typing: []
      };
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

      return messages.map(msg => ({
        id: msg.id,
        room_id: msg.room_id,
        author_id: msg.author_id,
        author_name: msg.profiles.name,
        author_avatar: msg.profiles.avatar_url,
        body: msg.body,
        attachments: msg.attachments || [],
        reactions: this.groupReactions(msg.message_reactions || []),
        reply_to: msg.reply_to,
        edited_at: msg.edited_at,
        created_at: msg.created_at,
        is_edited: !!msg.edited_at,
        is_deleted: false
      })).reverse(); // Reverse to show oldest first
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
          room_id: input.room_id,
          author_id: currentUser.id,
          body: input.body,
          attachments: attachments,
          reply_to: input.reply_to
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
        .eq('id', input.room_id);

      return {
        id: message.id,
        room_id: message.room_id,
        author_id: message.author_id,
        author_name: message.profiles.name,
        author_avatar: message.profiles.avatar_url,
        body: message.body,
        attachments: message.attachments || [],
        reactions: [],
        reply_to: message.reply_to,
        edited_at: message.edited_at,
        created_at: message.created_at,
        is_edited: false,
        is_deleted: false
      };
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
        user_id: currentUser.id,
        user_name: currentUser.user_metadata?.name || 'Unknown',
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

      return messages.map(msg => ({
        id: msg.id,
        room_id: msg.room_id,
        author_id: msg.author_id,
        author_name: msg.profiles.name,
        author_avatar: msg.profiles.avatar_url,
        body: msg.body,
        attachments: msg.attachments || [],
        reactions: this.groupReactions(msg.message_reactions || []),
        reply_to: msg.reply_to,
        edited_at: msg.edited_at,
        created_at: msg.created_at,
        is_edited: !!msg.edited_at,
        is_deleted: false
      }));
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
        async (payload) => {
          const message = payload.new as any;
          
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
            .eq('id', message.id)
            .single();

          if (completeMessage) {
            const enhancedMessage: EnhancedMessage = {
              id: completeMessage.id,
              room_id: completeMessage.room_id,
              author_id: completeMessage.author_id,
              author_name: completeMessage.profiles.name,
              author_avatar: completeMessage.profiles.avatar_url,
              body: completeMessage.body,
              attachments: completeMessage.attachments || [],
              reactions: this.groupReactions(completeMessage.message_reactions || []),
              reply_to: completeMessage.reply_to,
              edited_at: completeMessage.edited_at,
              created_at: completeMessage.created_at,
              is_edited: !!completeMessage.edited_at,
              is_deleted: false
            };

            callback(enhancedMessage);
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
  private groupReactions(reactions: any[]): MessageReaction[] {
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          users: [],
          count: 0
        };
      }
      acc[reaction.emoji].users.push(reaction.user_id);
      acc[reaction.emoji].count++;
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