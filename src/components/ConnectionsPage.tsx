import { useState } from "react";
import { UserPlus, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ConnectionsPage() {
  const [hiddenSuggestions, setHiddenSuggestions] = useState<string[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<string[]>([]);
  const [declinedRequests, setDeclinedRequests] = useState<string[]>([]);
  const suggestions = [
    { name: "David Miller", department: "Computer Science", batch: "Fall 2023", mutual: 12 },
    { name: "Jessica Lee", department: "Engineering", batch: "Fall 2023", mutual: 8 },
    { name: "Ryan Patel", department: "Computer Science", batch: "Spring 2024", mutual: 15 },
    { name: "Sophie Chen", department: "Business Admin", batch: "Fall 2023", mutual: 6 },
  ];

  const requests = [
    { name: "Emma Wilson", department: "Psychology", batch: "Fall 2023", mutual: 5 },
    { name: "James Brown", department: "Biology", batch: "Spring 2024", mutual: 3 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="mb-2">My Circle</h2>
        <p className="text-muted-foreground">Find and connect with your classmates</p>
      </div>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="w-full justify-start rounded-xl mb-6">
          <TabsTrigger value="suggestions" className="rounded-xl">
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-xl">
            Requests
            {requests.length > 0 && (
              <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="friends" className="rounded-xl">My Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.filter(person => !hiddenSuggestions.includes(person.name)).map((person, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-white">
                      {person.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm truncate">{person.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {person.department}
                    </p>
                    <p className="text-xs text-muted-foreground">{person.batch}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {person.mutual} mutual
                </p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 rounded-xl h-9"
                    onClick={() => setHiddenSuggestions([...hiddenSuggestions, person.name])}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-9 w-9"
                    onClick={() => setHiddenSuggestions([...hiddenSuggestions, person.name])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requests.filter(person => !acceptedRequests.includes(person.name) && !declinedRequests.includes(person.name)).map((person, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-white">
                    {person.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-sm">{person.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {person.department} • {person.batch}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {person.mutual} mutual
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="rounded-xl h-9"
                    onClick={() => setAcceptedRequests([...acceptedRequests, person.name])}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl h-9"
                    onClick={() => setDeclinedRequests([...declinedRequests, person.name])}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="friends">
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Your friends list will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
