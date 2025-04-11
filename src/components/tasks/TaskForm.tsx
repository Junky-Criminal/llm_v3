import React, { useState } from "react";
import { useTaskContext, TagType, PriorityType } from "@/context/TaskContext";
import { cn } from "@/lib/utils";
import VoiceInputButton from "@/components/ui/VoiceInputButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Calendar, Clock, Link as LinkIcon } from "lucide-react";
import TagManager from "@/components/tasks/TagManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFormProps {
  className?: string;
}

const TaskForm = ({ className }: TaskFormProps) => {
  const { addTask } = useTaskContext();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    review: "",
    priority: "medium" as PriorityType,
    tag: "other" as TagType,
    scheduleFrom: "",
    scheduleTo: "",
    links: "",
    scheduledDate: "",
    notificationsEnabled: false,
    emailNotification: "",
    notificationTime: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleVoiceInput = (text: string) => {
    // In a real app, we would parse the text to extract task details
    // For now, we'll just set the title
    setFormData((prev) => ({ ...prev, title: text }));
  };

  const handleTagSelect = (tag: TagType) => {
    setFormData((prev) => ({
      ...prev,
      tag: tag,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    const taskData = {
      ...formData,
      scheduleFrom: formData.scheduleFrom || null,
      scheduleTo: formData.scheduleTo || null,
      scheduledDate: formData.scheduledDate || null,
      timeRequired: formData.timeRequired ? Number(formData.timeRequired) : null,
    };
    
    addTask(taskData);

    toast.success("Task added successfully!");

    // Reset form
    setFormData({
      title: "",
      description: "",
      review: "",
      priority: "medium" as PriorityType,
      tag: "other" as TagType,
      scheduleFrom: "",
      scheduleTo: "",
      links: "",
      scheduledDate: "",
      notificationsEnabled: false,
      emailNotification: "",
      notificationTime: "",
    });
  };

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 animate-in slide-in",
        className,
      )}
    >
      <h2 className="text-xl font-bold mb-4">Add New Task</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Task Title"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <VoiceInputButton onVoiceInput={handleVoiceInput} />
        </div>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description (Optional)"
          className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[100px]"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tag</label>
            <TagManager
              selectedTag={formData.tag}
              onTagSelect={handleTagSelect}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Schedule</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="time"
                name="scheduleFrom"
                value={formData.scheduleFrom}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
            <div>
              <input
                type="time"
                name="scheduleTo"
                value={formData.scheduleTo}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Links and Resources
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="links"
              value={formData.links}
              onChange={handleInputChange}
              placeholder="Add URLs or resource notes"
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Scheduled Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notificationsEnabled"
              name="notificationsEnabled"
              checked={formData.notificationsEnabled}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="notificationsEnabled"
              className="text-sm font-medium"
            >
              Enable Notifications
            </label>
          </div>

          {formData.notificationsEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Notification
                </label>
                <div className="relative">
                  <Bell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="emailNotification"
                    value={formData.emailNotification}
                    onChange={handleInputChange}
                    placeholder="Enter email for notifications"
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Send Notification At
                </label>
                <input
                  type="time"
                  name="notificationTime"
                  value={formData.notificationTime}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-xl transition-colors"
        >
          Add Task
        </Button>
      </form>
    </div>
  );
};

export default TaskForm;