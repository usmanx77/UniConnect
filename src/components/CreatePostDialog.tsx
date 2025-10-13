import { useState } from "react";
import { Image, BarChart3, Smile, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { postService } from "../lib/services/postService";
import { validators } from "../lib/utils/validation";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"text" | "poll">("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const toast = useToast();


  const handlePost = async () => {
    const validation = validators.postContent(postContent);
    if (!validation.valid) {
      setError(validation.message || "Invalid post content");
      return;
    }
    setError("");

    setIsSubmitting(true);
    try {
      await postService.createPost({ content: postContent });
      toast.success(toast.messages.success.POST_CREATED);
      setPostContent("");
      setError("");
      onOpenChange(false);
      onPostCreated?.();
    } catch {
      setError("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription className="sr-only">
            Share your thoughts, photos, or create a poll with your university community
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-white">Y</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm">{user?.name || "You"}</h4>
              <p className="text-xs text-muted-foreground">
                {user?.department && user?.batch ? `${user.department} • ${user.batch}` : ""}
              </p>
            </div>
          </div>

          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => {
              setPostContent(e.target.value);
              if (error) setError("");
            }}
            className="min-h-[120px] mb-4 rounded-xl resize-none"
          />

          {error && (
            <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-semibold">
                <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}


          {postType === "poll" && (
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Poll option 1"
                className="w-full px-4 py-2 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                placeholder="Poll option 2"
                className="w-full px-4 py-2 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button variant="outline" className="w-full rounded-xl">
                Add Option
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6 p-3 border border-border rounded-xl">
            <span className="text-sm">Add to post:</span>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => setPostType("text")}
            >
              <Image className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => setPostType(postType === "poll" ? "text" : "poll")}
            >
              <BarChart3 className={`h-4 w-4 ${postType === "poll" ? "text-primary" : "text-blue-600"}`} />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl gap-2">
              <Smile className="h-4 w-4 text-yellow-600" />
            </Button>
          </div>

          <Button
            onClick={handlePost}
            disabled={!postContent.trim() || isSubmitting}
            className="w-full rounded-xl h-11"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
