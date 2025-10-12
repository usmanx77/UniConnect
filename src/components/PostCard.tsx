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
      className="relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_28px_75px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-[0_32px_90px_-45px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-white/10"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.avatar} />
              <AvatarFallback className="text-sm font-semibold text-foreground">
                {post.author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-foreground">{post.author}</h4>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {post.department} • {post.batch}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={`h-9 w-9 rounded-full border border-transparent bg-white/40 text-muted-foreground transition hover:border-white/60 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20 ${isBookmarked ? "text-primary" : ""}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-transparent bg-white/40 text-muted-foreground transition hover:border-white/60 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="mb-4 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Poll Widget */}
        {post.poll && <PollWidget poll={post.poll} className="mb-3" />}

        {/* Images */}
        {images.length > 0 && (
          <div
            className={`mb-5 grid overflow-hidden rounded-2xl border border-white/50 bg-white/40 backdrop-blur dark:border-white/10 dark:bg-white/5 ${
            images.length === 1 ? "grid-cols-1" :
            images.length === 2 ? "grid-cols-2" :
            images.length === 3 ? "grid-cols-3" :
            "grid-cols-2"
          }`}
          >
            {images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className={`relative cursor-pointer overflow-hidden transition-all hover:brightness-[1.03] ${
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
                  className="h-56 w-full object-cover"
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
        <div className="mb-4 space-y-2">
          {post.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur dark:border-white/10 dark:bg-white/10"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-xs font-semibold text-primary">
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
          <div className="mb-4 flex items-center justify-between border-b border-white/50 pb-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                {topReactions.map(([type]) => {
                  const Icon = reactionIcons[type as ReactionType];
                  return (
                    <div
                      key={type}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-sm dark:border-white/20 dark:bg-white/10"
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: reactionColors[type as ReactionType] }}
                      />
                    </div>
                  );
                })}
              </div>
              <span className="text-sm font-medium text-muted-foreground">{totalReactions}</span>
            </div>
            {post.comments !== undefined && post.comments > 0 && (
              <span className="cursor-pointer text-sm font-medium text-muted-foreground transition hover:text-foreground">
                {post.comments} comments
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ReactionPicker onReact={handleReaction} currentReaction={userReaction} />
          <Button variant="ghost" size="sm" className="flex-1 rounded-full border border-transparent bg-white/50 px-4 py-2 font-semibold text-muted-foreground transition hover:bg-white/80 hover:text-primary dark:bg-white/10 dark:hover:bg-white/20">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full border border-transparent bg-white/50 px-4 py-2 font-semibold text-muted-foreground transition hover:bg-white/80 hover:text-primary dark:bg-white/10 dark:hover:bg-white/20">
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