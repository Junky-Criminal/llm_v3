
import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileMenu = ({ isOpen, onClose, activeTab, setActiveTab }: MobileMenuProps) => {
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };
  
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Menu</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => handleTabClick("todo")}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md text-base font-medium transition-colors",
                  activeTab === "todo"
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                )}
              >
                To be done
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabClick("done")}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md text-base font-medium transition-colors",
                  activeTab === "done"
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                )}
              >
                Done
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabClick("analytics")}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md text-base font-medium transition-colors",
                  activeTab === "analytics"
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                )}
              >
                Analytics
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
