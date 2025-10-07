import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Label } from "./ui/label";
import { PostCard } from "./PostCard";
import { ConnectionCard } from "./ConnectionCard";
import { SocietyCard } from "./SocietyCard";
import { EventCard } from "./EventCard";
import type { SearchFilters } from "../types";

export function AdvancedSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "all",
    department: undefined,
    batch: undefined,
    dateRange: "all",
  });

  const mockResults = {
    posts: [
      {
        id: "1",
        authorId: "1",
        author: "Sarah Johnson",
        department: "Computer Science",
        batch: "Fall 2023",
        timeAgo: "2h ago",
        content: "Amazing Machine Learning workshop today! 🚀",
        reactions: { like: 24, love: 5, celebrate: 3, support: 2, insightful: 8 },
        totalReactions: 42,
        comments: 8,
      },
    ],
    people: [
      {
        id: "1",
        name: "Sarah Johnson",
        department: "Computer Science",
        batch: "Fall 2023",
        mutualConnections: 12,
      },
    ],
    societies: [
      {
        id: "1",
        name: "Computer Science Society",
        description: "For all CS enthusiasts",
        members: 234,
        category: "Academic",
        logo: "💻",
      },
    ],
    events: [
      {
        id: "1",
        title: "Tech Talk: AI & Ethics",
        date: "Oct 12",
        time: "5:00 PM",
        location: "Building A, Room 203",
        organizer: "CS Society",
        attendees: 45,
        interested: 89,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      },
    ],
  };

  const departments = [
    "Computer Science",
    "Business Administration",
    "Engineering",
    "Psychology",
    "Medicine",
  ];

  const batches = ["Fall 2023", "Spring 2024", "Fall 2024"];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, people, societies, events..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFilters({ ...filters, query: e.target.value });
              }}
              className="pl-10 pr-10 rounded-xl"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ ...filters, query: "" });
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl flex-shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={filters.department}
                    onValueChange={(value: string) =>
                      setFilters({ ...filters, department: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select
                    value={filters.batch}
                    onValueChange={(value: string) => setFilters({ ...filters, batch: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value: any) =>
                      setFilters({ ...filters, dateRange: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      query: searchQuery,
                      type: "all",
                      department: undefined,
                      batch: undefined,
                      dateRange: "all",
                    })
                  }
                  className="w-full rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {(filters.department || filters.batch || filters.dateRange !== "all") && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.department && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, department: undefined })}
                className="rounded-full"
              >
                {filters.department}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {filters.batch && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, batch: undefined })}
                className="rounded-full"
              >
                {filters.batch}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
            {filters.dateRange !== "all" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, dateRange: "all" })}
                className="rounded-full"
              >
                {filters.dateRange === "today" ? "Today" : filters.dateRange === "week" ? "This Week" : "This Month"}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-xl mb-6 overflow-x-auto">
          <TabsTrigger value="all" className="rounded-xl">
            All
          </TabsTrigger>
          <TabsTrigger value="posts" className="rounded-xl">
            Posts
          </TabsTrigger>
          <TabsTrigger value="people" className="rounded-xl">
            People
          </TabsTrigger>
          <TabsTrigger value="societies" className="rounded-xl">
            Societies
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-xl">
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {mockResults.posts.length > 0 && (
            <div className="space-y-4">
              <h3>Posts</h3>
              {mockResults.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          {mockResults.people.length > 0 && (
            <div className="space-y-4">
              <h3>People</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockResults.people.map((person) => (
                  <ConnectionCard key={person.id} {...person} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
              {mockResults.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockResults.people.map((person) => (
              <ConnectionCard key={person.id} {...person} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="societies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockResults.societies.map((society) => (
              <SocietyCard key={society.id} {...society} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockResults.events.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}