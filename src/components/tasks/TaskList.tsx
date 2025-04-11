
import React, { useState, useEffect } from "react";
import { useTaskContext } from "@/context/TaskContext";
import TaskCard from "@/components/tasks/TaskCard";
import { cn } from "@/lib/utils";
import { PriorityType, TagType } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TaskListProps {
  completed: boolean;
  className?: string;
  dateFilter: string;
  priorityFilter: PriorityType | "all";
  tagFilter: TagType | "all";
}

const TaskList = ({
  completed,
  className,
  dateFilter,
  priorityFilter,
  tagFilter,
}: TaskListProps) => {
  const {
    getFilteredTasks,
    toggleTaskCompletion,
    tasks: allTasks,
  } = useTaskContext();

  const tasks = getFilteredTasks(completed, dateFilter, priorityFilter, tagFilter);
  const [rightPaneOpen, setRightPaneOpen] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const handleRightPaneToggle = (event: CustomEvent<{ isOpen: boolean }>) => {
      setRightPaneOpen(event.detail.isOpen);
    };

    window.addEventListener(
      "rightpane-toggle",
      handleRightPaneToggle as EventListener,
    );

    return () => {
      window.removeEventListener(
        "rightpane-toggle",
        handleRightPaneToggle as EventListener,
      );
    };
  }, []);

  const safeRenderTasks = () => {
    try {
      return tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={{
            ...task,
            tag: task.tag || "other",
          }}
          onToggleCompletion={toggleTaskCompletion}
        />
      ));
    } catch (error) {
      console.error("Error rendering tasks:", error);
      return (
        <div className="col-span-2 text-center py-10">
          <p className="text-red-500">
            Error displaying tasks. Please try refreshing the page.
          </p>
        </div>
      );
    }
  };

  const generateSummary = async () => {
    if (tasks.length === 0) {
      toast("No tasks found to summarize.");
      return;
    }
    
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      byPriority: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      },
      byTag: tasks.reduce((acc: Record<string, number>, task) => {
        const tag = task.tag || 'other';
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {}),
      upcoming: tasks
        .filter(t => t.scheduledDate && new Date(t.scheduledDate) > new Date())
        .length
    };

    const taskDetails = tasks.map(task => ({
      title: task.title,
      description: task.description || '',
      review: task.review || '',
      priority: task.priority,
      tag: task.tag,
      completed: task.completed,
      scheduledDate: task.scheduledDate,
      timeRequired: task.timeRequired,
      scheduleFrom: task.scheduleFrom,
      scheduleTo: task.scheduleTo
    }));

    const { data, error } = await supabase.functions.invoke('gemini-task-assistant', {
      body: {
        messages: [{
          role: 'user',
          content: `Analyze these tasks and provide a comprehensive summary. Task statistics: ${JSON.stringify(taskStats)}. Full task details: ${JSON.stringify(taskDetails)}`
        }],
        systemPrompt: "You are a task analyzer. Generate a detailed summary including: 1) Task completion overview 2) Distribution by tags and priorities 3) Time allocation patterns 4) Key themes in task descriptions 5) Upcoming scheduled tasks and deadlines. Be concise but thorough."
      }
    });

    if (error) {
      toast(`Error generating summary: ${error.message}`, { type: 'error' });
      console.error("Error generating summary:", error);
      return;
    }

    setSummary(data.generatedText);
    setShowSummary(true);
    toast("Summary generated successfully!");
  };

  return (
    <div
      className={cn(
        "space-y-4 transition-all duration-300",
        rightPaneOpen ? "pr-[380px] md:pr-[380px]" : "pr-0",
        className
      )}
    >
      {tasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {completed
              ? "No completed tasks found with the selected filters."
              : "No pending tasks found with the selected filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          {safeRenderTasks()}
        </div>
      )}
    </div>
  );
};

export default TaskList;
