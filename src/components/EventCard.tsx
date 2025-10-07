import { Calendar, MapPin, Users, Star, Check } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { useState } from "react";
import type { Event, RSVPStatus } from "../types";

export function EventCard(event: Event) {
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden">
        {event.image && (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute top-3 left-3">
          <div className="bg-card rounded-xl px-3 py-2 text-center shadow-lg">
            <p className="text-xs text-muted-foreground">
              {event.date.split(" ")[0]}
            </p>
            <p className="text-lg leading-none">
              {event.date.split(" ")[1]}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-sm mb-2">{event.title}</h4>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{event.attendees} going • {event.interested} interested</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={rsvpStatus === "going" ? "default" : "outline"}
            onClick={() => setRsvpStatus(rsvpStatus === "going" ? null : "going")}
            className="flex-1 rounded-xl"
          >
            {rsvpStatus === "going" ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Going
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                RSVP
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant={rsvpStatus === "interested" ? "default" : "outline"}
            onClick={() => setRsvpStatus(rsvpStatus === "interested" ? null : "interested")}
            className="flex-1 rounded-xl"
          >
            {rsvpStatus === "interested" ? (
              <>
                <Star className="h-3 w-3 mr-1 fill-current" />
                Interested
              </>
            ) : (
              <>
                <Star className="h-3 w-3 mr-1" />
                Interested
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}