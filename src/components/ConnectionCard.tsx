import { UserPlus, MessageCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import type { Connection } from "../types";

export function ConnectionCard(connection: Connection) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-primary text-white">
            {connection.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm mb-1 truncate">{connection.name}</h4>
          <p className="text-xs text-muted-foreground mb-1">
            {connection.department} • {connection.batch}
          </p>
          {connection.mutualConnections && connection.mutualConnections > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{connection.mutualConnections} mutual</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" className="flex-1 rounded-xl">
          <UserPlus className="h-3 w-3 mr-1" />
          Connect
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl">
          <MessageCircle className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
}