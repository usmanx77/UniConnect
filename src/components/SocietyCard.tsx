import { Users, Plus, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { useState } from "react";
import type { Society } from "../types";

export function SocietyCard(society: Society) {
  const [isJoined, setIsJoined] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl flex-shrink-0">
            {society.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm mb-1 truncate">{society.name}</h4>
            <Badge variant="secondary" className="text-xs rounded-full">
              {society.category}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {society.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{society.members} members</span>
          </div>
          <Button
            size="sm"
            variant={isJoined ? "outline" : "default"}
            onClick={() => setIsJoined(!isJoined)}
            className="rounded-xl"
          >
            {isJoined ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Joined
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 mr-1" />
                Join
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}