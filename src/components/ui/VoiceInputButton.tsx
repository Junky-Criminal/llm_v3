
import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceInputButtonProps {
  onVoiceInput: (text: string) => void;
  className?: string;
}

const VoiceInputButton = ({ onVoiceInput, className }: VoiceInputButtonProps) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    // Check if browser supports SpeechRecognition
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      toast.error("Voice input is not supported in your browser.");
      return;
    }

    setIsListening(true);

    // In a real implementation, we would use the Web Speech API
    // For this demo, we'll simulate voice recognition with a timeout
    setTimeout(() => {
      const mockRecognizedText = "Buy groceries tomorrow at 5pm";
      onVoiceInput(mockRecognizedText);
      setIsListening(false);
      toast.success("Voice input received!");
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
    // In a real implementation, we would stop the speech recognition here
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300",
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-primary text-white",
        className
      )}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
};

export default VoiceInputButton;
