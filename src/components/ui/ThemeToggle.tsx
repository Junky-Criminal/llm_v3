
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative h-10 w-10 rounded-full overflow-hidden flex items-center justify-center transition-colors",
        "bg-secondary/80 hover:bg-secondary dark:bg-secondary/30 dark:hover:bg-secondary/40",
        "backdrop-blur-sm border border-white/20 dark:border-white/10",
        "focus:outline-none focus:ring-2 focus:ring-primary/80 focus:ring-offset-2 focus:ring-offset-background",
        "animate-in slide-in",
        className
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          theme === "dark" ? "opacity-0" : "opacity-100"
        )}
      >
        <Sun className="h-5 w-5 text-orange-500" />
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          theme === "light" ? "opacity-0" : "opacity-100"
        )}
      >
        <Moon className="h-5 w-5 text-blue-400" />
      </span>
    </button>
  );
};

export default ThemeToggle;
