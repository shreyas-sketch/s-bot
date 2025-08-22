import React, { useState, useRef } from 'react';
import { LineChart, PieChart, Activity, Filter, Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface HomeScreenProps {
  onQuickAction: (query: string) => void;
}

const quickActions = [
  {
    id: 1,
    text: "Analyze this chart for trading opportunities",
    icon: LineChart,
    description: "Get insights on trading signals"
  },
  {
    id: 2,
    text: "Here's my stock market portfolio! Analyze it for me",
    icon: PieChart,
    description: "Portfolio performance analysis"
  },
  {
    id: 3,
    text: "How is the stock market performing today?",
    icon: Activity,
    description: "Current market performance"
  },
  {
    id: 4,
    text: "Which sector is in a bull run?",
    icon: Filter,
    description: "Identify bullish sectors"
  }
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onQuickAction }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCustomMessage = () => {
    if (inputMessage.trim()) {
      inputRef.current?.blur();
      onQuickAction(inputMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Hero Section */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12 max-w-2xl px-2">
        <div className="mb-4 md:mb-6">
          <img 
            src="/lovable-uploads/054544fe-d4fc-45d6-9c30-3624264b30a5.png" 
            alt="Mudita Bullforce Logo" 
            className="mx-auto mb-3 h-10 sm:h-12 md:h-16 w-auto"
          />
          <h1 className="font-bold tracking-tight text-black text-xl sm:text-2xl md:text-4xl leading-tight">
            Portfolio Review AI Agent
          </h1>
        </div>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 font-light px-4">
          Your intelligent financial assistant
        </p>
        <div className="mt-3 md:mt-4 h-1 w-12 md:w-20 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #C16821, #FADE7B)' }}></div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl px-2">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card
              key={action.id}
              className="quick-action-btn cursor-pointer group p-3 sm:p-4"
              onClick={() => onQuickAction(action.text)}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl md:rounded-2xl flex-shrink-0" style={{ backgroundColor: '#F4D03F' }}>
                  <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm md:text-base text-black leading-tight mb-1">
                    {action.text}
                  </h3>
                  <p className="text-xs sm:text-xs md:text-sm text-gray-400 leading-tight">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Chat Input Box */}
      <Card className="w-full max-w-2xl p-3 sm:p-3.5 md:p-4 border-border mt-4 sm:mt-6 md:mt-8 bg-white mx-2">
        {selectedFiles.length > 0 && (
          <div className="mb-2 md:mb-3 p-2 bg-muted rounded-lg">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Selected files:</p>
            {selectedFiles.map((file, index) => (
              <span key={index} className="text-xs bg-primary/20 px-2 py-1 rounded mr-2">
                {file.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />
          
    <Button
      variant="ghost"
      size="icon"
      onClick={() => fileInputRef.current?.click()}
      className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 bg-transparent border-0 hover:bg-transparent"
    >
      <Paperclip className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-black" />
    </Button>
          
<Input
  ref={inputRef}
  value={inputMessage}
  onChange={(e) => setInputMessage(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Ask me anything about your portfolio or the market..."
  className="flex-1 text-xs sm:text-sm md:text-base bg-transparent rounded-none focus-visible:ring-0 focus-visible:outline-none border-0 shadow-none text-black placeholder:text-black focus:border-0 focus:ring-0 min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
/>
          
          <Button
            onClick={handleCustomMessage}
            disabled={!inputMessage.trim() && selectedFiles.length === 0}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 md:w-auto md:px-4 hover:opacity-90"
            style={{ backgroundColor: '#FADE7B', color: '#000000' }}
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" style={{ color: '#000000' }} />
            <span className="hidden md:inline ml-2" style={{ color: '#000000' }}>Send</span>
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <div className="mt-4 sm:mt-6 md:mt-8 text-center px-4">
        <p className="text-xs sm:text-sm text-black">
          Powered by Bullforce
        </p>
      </div>
    </div>
  );
};