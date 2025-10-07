import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Image as ImageIcon, Type, X } from "lucide-react";
import { useStories } from "../contexts/StoryContext";
import { toast } from "sonner";

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GRADIENT_OPTIONS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
];

export function CreateStoryDialog({ open, onOpenChange }: CreateStoryDialogProps) {
  const [storyType, setStoryType] = useState<"text" | "image">("text");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_OPTIONS[0]);
  const { addStory } = useStories();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage) {
      toast.error("Please add some content to your story");
      return;
    }

    addStory({
      userId: "currentUser",
      userName: "You",
      userAvatar: undefined,
      department: "Computer Science",
      content: content || "",
      mediaUrl: selectedImage || undefined,
      mediaType: selectedImage ? "image" : undefined,
      backgroundColor: !selectedImage ? selectedGradient : undefined,
    });

    toast.success("Story posted!");
    setContent("");
    setSelectedImage(null);
    setStoryType("text");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection */}
          <div className="flex gap-2">
            <Button
              variant={storyType === "text" ? "default" : "outline"}
              onClick={() => setStoryType("text")}
              className="flex-1 rounded-xl"
            >
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
            <Button
              variant={storyType === "image" ? "default" : "outline"}
              onClick={() => setStoryType("image")}
              className="flex-1 rounded-xl"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>
          </div>

          {storyType === "text" ? (
            <>
              {/* Gradient Selection */}
              <div className="space-y-2">
                <Label>Background</Label>
                <div className="grid grid-cols-6 gap-2">
                  {GRADIENT_OPTIONS.map((gradient) => (
                    <button
                      key={gradient}
                      onClick={() => setSelectedGradient(gradient)}
                      className={`h-10 rounded-lg transition-all ${
                        selectedGradient === gradient ? "ring-2 ring-primary scale-110" : ""
                      }`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <Label htmlFor="content">Story Text</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] rounded-xl"
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length}/150
                </p>
              </div>

              {/* Preview */}
              <div
                className="h-48 rounded-xl flex items-center justify-center p-4"
                style={{ background: selectedGradient }}
              >
                <p className="text-white text-center text-xl">
                  {content || "Your story text will appear here"}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Image Upload */}
              <div className="space-y-2">
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Story preview"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Optional Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="rounded-xl"
                  maxLength={100}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 rounded-xl">
              Post Story
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}