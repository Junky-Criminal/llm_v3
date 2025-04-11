import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/context/TaskContext";
import { getTagCardColor, getPriorityColor } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggleCompletion: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TaskCard = ({ task, onToggleCompletion }: TaskCardProps) => {
  const { updateTask, deleteTask } = useTaskContext();
  const [isEditingTask, setIsEditingTask] = useState(false);
  const tagCardColor = getTagCardColor(task.tag);
  const priorityColor = getPriorityColor(task.priority);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const event = new CustomEvent('edit-task', { 
      detail: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        tag: task.tag,
        links: task.links,
        scheduledDate: task.scheduled_date,
        timeRequired: task.time_required,
        scheduleFrom: task.scheduleFrom,
        scheduleTo: task.scheduleTo,
        review: task.review
      } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={cn(
      "rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 w-full",
      tagCardColor,
      task.Status && "opacity-70"
    )}>
      <div className="p-4 space-y-3 flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 w-full">
            <input
              type="checkbox"
              checked={task.status}
              onChange={() => onToggleCompletion(task.id)}
              className="h-5 w-5 rounded border-gray-300"
            />
            <div className="space-y-2 w-full">
              <div className="flex justify-between items-start">
                <h3 className={cn(
                  "font-medium line-clamp-2",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}

              {task.review && (
                <div className="bg-muted/50 p-2 rounded-md mb-2">
                  <p className="text-sm">
                    <span className="font-medium text-primary">Review: </span>
                    {task.review}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={cn("font-medium", priorityColor)}>
                  Priority: {task.priority}
                </div>
                <div>Tag: {task.tag}</div>
                {task.timeRequired && (
                  <div>Time Required: {task.timeRequired}hrs</div>
                )}
              </div>

              {task.scheduled_date && (
                <div className="text-sm">
                  Date: {new Date(task.scheduled_date).toLocaleDateString()}
                </div>
              )}

              {task.time_required && (
                <div className="text-sm">
                  Time Required: {task.time_required} hours
                </div>
              )}

              
              {task.links && (
                <div className="text-sm mt-1">
                  <span className="font-medium">Resources:</span>
                  <a href={task.links} className="text-blue-500 ml-1 hover:underline break-all line-clamp-1" target="_blank" rel="noopener noreferrer">
                    {task.links}
                  </a>
                </div>
              )}
              {task.scheduled_date && (
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Date: </span>
                  <span className="ml-1">
                    {new Date(task.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {(task.scheduleFrom || task.scheduleTo) && (
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Time: </span>
                  <span className="ml-1">
                    {task.scheduleFrom || ''}
                    {task.scheduleFrom && task.scheduleTo && ' - '}
                    {task.scheduleTo || ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;