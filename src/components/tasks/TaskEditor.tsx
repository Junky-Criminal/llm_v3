
import React, { useState, useEffect } from "react";
import { Task, PriorityType, useTaskContext } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import TagManager from "./TagManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskEditorProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskEditor = ({ task, isOpen, onClose }: TaskEditorProps) => {
  const { updateTask } = useTaskContext();
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    tag: task.tag,
    timeSlot: task.timeSlot || "",
    links: task.links || "",
    deadline: task.deadline || "",
  });
  const [rightPanePosition, setRightPanePosition] = useState(320); // Default width

  // Update form when task changes
  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      tag: task.tag,
      timeSlot: task.timeSlot || "",
      links: task.links || "",
      deadline: task.deadline || "",
    });
  }, [task]);
  
  // Listen for the rightpane-toggle event to adjust position
  useEffect(() => {
    const handleRightPaneToggle = (event: CustomEvent<{isOpen: boolean}>) => {
      setRightPanePosition(event.detail.isOpen ? 320 : 0);
    };
    
    window.addEventListener('rightpane-toggle', handleRightPaneToggle as EventListener);
    
    return () => {
      window.removeEventListener('rightpane-toggle', handleRightPaneToggle as EventListener);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagSelect = (tag: string) => {
    setFormData((prev) => ({ ...prev, tag }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      await updateTask(task.id, {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority as PriorityType,
        tag: formData.tag,
        timeSlot: formData.timeSlot || undefined,
        links: formData.links || undefined,
        deadline: formData.deadline || undefined,
      });

      toast.success("Task updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[400px] w-[90vw] max-h-[90vh] overflow-y-auto"
        style={{
          marginRight: `${rightPanePosition}px`,
          transform: `translate(-${rightPanePosition / 2}px, -50%)`,
          left: `calc(50% - ${rightPanePosition / 2}px)`
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Task title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Task description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tag</label>
            <TagManager selectedTag={formData.tag} onTagSelect={handleTagSelect} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Slot</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  placeholder="e.g. 10:00-11:30"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Links</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="links"
                value={formData.links}
                onChange={handleInputChange}
                placeholder="Add URLs or resource notes"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditor;
