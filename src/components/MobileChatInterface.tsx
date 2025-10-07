import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  Send,
  Smile,
  Paperclip,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface MobileChatInterfaceProps {
  roomId: string;
  onBack: () => void;
}

export function MobileChatInterface({ roomId, onBack }: MobileChatInterfaceProps) {
  const { user } = useAuth();
  const {
    currentRoom,
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle keyboard events
  useEffect(() => {
    const handleResize = () => {
      const isKeyboardOpen = window.innerHeight < 500; // Approximate keyboard detection
      setIsKeyboardOpen(isKeyboardOpen);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mark as read when component mounts
  useEffect(() => {
    if (currentRoom) {
      markAsRead();
    }
  }, [currentRoom, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentRoom) return;

    try {
      await sendMessage({
        room_id: currentRoom.id,
        body: messageText.trim()
      });
      setMessageText("");
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

  const handleInputFocus = () => {
    startTyping();
  };

  const handleInputBlur = () => {
    stopTyping();
  };

  const getRoomName = (room: any) => {
    if (room.room_type === 'dm') {
      const otherMember = room.members.find((member: any) => member.user_id !== user?.id);
      return otherMember?.name || 'Unknown User';
    }
    return room.name || 'Group Chat';
  };

  const getRoomAvatar = (room: any) => {
    if (room.room_type === 'dm') {
      const otherMember = room.members.find((member: any) => member.user_id !== user?.id);
      return otherMember?.avatar_url;
    }
    return room.avatar_url;
  };

  const isMyMessage = (message: any) => {
    return message.author_id === user?.id;
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm mb-2">Chat not found</h3>
          <p className="text-sm text-muted-foreground">
            This chat room could not be loaded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={getRoomAvatar(currentRoom)} />
          <AvatarFallback className="bg-primary text-white text-xs">
            {getRoomName(currentRoom).charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{getRoomName(currentRoom)}</h4>
          <p className="text-xs text-muted-foreground">
            {typingUsers.length > 0 
              ? `${typingUsers.map(u => u.user_name).join(', ')} typing...`
              : `${currentRoom.members.filter((m: any) => m.is_online).length} online`
            }
          </p>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
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
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] group`}>
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
                  
                  <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  
                  {/* Attachments */}
                  {message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
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
                  
                  <p
                    className={`text-xs mt-1 ${
                      isMyMessage(message) ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.created_at)}
                    {message.is_edited && " (edited)"}
                  </p>
                </div>
                
                {/* Message Reactions */}
                {message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 ml-4">
                    {message.reactions.map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
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

      {/* Message Input */}
      <div className={`p-4 border-t border-border bg-card ${isKeyboardOpen ? 'pb-8' : ''}`}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
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
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Choose an emoji</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowEmojiPicker(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {["😀", "😂", "😍", "🥰", "😎", "🤔", "👍", "👎", "❤️", "🔥", "💯", "🎉", "👏", "🙌", "🤝", "💪"].map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg"
                    onClick={() => {
                      setMessageText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* File Upload */}
        {showFileUpload && (
          <div className="mt-2">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Upload Files</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowFileUpload(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  File upload coming soon
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}