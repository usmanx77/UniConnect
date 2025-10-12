import { useState } from "react";
import { Users, Plus, X, Search, Crown, Shield, UserMinus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";

interface GroupChatManagerProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupChatManager({ roomId, isOpen, onClose }: GroupChatManagerProps) {
  const { user } = useAuth();
  const { rooms, createRoom } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const currentRoom = rooms.find(room => room.id === roomId);
  const isAdmin = currentRoom?.members.find(member =>
    member.userId === user?.id && member.role === 'admin'
  );

  // Mock users for demonstration - in real app, this would come from API
  const availableUsers = [
    { id: "1", name: "Alice Johnson", avatar: "", department: "Computer Science", isOnline: true },
    { id: "2", name: "Bob Smith", avatar: "", department: "Engineering", isOnline: false },
    { id: "3", name: "Carol Davis", avatar: "", department: "Mathematics", isOnline: true },
    { id: "4", name: "David Wilson", avatar: "", department: "Physics", isOnline: true },
    { id: "5", name: "Eva Brown", avatar: "", department: "Chemistry", isOnline: false },
  ];

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !currentRoom?.members.some(member => member.userId === user.id)
  );

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;

    try {
      await createRoom({
        roomType: 'group',
        name: newGroupName,
        memberIds: selectedMembers
      });
      setNewGroupName("");
      setSelectedMembers([]);
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    // TODO: Implement remove member functionality
    console.log('Remove member:', memberId);
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    // TODO: Implement promote to admin functionality
    console.log('Promote to admin:', memberId);
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {showCreateGroup ? "Create Group Chat" : "Group Members"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {showCreateGroup ? (
            <>
              {/* Create Group Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Add Members</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Available Users */}
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => toggleMemberSelection(user.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => toggleMemberSelection(user.id)}
                        className="rounded"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.department}</p>
                      </div>
                      {user.isOnline && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Members ({selectedMembers.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map(memberId => {
                        const member = availableUsers.find(u => u.id === memberId);
                        return member ? (
                          <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                            {member.name}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => toggleMemberSelection(memberId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateGroup(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || selectedMembers.length === 0}
                    className="flex-1"
                  >
                    Create Group
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Group Members List */}
              <div className="space-y-2">
                {currentRoom?.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback className="bg-primary text-white">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{member.name}</p>
                        {member.role === 'admin' && (
                          <Crown className="h-4 w-4 text-primary" />
                        )}
                        {member.role === 'owner' && (
                          <Shield className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                    {isAdmin && member.userId !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePromoteToAdmin(member.userId)}>
                            <Crown className="h-4 w-4 mr-2" />
                            Promote to Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.userId)}
                            className="text-destructive"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateGroup(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}