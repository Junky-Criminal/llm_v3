import React, { createContext, useContext, useState, useEffect } from "react";
import { addDays, isBefore, isAfter, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define task tag types with their colors
export type TagType = string;

export type PriorityType = "low" | "medium" | "high";

// Define a Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  review?: string;
  completed: boolean;
  priority: PriorityType;
  status: boolean;
  tag: TagType;
  links?: string;
  time_required?: number;
  schedule_from?: string;
  schedule_to?: string;
  scheduled_date?: string;
  createdAt: Date;
  notificationsEnabled?: boolean;
  emailNotification?: string;
  notificationTime?: string;
}

// Define the Task Context interface
interface TaskContextType {
  tasks: Task[];
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "completed">,
  ) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  getTasksByStatus: (completed: boolean) => Task[];
  getFilteredTasks: (
    completed: boolean,
    dateFilter: string,
    priorityFilter: PriorityType | "all",
    tagFilter: TagType | "all",
  ) => Task[];
  availableTags: TagType[];
  addCustomTag: (tag: TagType) => Promise<void>;
  removeTag: (tag: TagType) => Promise<void>;
  isLoading: boolean;
  session: any;
}

// Create the context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  console.log("TaskProvider initialized, isLoading:", isLoading);

  // Check for user session on mount
  useEffect(() => {
    const getSession = async () => {
      console.log("Getting session...");
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        console.log(
          "Session data:",
          data.session ? "Session exists" : "No session",
        );
        setSession(data.session);

        if (data.session) {
          await fetchTasks();
          await fetchTags();
        }
      } catch (err) {
        console.error("Unexpected error in getSession:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setIsLoading(true);
          await fetchTasks();
          await fetchTags();
          setIsLoading(false);
        } else if (event === "SIGNED_OUT") {
          setTasks([]);
          setAvailableTags([]);
        }
      },
    );

    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch tasks when the session changes
  useEffect(() => {
    if (session) {
      fetchTasks();
      fetchTags();
    }
  }, [session]);

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const parsedTasks: Task[] = data.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          completed: task.completed || false,
          priority: task.priority as PriorityType,
          tag:
            task.tags && task.tags.length > 0 && task.tags[0]
              ? task.tags[0]
              : "other", // Handle null tags
          review: task.review,
          status: task.status,
          links: task.links,
          timeRequired: task.time_required,
          scheduleFrom: task.schedule_from,
          scheduleTo: task.schedule_to,
          scheduledDate: task.scheduled_date,
          scheduledDate: task.scheduled_date,
          createdAt: new Date(task.created_at),
          notificationsEnabled: task.notifications_enabled,
          emailNotification: task.email_notification,
          notificationTime: task.notification_time,
        }));
        setTasks(parsedTasks);
      }
    } catch (error: any) {
      console.error("Error fetching tasks:", error.message);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tags from Supabase
  const fetchTags = async () => {
    try {
      const { data, error } = await supabase.from("user_tags").select("tag");

      if (error) throw error;

      if (data) {
        const tags = data.map((item) => item.tag);
        // Add default tags if the user has no tags yet
        if (tags.length === 0) {
          const defaultTags = [
            "work",
            "personal",
            "health",
            "finance",
            "education",
            "social",
            "home",
            "other",
          ];
          await Promise.all(defaultTags.map((tag) => addCustomTag(tag)));
          setAvailableTags(defaultTags);
        } else {
          const uniqueTags = Array.from(new Set(tags));
          setAvailableTags(uniqueTags);
        }
      }
    } catch (error: any) {
      console.error("Error fetching tags:", error.message);
      toast.error("Failed to load tags");
    }
  };

  // Add a new task
  const addTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "completed">,
  ) => {
    if (!session) {
      toast.error("You must be logged in to add tasks");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            user_id: session.user.id,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            tags: [taskData.tag], // Store single tag in tags array for backward compatibility
            time_required: parseFloat(taskData.timeRequired?.toString() || "0"),
            links: taskData.links,
            scheduled_date: taskData.scheduledDate,
            schedule_from: taskData.scheduleFrom || null,
            schedule_to: taskData.scheduleTo || null,
            notifications_enabled: taskData.notificationsEnabled || false,
            email_notification: taskData.emailNotification,
            notification_time: taskData.notificationTime,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          completed: data.completed,
          priority: data.priority as PriorityType,
          tag: data.tags && data.tags.length > 0 ? data.tags[0] : "other", // Use first tag from array
          duration: data.duration,
          links: data.links,
          scheduledDate: data.scheduled_date,
          createdAt: new Date(data.created_at),
          notificationsEnabled: data.notifications_enabled,
          emailNotification: data.email_notification,
          notificationTime: data.notification_time,
          scheduleFrom: data.schedule_from,
          scheduleTo: data.schedule_to,
        };

        setTasks((prevTasks) => [newTask, ...prevTasks]);

        // Schedule notification if enabled
        if (
          newTask.notificationsEnabled &&
          newTask.emailNotification &&
          newTask.notificationTime
        ) {
          // This would typically call a function to schedule the notification
          console.log(
            `Notification scheduled for task ${newTask.id} at ${newTask.notificationTime}`,
          );
        }
      }
    } catch (error: any) {
      console.error("Error adding task:", error.message);
      toast.error("Failed to add task");
    }
  };

  // Update an existing task
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    if (!session) {
      toast.error("You must be logged in to update tasks");
      return;
    }

    try {
      const updateData: any = {};

      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined)
        updateData.description = taskData.description;
      if (taskData.completed !== undefined)
        updateData.completed = taskData.completed;
      if (taskData.priority !== undefined)
        updateData.priority = taskData.priority;
      if (taskData.tag !== undefined) updateData.tags = [taskData.tag]; // Store single tag in tags array
      if (taskData.scheduleFrom !== undefined)
        updateData.schedule_from = taskData.scheduleFrom;
      if (taskData.scheduleTo !== undefined)
        updateData.schedule_to = taskData.scheduleTo;
      if (taskData.links !== undefined) updateData.links = taskData.links;
      if (taskData.scheduledDate !== undefined)
        updateData.scheduled_date = taskData.scheduledDate;
      if (taskData.notificationsEnabled !== undefined)
        updateData.notifications_enabled = taskData.notificationsEnabled;
      if (taskData.emailNotification !== undefined)
        updateData.email_notification = taskData.emailNotification;
      if (taskData.notificationTime !== undefined)
        updateData.notification_time = taskData.notificationTime;
      if (taskData.review !== undefined) 
        updateData.review = taskData.review;

      const { error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, ...taskData } : task,
        ),
      );

      // Update notification if enabled/changed
      const updatedTask = tasks.find((task) => task.id === id);
      if (
        updatedTask &&
        updatedTask.notificationsEnabled &&
        updatedTask.emailNotification &&
        updatedTask.notificationTime
      ) {
        // This would typically call a function to update the notification
        console.log(
          `Notification updated for task ${id} at ${updatedTask.notificationTime}`,
        );
      }
    } catch (error: any) {
      console.error("Error updating task:", error.message);
      toast.error("Failed to update task");
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    if (!session) {
      toast.error("You must be logged in to delete tasks");
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error: any) {
      console.error("Error deleting task:", error.message);
      toast.error("Failed to delete task");
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  // Add a custom tag to available tags
  const addCustomTag = async (tag: TagType) => {
    if (!session) {
      toast.error("You must be logged in to add tags");
      return;
    }

    if (!availableTags.includes(tag)) {
      try {
        const { error } = await supabase.from("user_tags").insert({
          user_id: session.user.id,
          tag: tag,
        });

        if (error) throw error;

        setAvailableTags((prev) => [...prev, tag]);
      } catch (error: any) {
        console.error("Error adding tag:", error.message);
        toast.error("Failed to add tag");
      }
    }
  };

  // Remove a tag from available tags
  const removeTag = async (tag: TagType) => {
    if (!session) {
      toast.error("You must be logged in to remove tags");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_tags")
        .delete()
        .eq("tag", tag);

      if (error) throw error;

      setAvailableTags((prev) => prev.filter((t) => t !== tag));

      // Update any tasks that have this tag
      const tasksToUpdate = tasks.filter((task) => task.tag === tag);

      for (const task of tasksToUpdate) {
        await updateTask(task.id, { tag: "other" });
      }
    } catch (error: any) {
      console.error("Error removing tag:", error.message);
      toast.error("Failed to remove tag");
    }
  };

  // Get tasks by completion status
  const getTasksByStatus = (completed: boolean) => {
    return tasks.filter((task) => task.completed === completed);
  };

  // Get filtered tasks by multiple criteria
  const getFilteredTasks = (
    completed: boolean,
    dateFilter: string,
    priorityFilter: PriorityType | "all",
    tagFilter: TagType | "all",
  ) => {
    const today = new Date();
    console.log("Filtering with params:", {
      completed,
      dateFilter,
      priorityFilter,
      tagFilter,
    });
    console.log("All tasks before filtering:", tasks);

    return tasks.filter((task) => {
      // Filter by completion status
      const completionMatch = task.completed === completed;

      // Filter by priority
      const priorityMatch =
        priorityFilter === "all" || task.priority === priorityFilter;

      // Filter by tag
      const tagMatch = tagFilter === "all" || task.tag === tagFilter;

      // Basic match without date filter
      const basicMatch = completionMatch && priorityMatch && tagMatch;

      console.log("Task filtering debug:", {
        taskId: task.id,
        taskTitle: task.title,
        taskCompleted: task.completed,
        completionMatch,
        priorityMatch,
        tagMatch,
        basicMatch,
      });

      // If no date filter, return basic match
      if (dateFilter === "all") {
        return basicMatch;
      }

      // Filter by date
      switch (dateFilter) {
        case "next_day":
          return basicMatch;
        case "next_week":
          return basicMatch;
        case "next_month":
          return basicMatch;
        case "next_six_months":
          return basicMatch;
        case "past_week":
          return basicMatch;
        case "past_month":
          return basicMatch;
        case "all_past":
          return basicMatch;
        default:
          return basicMatch;
      }
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        getTasksByStatus,
        getFilteredTasks,
        availableTags,
        addCustomTag,
        removeTag,
        isLoading,
        session,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook to use the task context
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}

// Export the tag colors mapping
export const tagColors: Record<string, string> = {
  work: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  personal:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  health: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  finance:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  education:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  social: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  home: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

// Get tag background color for card background
export const getTagCardColor = (tag: string): string => {
  switch (tag) {
    case "work":
      return "bg-blue-50 dark:bg-blue-950";
    case "personal":
      return "bg-purple-50 dark:bg-purple-950";
    case "health":
      return "bg-green-50 dark:bg-green-950";
    case "finance":
      return "bg-yellow-50 dark:bg-yellow-950";
    case "education":
      return "bg-orange-50 dark:bg-orange-950";
    case "social":
      return "bg-pink-50 dark:bg-pink-950";
    case "home":
      return "bg-teal-50 dark:bg-teal-950";
    case "other":
    default:
      return "bg-gray-50 dark:bg-gray-900";
  }
};

// Get tag styles for tag badges
export const getTagStyles = (tag: string): string => {
  return tagColors[tag] || tagColors.other;
};

// Map priority to colors
export const priorityColors: Record<PriorityType, string> = {
  low: "bg-green-500",
  medium: "bg-orange-500",
  high: "bg-red-500",
};