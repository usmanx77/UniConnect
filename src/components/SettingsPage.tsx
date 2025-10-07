import { useState } from "react";
import { 
  ChevronRight, 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Info, 
  LogOut, 
  Lock,
  Eye,
  MessageSquare,
  Users,
  Globe
} from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { APP_NAME, APP_VERSION } from "../lib/constants";

export function SettingsPage() {
  const { darkMode, toggleDarkMode } = useApp();
  const { user, logout } = useAuth();
  
  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    postReactions: true,
    comments: true,
    connections: true,
    messages: true,
    events: true,
    societies: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "everyone" as "everyone" | "connections" | "private",
    whoCanMessage: "everyone" as "everyone" | "connections",
    showOnlineStatus: true,
    showActivity: true,
  });

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
    setEditProfileOpen(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    toast.success("Password changed successfully");
    setChangePasswordOpen(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setLogoutDialogOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3>Account</h3>
            </div>
          </div>

          <div className="divide-y divide-border">
            {/* Profile Picture */}
            <button
              onClick={() => setEditProfileOpen(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Edit Profile */}
            <button
              onClick={() => setEditProfileOpen(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm">Edit Profile</p>
                  <p className="text-xs text-muted-foreground">Update your personal information</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Change Password */}
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm">Change Password</p>
                  <p className="text-xs text-muted-foreground">Update your password</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3>Privacy & Security</h3>
            </div>
          </div>

          <div className="divide-y divide-border">
            {/* Profile Visibility */}
            <div className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm mb-1">Profile Visibility</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Control who can see your profile
                    </p>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value: any) =>
                        setPrivacySettings({ ...privacySettings, profileVisibility: value })
                      }
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="connections">Circle Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Who Can Message */}
            <div className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm mb-1">Who Can Message You</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Control who can send you messages
                    </p>
                    <Select
                      value={privacySettings.whoCanMessage}
                      onValueChange={(value: any) =>
                        setPrivacySettings({ ...privacySettings, whoCanMessage: value })
                      }
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="connections">Circle Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Online Status */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Show Online Status</p>
                    <p className="text-xs text-muted-foreground">
                      Let others see when you&apos;re online
                    </p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.showOnlineStatus}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showOnlineStatus: checked })
                  }
                />
              </div>
            </div>

            {/* Show Activity */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Show Activity Status</p>
                    <p className="text-xs text-muted-foreground">
                      Show what you&apos;re currently doing
                    </p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.showActivity}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showActivity: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3>Notifications</h3>
            </div>
          </div>

          <div className="divide-y divide-border">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Post Reactions</p>
                  <p className="text-xs text-muted-foreground">
                    When someone reacts to your posts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.postReactions}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, postReactions: checked })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Comments</p>
                  <p className="text-xs text-muted-foreground">
                    When someone comments on your posts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.comments}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, comments: checked })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Circle Requests</p>
                  <p className="text-xs text-muted-foreground">
                    When someone sends you a circle request
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.connections}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, connections: checked })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Messages</p>
                  <p className="text-xs text-muted-foreground">
                    When you receive new messages
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.messages}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, messages: checked })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Events</p>
                  <p className="text-xs text-muted-foreground">
                    Event reminders and updates
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.events}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, events: checked })
                  }
                />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Societies</p>
                  <p className="text-xs text-muted-foreground">
                    Society invites and updates
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.societies}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, societies: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <h3>Appearance</h3>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h3>About</h3>
            </div>
          </div>

          <div className="divide-y divide-border">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm">App Version</p>
                <p className="text-sm text-muted-foreground">{APP_VERSION}</p>
              </div>
            </div>

            <button
              onClick={() => toast.info("Opening help center...")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <p className="text-sm">Help Center</p>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => toast.info("Opening privacy policy...")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <p className="text-sm">Privacy Policy</p>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => toast.info("Opening terms of service...")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <p className="text-sm">Terms of Service</p>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full rounded-xl"
          onClick={() => setLogoutDialogOpen(true)}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of {APP_NAME}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}