import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTaskContext, TagType, PriorityType } from "@/context/TaskContext";
import { toast } from "sonner";
import { useState } from "react";
import { X, Plus, Tag, Settings, Trash2, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const LeftPane = () => {
  const { addTask, availableTags, addCustomTag, removeTag, session } =
    useTaskContext();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as PriorityType,
    tag: "work" as TagType,
    timeSlot: "",
    duration: "",
    links: "",
    scheduledDate: "",
    notificationsEnabled: false,
    emailNotification: session?.user?.email || "",
    notificationTime: "09:00",
  });

  const [customTag, setCustomTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagToRemove, setTagToRemove] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleTagSelect = (tag: TagType) => {
    setFormData((prev) => ({
      ...prev,
      tag,
    }));
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) {
      return;
    }

    const normalizedTag = customTag.toLowerCase().trim() as TagType;

    // Add to available tags if not already there
    addCustomTag(normalizedTag);

    // Set as the selected tag
    setFormData((prev) => ({
      ...prev,
      tag: normalizedTag,
    }));

    setCustomTag("");
    setShowTagInput(false);
  };

  const handleDeleteTag = () => {
    if (tagToRemove) {
      removeTag(tagToRemove);
      toast.success(`Tag "${tagToRemove}" removed`);
      setTagToRemove(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please log in to add tasks");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    await addTask(formData);

    toast.success("Task added successfully!");

    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      tag: "work",
      timeSlot: "",
      duration: "",
      links: "",
      scheduledDate: "",
      notificationsEnabled: false,
      emailNotification: session?.user?.email || "",
      notificationTime: "09:00",
    });
  };

  if (!session) {
    return (
      <aside className="w-full h-full bg-background border-r p-4 flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-lg font-medium mb-2">Please sign in</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Sign in to add and manage tasks
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full h-full bg-background border-r p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Add New Task</h2>
        <Button type="submit" size="sm" onClick={handleSubmit}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Separator className="mb-4" />

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Task description"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tag">Tag</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Tags</DialogTitle>
                    <DialogDescription>
                      Select a tag to remove it from the available tags.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2 my-4">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="flex items-center gap-1 px-2 py-1 cursor-pointer"
                        onClick={() => setTagToRemove(tag)}
                      >
                        {tag}
                        {tagToRemove === tag && (
                          <div className="bg-destructive/20 absolute inset-0 rounded flex items-center justify-center">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </div>
                        )}
                      </Badge>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteTag}
                      disabled={!tagToRemove}
                    >
                      Remove Selected Tag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {!showTagInput ? (
                <div className="flex gap-2">
                  <Select
                    value={formData.tag}
                    onValueChange={(value: string) => {
                      if (value === "custom") {
                        setShowTagInput(true);
                      } else if (value) {
                        handleTagSelect(value as TagType);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">+ Add custom tag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Enter custom tag"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handleAddCustomTag}
                    disabled={!customTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setShowTagInput(false);
                      setCustomTag("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeSlot">Time Slot (24h format)</Label>
            <Input
              id="timeSlot"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleInputChange}
              placeholder="e.g. 14:00-15:30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g. 2 hrs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="links">Links and Resources</Label>
            <Input
              id="links"
              name="links"
              value={formData.links}
              onChange={handleInputChange}
              placeholder="URLs or resources"
            />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label
                  htmlFor="notificationsEnabled"
                  className="text-sm font-medium cursor-pointer"
                >
                  Enable Notifications
                </Label>
              </div>
              <Switch
                id="notificationsEnabled"
                checked={formData.notificationsEnabled}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("notificationsEnabled", checked)
                }
              />
            </div>

            {formData.notificationsEnabled && (
              <div className="space-y-4 animate-in slide-in-from-top duration-300">
                <div className="space-y-2">
                  <Label htmlFor="emailNotification">
                    Email for Notifications
                  </Label>
                  <Input
                    id="emailNotification"
                    type="email"
                    name="emailNotification"
                    value={formData.emailNotification}
                    onChange={handleInputChange}
                    placeholder="Enter email for notifications"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationTime">Notification Time</Label>
                  <Input
                    id="notificationTime"
                    type="time"
                    name="notificationTime"
                    value={formData.notificationTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </ScrollArea>
    </aside>
  );
};

export default LeftPane;
