
import React from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Bell, LogOut, Menu, User } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  toggleMobileMenu: () => void;
}

const Header = ({ toggleMobileMenu }: HeaderProps) => {
  const { session } = useTaskContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <button 
          className="inline-flex items-center justify-center rounded-md p-2.5 text-sm font-medium md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent font-bold">
              Say Hello to Productivity
            </span>
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{session.user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={handleLogin}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
