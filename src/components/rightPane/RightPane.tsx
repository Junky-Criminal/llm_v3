
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import TaskAssistant from "@/components/rightPane/TaskAssistant";
import TaskFormMini from "@/components/rightPane/TaskFormMini";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const RightPane = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"assistant" | "quick-add">("assistant");

  const togglePane = () => {
    setIsOpen(!isOpen);
    
    // Create a custom event that other components can listen for
    const event = new CustomEvent("rightpane-toggle", { detail: { isOpen: !isOpen } });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Dispatch the initial state on mount
    const event = new CustomEvent("rightpane-toggle", { detail: { isOpen } });
    window.dispatchEvent(event);
  }, []);

  // Wrap the tab content in an error boundary
  const renderTabContent = () => {
    try {
      return activeTab === "assistant" ? <TaskAssistant /> : <TaskFormMini />;
    } catch (error) {
      console.error("Error rendering tab content:", error);
      return (
        <div className="p-4 text-red-500">
          Error displaying content. Please try refreshing the page.
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        "fixed top-[4rem] bottom-0 right-0 z-20 w-[320px] shrink-0 border-l bg-background transition-all duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="absolute -left-10 top-4">
        <Button 
          variant="default" 
          size="icon" 
          onClick={togglePane}
          className="h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-md"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex h-full flex-col">
        <div className="border-b">
          <div className="flex">
            <Button
              variant={activeTab === "assistant" ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => setActiveTab("assistant")}
            >
              AI Assistant
            </Button>
            <Button
              variant={activeTab === "quick-add" ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => setActiveTab("quick-add")}
            >
              Quick Add
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default RightPane;
