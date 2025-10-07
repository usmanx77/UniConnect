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
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <ScrollArea className="w-full">
          <div className="flex gap-4 p-4 overflow-x-auto">
            {/* Add Story Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreateStoryOpen(true)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xs text-center max-w-[64px] truncate">Your Story</span>
            </motion.button>

            {/* Story Groups */}
            {storyGroups.map((group, index) => (
              <motion.button
                key={group.userId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStoryClick(index)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <div
                    className={`p-0.5 rounded-full ${
                      group.hasUnviewed
                        ? "bg-gradient-to-br from-primary via-purple-500 to-pink-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div className="bg-card rounded-full p-0.5">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-primary text-white">
                          {group.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-center max-w-[64px] truncate">
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