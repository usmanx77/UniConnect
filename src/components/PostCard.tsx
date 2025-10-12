import { useState } from "react";
import { MessageCircle, Share2, MoreHorizontal, Bookmark, ThumbsUp, Heart, PartyPopper, HandHeart, Lightbulb } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ReactionPicker } from "./ReactionPicker";
import { ImageLightbox } from "./ImageLightbox";
import { PollWidget } from "./PollWidget";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Post, ReactionType } from "../types";

export function PostCard({ post }: { 
  post: Partial<Post> & {
    author: string;
    department: string;
    batch: string;
    timeAgo: string;
    content: string;
  }
}) {
  const [userReaction, setUserReaction] = useState<ReactionType | undefined>(post.userReaction);
  const [reactions, setReactions] = useState(post.reactions || { like: 0, love: 0, celebrate: 0, support: 0, insightful: 0 });
  const [totalReactions, setTotalReactions] = useState(post.totalReactions || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = post.images || (post.image ? [post.image] : []);

  const handleReaction = (type: ReactionType) => {
    if (userReaction === type) {
      // Remove reaction
      setReactions(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
      setTotalReactions(prev => Math.max(0, prev - 1));
      setUserReaction(undefined);
    } else if (userReaction) {
      // Change reaction
      setReactions(prev => ({
        ...prev,
        [userReaction]: Math.max(0, prev[userReaction] - 1),
        [type]: prev[type] + 1,
      }));
      setUserReaction(type);
    } else {
      // Add new reaction
      setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }));
      setTotalReactions(prev => prev + 1);
      setUserReaction(type);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const reactionIcons = {
    like: ThumbsUp,
    love: Heart,
    celebrate: PartyPopper,
    support: HandHeart,
    insightful: Lightbulb,
  };

  const reactionColors = {
    like: "#3b82f6",
    love: "#ef4444",
    celebrate: "#f59e0b",
    support: "#8b5cf6",
    insightful: "#10b981",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow mb-4"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.avatar} />
              <AvatarFallback className="bg-primary text-white">
                {post.author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">{post.author}</h4>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {post.department} • {post.batch}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={`rounded-full h-8 w-8 hover:bg-accent ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-accent text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.content}</p>

        {/* Poll Widget */}
        {post.poll && <PollWidget poll={post.poll} className="mb-3" />}

        {/* Images */}
        {images.length > 0 && (
          <div className={`mb-3 rounded-lg overflow-hidden grid gap-1 ${
            images.length === 1 ? "grid-cols-1" :
            images.length === 2 ? "grid-cols-2" :
            images.length === 3 ? "grid-cols-3" :
            "grid-cols-2"
          }`}>
            {images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className={`relative cursor-pointer overflow-hidden ${
                  images.length === 3 && idx === 0 ? "col-span-3" : ""
                } ${images.length > 4 && idx === 3 ? "relative" : ""}`}
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
              >
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={img}
                  alt={`Post image ${idx + 1}`}
                  className="w-full h-48 object-cover"
                />
                {images.length > 4 && idx === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {post.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-accent rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-primary">
                  {attachment.type.split("/")[1]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

        {/* Reaction Summary */}
        {totalReactions > 0 && (
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {topReactions.map(([type]) => {
                  const Icon = reactionIcons[type as ReactionType];
                  return (
                    <div
                      key={type}
                      className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
                    >
                      <Icon
                        className="h-3 w-3"
                        style={{ color: reactionColors[type as ReactionType] }}
                      />
                    </div>
                  );
                })}
              </div>
              <span className="text-sm text-muted-foreground">{totalReactions}</span>
            </div>
            {post.comments !== undefined && post.comments > 0 && (
              <span className="text-sm text-muted-foreground hover:underline cursor-pointer">
                {post.comments} comments
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-2">
          <ReactionPicker onReact={handleReaction} currentReaction={userReaction} />
          <Button variant="ghost" size="sm" className="rounded-lg gap-2 flex-1 hover:bg-accent">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-lg gap-2 hover:bg-accent">
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </Button>
        </div>
      </div>

      {/* Image Lightbox */}
      {images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </motion.div>
  );
}