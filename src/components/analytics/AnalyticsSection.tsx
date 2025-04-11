
import React, { useState } from "react";
import { useTaskContext, TagType } from "@/context/TaskContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AnalyticsSectionProps {
  className?: string;
}

const CombinedAnalyticsSection = ({ className }: AnalyticsSectionProps) => {
  const { tasks } = useTaskContext();
  const [promptText, setPromptText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTag, setSelectedTag] = useState<string>("");

  const uniqueTags = Array.from(new Set(tasks.map((task) => task.tag)));
  const sampleSummary = "Example summary: Today you have 3 high priority tasks, 2 medium priority tasks, and 1 low priority task. Your most used tag is 'WORK' with 4 tasks.";

  const getCompletionRate = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    return [
      { name: "Completed", value: completedTasks },
      { name: "Pending", value: totalTasks - completedTasks },
    ];
  };

  const getPriorityDistribution = () => {
    const distribution = {
      high: 0,
      medium: 0,
      low: 0
    };

    tasks.forEach(task => {
      if (task.priority) {
        distribution[task.priority]++;
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  const getTagDistribution = () => {
    const distribution = {};
    tasks.forEach(task => {
      const tag = task.tag || 'other';
      distribution[tag] = (distribution[tag] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedTag) {
      toast.error("Please select at least one tag");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://5000-${window.location.hostname}/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          tags: [selectedTag]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = {
    priority: {
      High: "#FF4444",
      Medium: "#FFBB33",
      Low: "#00C851"
    },
    completion: {
      Completed: "#00C851",
      Pending: "#FF4444"
    },
    tags: ["#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39"]
  };

  return (
    <div className={cn("space-y-8 p-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Completion Rate Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Task Completion Rate</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCompletionRate()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {getCompletionRate().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.completion[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Distribution Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Priority Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getPriorityDistribution()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {getPriorityDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.priority[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tag Distribution Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Tag Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getTagDistribution()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {getTagDistribution().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS.tags[index % COLORS.tags.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Summary Generation Section */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Generate Task Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border mb-4"
            />
            <Select
              value={selectedTag}
              onValueChange={setSelectedTag}
              className="mb-4"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {uniqueTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm">{summary || sampleSummary}</p>
            </div>
            <Textarea
              placeholder="Enter your prompt for generating task summary..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={generateSummary} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Summary"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CombinedAnalyticsSection;
