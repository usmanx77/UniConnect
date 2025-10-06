import { useState } from "react";
import { Calendar, MapPin, Users, Clock, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function EventsPage() {
  const [rsvpStatus, setRsvpStatus] = useState<{ [key: string]: "going" | "interested" | null }>({
    "Tech Talk: Future of AI": "going",
    "Career Fair 2024": "interested",
  });
  const upcomingEvents = [
    {
      title: "Tech Talk: Future of AI",
      date: "Oct 12, 2025",
      time: "5:00 PM - 7:00 PM",
      location: "Building A, Auditorium",
      organizer: "Computer Science Society",
      attendees: 89,
      image: "https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NTk3MTI0OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      interested: 142,
    },
    {
      title: "Fall Sports Day",
      date: "Oct 15, 2025",
      time: "9:00 AM - 5:00 PM",
      location: "University Stadium",
      organizer: "Athletics Club",
      attendees: 234,
      image: "https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwZXZlbnR8ZW58MXx8fHwxNzU5NzM0NDM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      interested: 312,
    },
    {
      title: "Career Fair 2024",
      date: "Oct 20, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "Main Campus Hall",
      organizer: "Career Services",
      attendees: 456,
      image: "https://images.unsplash.com/photo-1545873681-d8affd67677b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZXIlMjBmYWlyJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzU5NzM0NDM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      interested: 589,
    },
    {
      title: "Open Mic Night",
      date: "Oct 18, 2025",
      time: "7:00 PM - 10:00 PM",
      location: "Student Center",
      organizer: "Music Society",
      attendees: 67,
      image: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTk2OTI2MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      interested: 98,
    },
  ];

  const myEvents = upcomingEvents
    .filter(event => rsvpStatus[event.title])
    .map(event => ({
      title: event.title,
      date: event.date,
      status: rsvpStatus[event.title] === "going" ? "Going" : "Interested",
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="mb-2">Events</h2>
        <p className="text-muted-foreground">Discover and join campus events</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full justify-start rounded-xl mb-6">
          <TabsTrigger value="upcoming" className="rounded-xl">Upcoming</TabsTrigger>
          <TabsTrigger value="my-events" className="rounded-xl">
            My Events
            {myEvents.length > 0 && (
              <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {myEvents.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="text-sm mb-3">{event.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {event.attendees} going • {event.interested} interested
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Organized by {event.organizer}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 rounded-xl h-10"
                      variant={rsvpStatus[event.title] === "going" ? "default" : "outline"}
                      onClick={() => setRsvpStatus({
                        ...rsvpStatus,
                        [event.title]: rsvpStatus[event.title] === "going" ? null : "going"
                      })}
                    >
                      {rsvpStatus[event.title] === "going" && <Check className="h-4 w-4 mr-2" />}
                      Going
                    </Button>
                    <Button
                      variant={rsvpStatus[event.title] === "interested" ? "default" : "outline"}
                      className="flex-1 rounded-xl h-10"
                      onClick={() => setRsvpStatus({
                        ...rsvpStatus,
                        [event.title]: rsvpStatus[event.title] === "interested" ? null : "interested"
                      })}
                    >
                      {rsvpStatus[event.title] === "interested" && <Check className="h-4 w-4 mr-2" />}
                      Interested
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          {myEvents.map((event, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-xl text-sm ${
                    event.status === "Going"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
