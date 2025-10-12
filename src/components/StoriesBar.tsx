import { useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { StoryViewer } from "./StoryViewer";
import { CreateStoryDialog } from "./CreateStoryDialog";
import { useStories } from "../contexts/StoryContext";
import { motion } from "motion/react";

export function StoriesBar() {
  const { storyGroups, viewStory } = useStories();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  const handleStoryClick = (index: number) => {
    setSelectedGroupIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <ScrollArea className="w-full">
          <div className="flex gap-5 overflow-x-auto px-1 py-1">
            {/* Add Story Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreateStoryOpen(true)}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-[0_20px_45px_-30px_rgba(10,132,255,0.8)] dark:shadow-[0_20px_45px_-28px_rgba(100,210,255,0.35)]">
                  <Plus className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <span className="max-w-[72px] text-center text-xs font-medium text-muted-foreground">Your Story</span>
            </motion.button>

            {/* Story Groups */}
            {storyGroups.map((group, index) => (
              <motion.button
                key={group.userId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStoryClick(index)}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <div className="relative">
                  <div
                    className={`p-0.5 rounded-full ${
                      group.hasUnviewed
                        ? "bg-gradient-to-br from-primary via-primary/70 to-primary/40"
                        : "bg-muted"
                    }`}
                  >
                    <div className="rounded-[1.75rem] bg-white/70 p-0.5 backdrop-blur dark:bg-white/10">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="text-sm font-semibold text-foreground">
                          {group.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
                <span className="max-w-[72px] text-center text-xs font-medium text-muted-foreground">
                  {group.userName.split(" ")[0]}
                </span>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <StoryViewer
        storyGroups={storyGroups}
        initialGroupIndex={selectedGroupIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onView={(storyId) => viewStory(storyId, "currentUser")}
      />

      <CreateStoryDialog open={createStoryOpen} onOpenChange={setCreateStoryOpen} />
    </>
  );
}