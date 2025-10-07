import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import type { Poll, PollOption } from "../types";
import { toast } from "sonner";

interface PollWidgetProps {
  poll: Poll;
  className?: string;
}

export function PollWidget({ poll, className = "" }: PollWidgetProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (selectedOptions.length === 0) {
      toast.error("Please select an option");
      return;
    }
    setHasVoted(true);
    toast.success("Vote recorded!");
  };

  const handleOptionClick = (optionId: string) => {
    if (hasVoted) return;

    if (poll.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const getPercentage = (option: PollOption) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((option.votes / poll.totalVotes) * 100);
  };

  return (
    <div className={`bg-accent/50 rounded-xl p-4 ${className}`}>
      <h4 className="text-sm mb-3">{poll.question}</h4>
      
      <div className="space-y-2 mb-3">
        {poll.options.map((option) => {
          const percentage = getPercentage(option);
          const isSelected = selectedOptions.includes(option.id);
          const showResults = hasVoted;

          return (
            <motion.button
              key={option.id}
              whileHover={!hasVoted ? { scale: 1.02 } : {}}
              whileTap={!hasVoted ? { scale: 0.98 } : {}}
              onClick={() => handleOptionClick(option.id)}
              disabled={hasVoted}
              className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                isSelected && !hasVoted
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              } ${hasVoted ? "cursor-default" : "cursor-pointer hover:border-primary"}`}
            >
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-primary/20"
                />
              )}
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {isSelected && !hasVoted && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <span className="text-sm">{option.text}</span>
                </div>
                {showResults && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{percentage}%</span>
                    <span className="text-xs text-muted-foreground">
                      ({option.votes} {option.votes === 1 ? "vote" : "votes"})
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
          {poll.allowMultiple && " • Multiple choice"}
        </span>
        <span>Ends {poll.endsAt}</span>
      </div>

      {!hasVoted && selectedOptions.length > 0 && (
        <Button
          onClick={handleVote}
          size="sm"
          className="w-full mt-3 rounded-xl"
        >
          Submit Vote
        </Button>
      )}
    </div>
  );
}