import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagType, PriorityType, tagColors } from "@/context/TaskContext";
import { useTaskContext } from "@/context/TaskContext"; // Added import

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filters: {
    dateFilter: string;
    priorityFilter: PriorityType | "all";
    tagFilter: TagType | "all";
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      dateFilter: string;
      priorityFilter: PriorityType | "all";
      tagFilter: TagType | "all";
    }>
  >;
}

const TabNavigation = ({
  activeTab,
  setActiveTab,
  filters,
  setFilters,
}: TabNavigationProps) => {
  const tabs = [
    { id: "todo", label: "To be done" },
    { id: "done", label: "Done" },
    { id: "calendar", label: "Calendar" },
    { id: "analytics", label: "Analytics" },
  ];

  const priorityOptions: Array<{ value: PriorityType | "all"; label: string }> =
    [
      { value: "all", label: "All Priorities" },
      { value: "high", label: "High Priority" },
      { value: "medium", label: "Medium Priority" },
      { value: "low", label: "Low Priority" },
    ];

  const { tasks } = useTaskContext();
  const uniqueTags = ["all", ...new Set(tasks.map((task) => task.tag))] as (
    | TagType
    | "all"
  )[];

  const tagOptions: Array<{ value: TagType | "all"; label: string }> =
    uniqueTags.map((tag) => ({
      value: tag,
      label:
        tag === "all" ? "All Tags" : tag.charAt(0).toUpperCase() + tag.slice(1),
    }));

  const handlePriorityFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      priorityFilter: value as PriorityType | "all",
    }));
  };

  const handleTagFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, tagFilter: value as TagType | "all" }));
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="glass-panel rounded-full p-1.5 flex justify-between items-center max-w-md mx-auto">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "hover:bg-white/50 dark:hover:bg-white/10",
              )}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute inset-0 bg-primary rounded-full animate-in fade-in" />
              )}
            </button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-9 w-9 flex items-center justify-center rounded-full bg-primary text-white shadow-md"
              aria-label="Filter tasks"
            >
              <Filter className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-2">
              <Select
                value={filters.tagFilter}
                onValueChange={(value) => handleTagFilterChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  {tagOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
                By Priority
              </DropdownMenuLabel>
              <Select
                value={filters.priorityFilter}
                onValueChange={handlePriorityFilterChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TabNavigation;
