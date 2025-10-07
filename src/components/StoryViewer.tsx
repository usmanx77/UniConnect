import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import type { StoryGroup } from "../types";

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onView: (storyId: string) => void;
}

export function StoryViewer({
  storyGroups,
  initialGroupIndex,
  isOpen,
  onClose,
  onView,
}: StoryViewerProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const STORY_DURATION = 5000; // 5 seconds

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / STORY_DURATION) * 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentGroupIndex, currentStoryIndex]);

  useEffect(() => {
    if (currentStory) {
      onView(currentStory.id);
    }
  }, [currentStory?.id]);

  const handleNext = () => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  };

  if (!currentStory) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 p-4 z-10 flex gap-1">
            {currentGroup.stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                {idx === currentStoryIndex && (
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                )}
                {idx < currentStoryIndex && <div className="h-full bg-white" />}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-0 right-0 px-4 z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarFallback className="bg-primary text-white">
                  {currentGroup.userName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white">{currentGroup.userName}</p>
                <p className="text-white/70 text-sm">{currentGroup.latestStoryTime}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPaused(!isPaused)}
                className="text-white hover:bg-white/20"
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Story Content */}
          <div
            className="relative w-full max-w-md h-[80vh] rounded-2xl overflow-hidden"
            onClick={handleNext}
          >
            {currentStory.mediaUrl ? (
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-8"
                style={{
                  background:
                    currentStory.backgroundColor ||
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <p className="text-white text-center text-2xl">{currentStory.content}</p>
              </div>
            )}

            {/* Story text overlay */}
            {currentStory.mediaUrl && currentStory.content && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white">{currentStory.content}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="absolute left-4 text-white hover:bg-white/20 h-12 w-12"
            disabled={currentGroupIndex === 0 && currentStoryIndex === 0}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}