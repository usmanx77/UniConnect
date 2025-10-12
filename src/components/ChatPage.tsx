import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Send, 
  MoreVertical, 
  ArrowLeft, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  Copy,
  Check,
  X,
  Users,
  Bell,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { EmojiPicker } from "./EmojiPicker";
import { FileUpload } from "./FileUpload";
import { GroupChatManager } from "./GroupChatManager";
import { ChatSettings } from "./ChatSettings";
import { ChatNotifications } from "./ChatNotifications";
import { MobileChatInterface } from "./MobileChatInterface";
import type { EnhancedMessage, ChatRoom } from "../lib/services/chatService";

export function ChatPage() {
  const { user } = useAuth();
  const {
    rooms,
    currentRoom,
    messages,
    typingUsers,
    isLoading,
    searchQuery,
    searchResults,
    setCurrentRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    startTyping,
    stopTyping,
    searchMessages,
    clearSearch
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [replyingTo, setReplyingTo] = useState<EnhancedMessage | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle typing indicators
  useEffect(() => {
    const handleKeyDown = () => startTyping();
    const handleKeyUp = () => stopTyping();

    if (inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown);
      inputRef.current.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('keydown', handleKeyDown);
        inputRef.current.removeEventListener('keyup', handleKeyUp);
      }
    };
  }, [startTyping, stopTyping]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentRoom) return;

    try {
      await sendMessage({
        room_id: currentRoom.id,
        body: messageText.trim(),
        reply_to: replyingTo?.id
      });
      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim()) return;

    try {
      await editMessage(messageId, editText.trim());
      setEditingMessage(null);
      setEditText("");
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!currentRoom || files.length === 0) return;

    try {
      await sendMessage({
        room_id: currentRoom.id,
        attachments: files
      });
      setShowFileUpload(false);
    } catch (error) {
      console.error('Failed to upload files:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.room_type === 'dm') {
      const otherMember = room.members.find(member => member.user_id !== user?.id);
      return otherMember?.name || 'Unknown User';
    }
    return room.name || 'Group Chat';
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.room_type === 'dm') {
      const otherMember = room.members.find(member => member.user_id !== user?.id);
      return otherMember?.avatar_url;
    }
    return room.avatar_url;
  };

  const isMyMessage = (message: EnhancedMessage) => {
    return message.author_id === user?.id;
  };

  const getDisplayMessages = () => {
    return showSearch && searchQuery ? searchResults : messages;
  };

  // Show mobile interface on mobile devices
  if (isMobile && currentRoom) {
    return (
      <MobileChatInterface
        onBack={() => setCurrentRoom(null)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)] md:h-[calc(100vh-160px)] border border-border rounded-2xl overflow-hidden bg-card">
        {/* Conversations List */}
        <div className={`border-r border-border ${currentRoom !== null ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Messages</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowGroupManager(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Create Group
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowNotifications(true)}>
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {showSearch && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => searchMessages(e.target.value)}
                  className="pl-10 rounded-xl"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={clearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading conversations...
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setCurrentRoom(room)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors border-b border-border ${
                    currentRoom?.id === room.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={getRoomAvatar(room)} />
                      <AvatarFallback className="bg-primary text-white">
                        {getRoomName(room).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {room.members.some((member: any) => member.is_online && member.user_id !== user?.id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">{getRoomName(room)}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(room.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {room.last_message_at ? 'Last message...' : 'No messages yet'}
                      </p>
                      {room.unread_count > 0 && (
                        <Badge variant="default" className="ml-2 text-xs px-2 py-0.5">
                          {room.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`md:col-span-2 flex flex-col ${currentRoom === null ? 'hidden md:flex' : 'flex'}`}>
          {currentRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-xl"
                  onClick={() => setCurrentRoom(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={getRoomAvatar(currentRoom)} />
                  <AvatarFallback className="bg-primary text-white">
                    {getRoomName(currentRoom).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{getRoomName(currentRoom)}</h4>
                  <p className="text-xs text-muted-foreground">
                    {typingUsers.length > 0 
                      ? `${typingUsers.map(u => u.user_name).join(', ')} typing...`
                      : `${currentRoom.members.filter((m: any) => m.is_online).length} online`
                    }
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowChatSettings(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Chat Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowGroupManager(true)}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Group
                      </DropdownMenuItem>
                      <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                      <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-sm text-muted-foreground">Loading messages...</div>
                  </div>
                ) : getDisplayMessages().length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm mb-2">No messages yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start the conversation by sending a message
                      </p>
                    </div>
                  </div>
                ) : (
                  getDisplayMessages().map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] group`}>
                        {/* Reply indicator */}
                        {message.reply_to && (
                          <div className="mb-2 ml-4 p-2 bg-muted rounded-lg border-l-2 border-primary">
                            <p className="text-xs text-muted-foreground">Replying to message</p>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isMyMessage(message)
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-accent text-foreground rounded-bl-sm"
                          }`}
                        >
                          {!isMyMessage(message) && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.author_name}
                            </p>
                          )}
                          
                          {editingMessage === message.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="min-h-[60px] resize-none"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditMessage(message.id)}
                                  className="h-8"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingMessage(null);
                                    setEditText("");
                                  }}
                                  className="h-8"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                              
                              {/* Attachments */}
                              {message.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {message.attachments.map((attachment: any) => (
                                    <div key={attachment.id} className="max-w-xs">
                                      {attachment.type === 'image' ? (
                                        <img
                                          src={attachment.url}
                                          alt={attachment.filename}
                                          className="rounded-lg max-w-full h-auto"
                                        />
                                      ) : (
                                        <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                                          <Paperclip className="h-4 w-4" />
                                          <span className="text-xs truncate">{attachment.filename}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <p
                                  className={`text-xs ${
                                    isMyMessage(message) ? "text-white/70" : "text-muted-foreground"
                                  }`}
                                >
                                  {formatTime(message.created_at)}
                                  {message.is_edited && " (edited)"}
                                </p>
                                
                                {isMyMessage(message) && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        setEditingMessage(message.id);
                                        setEditText(message.body || "");
                                      }}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => {
                                        navigator.clipboard.writeText(message.body || "");
                                      }}>
                                        <Copy className="h-3 w-3 mr-2" />
                                        Copy
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Message Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 ml-4">
                            {message.reactions.map((reaction: any) => (
                              <Button
                                key={reaction.emoji}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                              >
                                {reaction.emoji} {reaction.count}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply indicator */}
              {replyingTo && (
                <div className="p-3 border-t border-border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Reply className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Replying to {replyingTo.author_name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {replyingTo.body}
                  </p>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="rounded-xl pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    size="icon" 
                    className="rounded-xl flex-shrink-0"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mt-2">
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        setMessageText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
                
                {/* File Upload */}
                {showFileUpload && (
                  <div className="mt-2">
                    <FileUpload
                      onFilesSelect={handleFileUpload}
                      onClose={() => setShowFileUpload(false)}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm mb-2">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Components */}
      {currentRoom && (
        <>
          <GroupChatManager
            roomId={currentRoom.id}
            isOpen={showGroupManager}
            onClose={() => setShowGroupManager(false)}
          />
          
          <ChatSettings
            roomId={currentRoom.id}
            isOpen={showChatSettings}
            onClose={() => setShowChatSettings(false)}
          />
        </>
      )}

      <ChatNotifications
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
