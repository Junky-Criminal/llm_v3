import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import { Toaster } from "@/components/ui/sonner";
import { useTaskContext, TaskProvider } from "@/context/TaskContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RightPaneProvider } from "./context/RightPaneContext"; // Added import

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useTaskContext();
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    if (!isLoading && !session) {
      setShouldNavigate(true);
    }
  }, [isLoading, session]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (shouldNavigate) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  // Add a local session state to track initial loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialSession, setInitialSession] = useState<any>(null);

  // Check for initial session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setInitialSession(data.session);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    checkSession();
  }, []);

  // Show loading state during initial auth check
  if (initialLoading) {
    return <div className="flex h-screen items-center justify-center">Initializing...</div>;
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RightPaneProvider> {/* Added RightPaneProvider */}
        <TaskProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={
                initialSession ? <Navigate to="/" replace /> : <Auth />
              } />
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <Index />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" closeButton />
          </Router>
        </TaskProvider>
      </RightPaneProvider> {/* Added RightPaneProvider */}
    </ThemeProvider>
  );
}

export default App;