import { Image, Smile, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

interface PostComposerProps {
  onOpenCreatePost?: () => void;
}

export function PostComposer({ onOpenCreatePost }: PostComposerProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm mb-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary text-white">Y</AvatarFallback>
        </Avatar>
        <input
          type="text"
          placeholder="What's on your mind?"
          onClick={onOpenCreatePost}
          readOnly
          className="flex-1 bg-input-background rounded-full px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        />
      </div>
      <div className="flex items-center gap-2 pl-13">
        <Button variant="ghost" size="sm" className="rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-accent flex-1">
          <Image className="h-4 w-4" />
          <span className="text-sm font-medium">Photo</span>
        </Button>
        <Button variant="ghost" size="sm" className="rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-accent flex-1">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Poll</span>
        </Button>
        <Button variant="ghost" size="sm" className="rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-accent flex-1">
          <Smile className="h-4 w-4" />
          <span className="text-sm font-medium">Feeling</span>
        </Button>
      </div>
    </div>
  );
}
