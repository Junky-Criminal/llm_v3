import React, { createContext, useContext, useState, useEffect } from "react";

interface RightPaneContextType {
  isRightPaneOpen: boolean;
  setIsRightPaneOpen: (isOpen: boolean) => void;
}

const RightPaneContext = createContext<RightPaneContextType | undefined>(
  undefined,
);

export function RightPaneProvider({ children }: { children: React.ReactNode }) {
  const [isRightPaneOpen, setIsRightPaneOpen] = useState(false);

  useEffect(() => {
    const handleRightPaneToggle = (event: CustomEvent<{ isOpen: boolean }>) => {
      setIsRightPaneOpen(event.detail.isOpen);
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

  return (
    <RightPaneContext.Provider value={{ isRightPaneOpen, setIsRightPaneOpen }}>
      {children}
    </RightPaneContext.Provider>
  );
}

export function useRightPaneContext() {
  const context = useContext(RightPaneContext);
  if (context === undefined) {
    throw new Error(
      "useRightPaneContext must be used within a RightPaneProvider",
    );
  }
  return context;
}
