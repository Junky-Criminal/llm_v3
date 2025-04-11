import React, { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Save } from 'lucide-react';
import { TagType, PriorityType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const TaskFormMini = () => {
  const { addTask, updateTask, availableTags } = useTaskContext();
  const [editMode, setEditMode] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    review: "",
    priority: "medium" as PriorityType,
    status: false,
    tag: "" as TagType,
    links: "",
    timeRequired: "",
    scheduledDate: "",
    scheduleFrom: "",
    scheduleTo: ""
  });

  useEffect(() => {
    const handleEditTask = (event: CustomEvent<any>) => {
      const task = event.detail;
      setEditMode(true);
      setTaskId(task.id);
      setFormData({
        title: task.title || "",
        description: task.description || "",
        review: task.review || "",
        priority: task.priority || "medium",
        status: task.status || false,
        tag: task.tag || "",
        links: task.links || "",
        timeRequired: task.timeRequired || "",
        scheduledDate: task.scheduledDate || "",
        scheduleFrom: task.scheduleFrom || "",
        scheduleTo: task.scheduleTo || ""
      });
    };

    window.addEventListener('edit-task', handleEditTask as EventListener);
    return () => {
      window.removeEventListener('edit-task', handleEditTask as EventListener);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      review: "",
      priority: "medium",
      status: false,
      tag: "",
      links: "",
      timeRequired: "",
      scheduledDate: "",
      scheduleFrom: "",
      scheduleTo: ""
    });
    setEditMode(false);
    setTaskId(null);
  };

  useEffect(() => {
    const handleEditTask = (event: CustomEvent) => {
      const task = event.detail;
      setTaskId(task.id);
      setEditMode(true);
      setFormData({
        title: task.title || "",
        description: task.description || "",
        review: task.review || "",
        priority: task.priority || "medium",
        status: task.status || false,
        tag: task.tag || "",
        links: task.links || "",
        timeRequired: task.timeRequired || "",
        scheduledDate: task.scheduledDate || "",
        scheduleFrom: task.scheduleFrom || "",
        scheduleTo: task.scheduleTo || ""
      });
    };

    window.addEventListener('edit-task', handleEditTask as EventListener);
    return () => window.removeEventListener('edit-task', handleEditTask as EventListener);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && taskId) {
        const updateData: any = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          tag: formData.tag || "other",
          links: formData.links,
          review: formData.review,
          timeRequired: formData.timeRequired ? parseFloat(formData.timeRequired) : undefined,
          scheduledDate: formData.scheduledDate || null,
          scheduleFrom: formData.scheduleFrom || null,
          scheduleTo: formData.scheduleTo || null,
        };
        await updateTask(taskId, updateData);
        toast.success("Task updated successfully");
      } else {
        const taskData = {
          ...formData,
          scheduledDate: formData.scheduledDate || null,
          scheduleFrom: formData.scheduleFrom || null,
          scheduleTo: formData.scheduleTo || null,
          timeRequired: formData.timeRequired ? Number(formData.timeRequired) : null,
          tag: formData.tag || "other",
          status: false,
          completed: false
        };
        await addTask(taskData);
        toast.success("Task added successfully");
      }
      resetForm();
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error(editMode ? "Failed to update task" : "Failed to add task");
    }
  };

  return (
    <ScrollArea className="h-full w-[300px] rounded-md border p-2">
      <div className="px-2">
        <div className="flex items-center justify-between mb-2 border-b pb-2">
          <div className="flex items-center gap-1">
            {editMode ? <Save className="h-4 w-4 text-primary" /> : <PlusCircle className="h-4 w-4 text-primary" />}
            <h3 className="text-base font-semibold">{editMode ? 'Edit Task' : 'Quick Add Task'}</h3>
          </div>
          <Button size="sm" onClick={handleSubmit} className="h-7 px-2">
            {editMode ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          </Button>
        </div>

        <form className="space-y-2">
          <div>
            <Label className="text-xs" htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="h-7 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs" htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="h-7 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs" htmlFor="review">Review</Label>
            <Input
              id="review"
              name="review"
              value={formData.review}
              onChange={handleInputChange}
              className="h-7 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs" htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs" htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
              className="h-7 text-xs uppercase"
              placeholder="Enter tag"
            />
          </div>

          <div>
            <Label className="text-xs" htmlFor="links">Links</Label>
            <Input
              id="links"
              name="links"
              value={formData.links}
              onChange={handleInputChange}
              className="h-7 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs" htmlFor="timeRequired">Time Required (hours)</Label>
            <Input
              id="timeRequired"
              name="timeRequired"
              type="number"
              value={formData.timeRequired}
              onChange={handleInputChange}
              className="h-7 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs" htmlFor="scheduledDate">Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-7 text-xs justify-start text-left font-normal",
                    !formData.scheduledDate && "text-muted-foreground"
                  )}
                >
                  {formData.scheduledDate ? (
                    format(new Date(formData.scheduledDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledDate: date ? format(date, "yyyy-MM-dd") : ""
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div>
              <Label className="text-xs" htmlFor="scheduleFrom">From</Label>
              <Input
                id="scheduleFrom"
                name="scheduleFrom"
                type="time"
                value={formData.scheduleFrom}
                onChange={handleInputChange}
                className="h-7 text-xs w-full"
              />
            </div>
            <div>
              <Label className="text-xs" htmlFor="scheduleTo">To</Label>
              <Input
                id="scheduleTo"
                name="scheduleTo"
                type="time"
                value={formData.scheduleTo}
                onChange={handleInputChange}
                className="h-7 text-xs w-full"
              />
            </div>
          </div>
        </form>
      </div>
    </ScrollArea>
  );
};

export default TaskFormMini;