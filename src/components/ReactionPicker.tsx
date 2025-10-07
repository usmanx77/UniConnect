import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, Heart, PartyPopper, HandHeart, Lightbulb } from "lucide-react";
import type { ReactionType } from "../types";

interface ReactionPickerProps {
  onReact: (type: ReactionType) => void;
  currentReaction?: ReactionType;
}

const reactions = [
  { type: "like" as ReactionType, icon: ThumbsUp, label: "Like", color: "#3b82f6" },
  { type: "love" as ReactionType, icon: Heart, label: "Love", color: "#ef4444" },
  { type: "celebrate" as ReactionType, icon: PartyPopper, label: "Celebrate", color: "#f59e0b" },
  { type: "support" as ReactionType, icon: HandHeart, label: "Support", color: "#8b5cf6" },
  { type: "insightful" as ReactionType, icon: Lightbulb, label: "Insightful", color: "#10b981" },
];

export function ReactionPicker({ onReact, currentReaction }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => {
          if (currentReaction) {
            onReact(currentReaction);
          } else {
            onReact("like");
          }
        }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-accent transition-colors"
      >
        {currentReaction ? (
          <>
            {reactions.find((r) => r.type === currentReaction)?.icon && (
              <span style={{ color: reactions.find((r) => r.type === currentReaction)?.color }}>
                {(() => {
                  const reaction = reactions.find((r) => r.type === currentReaction);
                  const Icon = reaction?.icon;
                  return Icon ? <Icon className="h-4 w-4" /> : null;
                })()}
              </span>
            )}
            <span className="text-sm capitalize">{currentReaction}</span>
          </>
        ) : (
          <>
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">React</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-2xl shadow-lg p-2 flex gap-2 z-50"
          >
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.type}
                whileHover={{ scale: 1.2, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onReact(reaction.type);
                  setIsOpen(false);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-accent transition-colors"
                title={reaction.label}
              >
                <reaction.icon className="h-6 w-6" style={{ color: reaction.color }} />
                <span className="text-xs">{reaction.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}