import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { EmojiPicker } from "./EmojiPicker";

interface MessageReactionsProps {
  messageId: string;
  reactions: Array<{
    emoji: string;
    users: string[];
    count: number;
  }>;
  currentUserId: string;
  onReactionAdd: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onReactionAdd,
  onReactionRemove
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
      if (existingReaction.users.includes(currentUserId)) {
        onReactionRemove(messageId, emoji);
      } else {
        onReactionAdd(messageId, emoji);
      }
    } else {
      onReactionAdd(messageId, emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onReactionAdd(messageId, emoji);
    setShowEmojiPicker(false);
  };

  const isUserReacted = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction?.users.includes(currentUserId) || false;
  };

  return (
    <div className="flex items-center gap-1">
      {/* Existing reactions */}
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={isUserReacted(reaction.emoji) ? "default" : "outline"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReactionClick(reaction.emoji)}
        >
          {reaction.emoji} {reaction.count}
        </Button>
      ))}

      {/* Quick reactions */}
      <div className="flex items-center gap-1">
        {QUICK_REACTIONS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-xs hover:bg-accent"
            onClick={() => handleReactionClick(emoji)}
          >
            {emoji}
          </Button>
        ))}

        {/* More reactions */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}