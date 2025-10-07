import { useState } from "react";
import { 
  Settings, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Shield, 
  Users, 
  Trash2, 
  Download,
  Archive,
} from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
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
import { Badge } from "./ui/badge";

interface ChatSettingsProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSettings({ roomId, isOpen, onClose }: ChatSettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState([70]);
  const [darkMode, setDarkMode] = useState(false);
  const [muteUntil, setMuteUntil] = useState<string | null>(null);

  const muteOptions = [
    { label: "1 hour", value: "1h" },
    { label: "8 hours", value: "8h" },
    { label: "24 hours", value: "24h" },
    { label: "1 week", value: "1w" },
    { label: "Forever", value: "forever" }
  ];

  const handleMute = (duration: string) => {
    if (duration === "forever") {
      setMuteUntil("forever");
    } else {
      const now = new Date();
      const hours = duration === "1h" ? 1 : duration === "8h" ? 8 : duration === "24h" ? 24 : 168;
      const muteTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
      setMuteUntil(muteTime.toISOString());
    }
  };

  const handleUnmute = () => {
    setMuteUntil(null);
  };

  const handleExportChat = () => {
    // TODO: Implement chat export functionality
    console.log('Export chat:', roomId);
  };

  const handleArchiveChat = () => {
    // TODO: Implement chat archive functionality
    console.log('Archive chat:', roomId);
  };

  const handleDeleteChat = () => {
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      // TODO: Implement chat deletion functionality
      console.log('Delete chat:', roomId);
    }
  };

  const getMuteStatus = () => {
    if (!muteUntil) return null;
    if (muteUntil === "forever") return "Muted forever";
    
    const muteTime = new Date(muteUntil);
    const now = new Date();
    if (muteTime > now) {
      const diff = muteTime.getTime() - now.getTime();
      const hours = Math.ceil(diff / (1000 * 60 * 60));
      return `Muted for ${hours} more hours`;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Chat Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <span className="text-sm">Enable notifications</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            {notifications && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="text-sm">Sound notifications</span>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>

                {soundEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Volume</span>
                      <span className="text-xs text-muted-foreground">{volume[0]}%</span>
                    </div>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm">Mute chat</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {getMuteStatus() ? getMuteStatus() : "Mute"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {muteOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => handleMute(option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                      {muteUntil && (
                        <DropdownMenuItem onClick={handleUnmute}>
                          Unmute
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Appearance</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm">Dark mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Privacy & Security</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">End-to-end encryption</span>
                <Badge variant="secondary" className="text-xs">Enabled</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Show online status</span>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          {/* Chat Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Chat Management</h3>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportChat}
              >
                <Download className="h-4 w-4 mr-2" />
                Export chat history
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleArchiveChat}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive chat
              </Button>
              
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleDeleteChat}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete chat
              </Button>
            </div>
          </div>

          {/* Chat Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Chat Info</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Chat ID:</span>
                <span className="font-mono text-xs">{roomId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>2 days ago</span>
              </div>
              <div className="flex justify-between">
                <span>Messages:</span>
                <span>1,234</span>
              </div>
              <div className="flex justify-between">
                <span>Members:</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}