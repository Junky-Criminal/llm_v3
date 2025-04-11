import React, { useState } from "react";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import TaskList from "@/components/tasks/TaskList";
import AnalyticsSection from "@/components/analytics/AnalyticsSection";
import MobileMenu from "@/components/ui/MobileMenu";
import RightPane from "@/components/rightPane/RightPane";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PriorityType, TagType } from "@/context/TaskContext";
import { CalendarView } from "@/components/calendar/CalendarView"; // Added import

const Index = () => {
  const [activeTab, setActiveTab] = useState("todo");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFilter: "all",
    priorityFilter: "all" as PriorityType | "all",
    tagFilter: "all" as TagType | "all"
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleMobileMenu={toggleMobileMenu} />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-1">
        <main className="flex-1">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="px-4 py-8">
              <div className="max-w-4xl mx-auto mb-8">
                <TabNavigation 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  filters={filters}
                  setFilters={setFilters}
                />
              </div>

              <div className="max-w-5xl mx-auto">
                {activeTab === "todo" && (
                  <div className="space-y-6">
                    <TaskList 
                      completed={false} 
                      dateFilter={filters.dateFilter}
                      priorityFilter={filters.priorityFilter}
                      tagFilter={filters.tagFilter}
                    />
                  </div>
                )}

                {activeTab === "done" && (
                  <TaskList 
                    completed={true} 
                    dateFilter={filters.dateFilter}
                    priorityFilter={filters.priorityFilter}
                    tagFilter={filters.tagFilter}
                  />
                )}

                {activeTab === "calendar" && (
                  <CalendarView />
                )}
                {activeTab === "analytics" && (
                  <AnalyticsSection />
                )}
              </div>
            </div>
          </ScrollArea>
        </main>

        <RightPane />
      </div>
    </div>
  );
};

export default Index;