import { Image, Smile, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

interface PostComposerProps {
  onOpenCreatePost?: () => void;
}

export function PostComposer({ onOpenCreatePost }: PostComposerProps) {
  return (
    <div className="group relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_28px_75px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-sm font-semibold text-foreground">Y</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-4 rounded-[1.75rem] border border-white/60 bg-white/60 px-5 py-3 shadow-inner transition focus-within:border-primary/60 focus-within:shadow-[0_0_0_1px_rgba(10,132,255,0.3)] dark:border-white/10 dark:bg-white/5">
            <input
              type="text"
              placeholder="Share something inspiring with your campus community..."
              onClick={onOpenCreatePost}
              readOnly
              className="w-full cursor-pointer bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 shadow-sm dark:bg-white/10">Designed for clarity</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 shadow-sm dark:bg-white/10">Smooth to interact</span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-2 border-t border-white/60 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="flex w-full flex-1 flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1 rounded-full bg-white/50 px-4 py-2 text-muted-foreground transition hover:bg-white/80 hover:text-primary dark:bg-white/10 dark:hover:bg-white/20">
            <Image className="h-4 w-4" />
            <span className="text-sm font-medium">Photo</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 rounded-full bg-white/50 px-4 py-2 text-muted-foreground transition hover:bg-white/80 hover:text-primary dark:bg-white/10 dark:hover:bg-white/20">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Poll</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 rounded-full bg-white/50 px-4 py-2 text-muted-foreground transition hover:bg-white/80 hover:text-primary dark:bg-white/10 dark:hover:bg-white/20">
            <Smile className="h-4 w-4" />
            <span className="text-sm font-medium">Feeling</span>
          </Button>
        </div>
        <Button
          onClick={onOpenCreatePost}
          className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 px-6 py-2 text-sm font-semibold text-primary-foreground shadow-[0_20px_45px_-25px_rgba(10,132,255,0.7)] transition hover:-translate-y-0.5 sm:w-auto"
        >
          Start Writing
        </Button>
      </div>
    </div>
  );
}
