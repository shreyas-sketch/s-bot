import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, BarChart3, Target, TrendingDown, Send, Paperclip, Loader2 } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  query: string;
}

interface NewSessionInterfaceProps {
  showQuickActions?: boolean;
  onQuickAction: (query: string) => void;
  onSendMessage: (message: string, files?: File[]) => void;
  inputMessage?: string;
  setInputMessage?: (message: string) => void;
  selectedFiles?: File[];
  setSelectedFiles?: (files: File[]) => void;
  handleSendMessage?: () => void;
  handleKeyPress?: (e: React.KeyboardEvent) => void;
  handleFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
  sidebarCollapsed?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: '1',
    title: 'Analyse this chart for trading opportuniites',
    description: 'Get insights on trading signals',
    icon: <TrendingUp className="w-6 h-6" />,
    query: 'Analyse this chart for trading opportuniites'
  },
  {
    id: '2', 
    title: "Here's my stock market portfolio! Analyze it for me",
    description: 'Portfolio analysis and insights',
    icon: <BarChart3 className="w-6 h-6" />,
    query: "Here's my stock market portfolio! Analyze it for me"
  },
  {
    id: '3',
    title: 'How is the stock market performing today ?',
    description: 'Current market performance', 
    icon: <Target className="w-6 h-6" />,
    query: 'How is the stock market performing today ?'
  },
  {
    id: '4',
    title: 'Which sectors are in bull run ?',
    description: 'Top performing sectors',
    icon: <TrendingUp className="w-6 h-6" />,
    query: 'Which sectors are in bull run ?'
  }
];

export const NewSessionInterface: React.FC<NewSessionInterfaceProps> = ({
  showQuickActions = true,
  onQuickAction,
  onSendMessage,
  inputMessage: externalInputMessage,
  setInputMessage: externalSetInputMessage,
  selectedFiles: externalSelectedFiles,
  setSelectedFiles: externalSetSelectedFiles,
  handleSendMessage: externalHandleSendMessage,
  handleKeyPress: externalHandleKeyPress,
  handleFileSelect: externalHandleFileSelect,
  isLoading = false,
  sidebarCollapsed = false
}) => {
  const [internalInputMessage, setInternalInputMessage] = useState('');
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<File[]>([]);

  // Use external state if provided, otherwise use internal state
  const inputMessage = externalInputMessage !== undefined ? externalInputMessage : internalInputMessage;
  const setInputMessage = externalSetInputMessage || setInternalInputMessage;
  const selectedFiles = externalSelectedFiles || internalSelectedFiles;
  const setSelectedFiles = externalSetSelectedFiles || setInternalSelectedFiles;

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage, selectedFiles);
      if (!externalInputMessage) {
        setInputMessage('');
        setSelectedFiles([]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (externalHandleSendMessage) {
        externalHandleSendMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleQuickActionClick = (query: string) => {
    if (externalInputMessage !== undefined) {
      onQuickAction(query);
    } else {
      onSendMessage(query, []);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (externalSetSelectedFiles) {
      externalSetSelectedFiles([...selectedFiles, ...files]);
    } else {
      setInternalSelectedFiles(prev => [...prev, ...files]);
    }
  };

  return (
    <div className={`${showQuickActions ? 'flex-1 flex flex-col' : ''}`} style={{ background: showQuickActions ? 'var(--new-session-bg)' : 'transparent' }}>
      {showQuickActions && (
        <>
          {/* Main content area */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`${sidebarCollapsed ? 'max-w-6xl' : 'max-w-4xl'} w-full text-center space-y-8`}>
              {/* Header Section */}
              <div className="space-y-4">
                <img 
                  src="/lovable-uploads/054544fe-d4fc-45d6-9c30-3624264b30a5.png" 
                  alt="Mudita Bullforce Logo" 
                  className="h-20 w-auto mx-auto"
                />
                <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--new-session-text))' }}>
                  Bullforce ChatAssistant
                </h1>
                <p className="text-xl" style={{ color: 'hsl(var(--new-session-text-muted))' }}>
                  Portfolio Review AI Agent
                </p>
                <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'hsl(var(--new-session-icon))' }}></div>
              </div>

              {/* Quick Actions Grid */}
              <div className={`grid grid-cols-1 ${sidebarCollapsed ? 'md:grid-cols-3 lg:grid-cols-4 max-w-6xl gap-6' : 'md:grid-cols-2 max-w-3xl gap-4'} mx-auto`}>
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className={`h-auto text-left border-2 transition-all duration-200 hover:shadow-lg flex items-start gap-4 ${sidebarCollapsed ? 'p-6 min-h-[140px]' : 'p-4 min-h-[100px]'}`}
                    style={{ 
                      backgroundColor: 'hsl(var(--new-session-card))',
                      borderColor: '#E5E7EB',
                      color: 'hsl(var(--new-session-text))'
                    }}
                    onClick={() => handleQuickActionClick(action.query)}
                  >
                    <div 
                      className={`flex-shrink-0 rounded-xl flex items-center justify-center ${sidebarCollapsed ? 'p-4' : 'p-3'}`}
                      style={{ 
                        backgroundColor: 'hsl(var(--new-session-icon-bg))',
                        color: 'hsl(var(--new-session-icon))'
                      }}
                    >
                      <div className={sidebarCollapsed ? 'w-7 h-7' : 'w-6 h-6'}>
                        {action.icon}
                      </div>
                    </div>
                    <div className="flex-1 text-left space-y-2 overflow-hidden">
                      <h3 className={`font-semibold leading-tight text-wrap ${sidebarCollapsed ? 'text-base' : 'text-sm'}`} style={{ color: 'hsl(var(--new-session-text))' }}>
                        {action.title}
                      </h3>
                      <p className={`leading-relaxed text-wrap ${sidebarCollapsed ? 'text-sm' : 'text-xs'}`} style={{ color: 'hsl(var(--new-session-text-muted))' }}>
                        {action.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pb-4 text-center">
            <p className="text-sm font-bold text-black">
              Powered by Bullforce
            </p>
          </div>
        </>
      )}

      {/* Chat Input Section - Always at bottom */}
      <div className={`${showQuickActions ? 'p-8 pt-0' : 'p-4'}`}>
        <div className={`${showQuickActions ? (sidebarCollapsed ? 'max-w-6xl' : 'max-w-4xl') + ' mx-auto' : 'w-full'}`}>
          <div className="relative flex items-center gap-2 p-3 rounded-full shadow-lg" style={{ backgroundColor: 'hsl(var(--new-session-card))' }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0"
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4 text-black" />
            </Button>
            
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={externalHandleKeyPress || handleKeyPress}
              placeholder="Ask me anything about your portfolio or the market..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-black placeholder:text-[color:var(--muted)]"
              disabled={isLoading}
            />
            
            <Button
              onClick={externalHandleSendMessage || handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-8 w-8 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: 'hsl(var(--new-session-icon))',
                color: 'white'
              }}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
            
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={externalHandleFileSelect || handleFileSelect}
              className="hidden"
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="bg-white/80 px-2 py-1 rounded text-sm flex items-center gap-2" style={{ color: 'hsl(var(--new-session-text))' }}>
                  {file.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (externalSetSelectedFiles) {
                        externalSetSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                      } else {
                        setInternalSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      }
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};