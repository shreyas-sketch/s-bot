import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const financeQuotes = [
  "Analyzing market trends...",
  "Processing portfolio data...",
  "Calculating risk metrics...",
  "Reviewing sector performance...",
  "Evaluating trading opportunities...",
  "Checking market sentiment...",
  "Analyzing price patterns...",
  "Computing technical indicators..."
];

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % financeQuotes.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex justify-start mb-4 ${className}`}>
      <div className="chat-bubble-assistant flex items-center space-x-3">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          connecting... {financeQuotes[currentQuote]}
        </span>
      </div>
    </div>
  );
};