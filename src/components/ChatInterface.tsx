import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: File[];
}

const financeQuotes = [
  "Analyzing market trends...",
  "Processing portfolio data...", 
  "Evaluating investment opportunities...",
  "Scanning financial indicators...",
  "Optimizing trading strategies...",
  "Reviewing market sentiment..."
];

interface ChatInterfaceProps {
  initialMessage?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const handleInitialMessage = async () => {
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: initialMessage,
          timestamp: new Date(),
        };

        setMessages([userMessage]);
        setIsLoading(true);

        try {
          const response = await fetch('https://n8n.srv956557.hstgr.cloud/webhook/1f4ae953-6d1c-4353-9aa3-a1746de6bc6d', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              msg: initialMessage
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to get response');
          }

      const data = await response.text();
      
      // Parse JSON response and extract output field
      let assistantContent = data;
      try {
        const jsonData = JSON.parse(data);
        assistantContent = jsonData.output || data;
      } catch {
        // If not JSON, use the raw response
        assistantContent = data;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

          setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
          console.error('Error sending message:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      handleInitialMessage();
    }
  }, [initialMessage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentQuote((prev) => (prev + 1) % financeQuotes.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const sendMessage = async (messageContent?: string, files?: File[]) => {
    const content = messageContent || inputMessage.trim();
    const filesToSend = files || selectedFiles;
    if (!content && filesToSend.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      files: filesToSend.length > 0 ? [...filesToSend] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      let response;
      
      if (filesToSend.length > 0) {
        // Send as multipart/form-data for images
        const formData = new FormData();
        formData.append('msg', content);
        
        for (const file of filesToSend) {
          formData.append('files', file);
        }
        
        response = await fetch('https://n8n.srv956557.hstgr.cloud/webhook/1f4ae953-6d1c-4353-9aa3-a1746de6bc6d', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Send as JSON for text-only messages
        response = await fetch('https://n8n.srv956557.hstgr.cloud/webhook/1f4ae953-6d1c-4353-9aa3-a1746de6bc6d', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ msg: content }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

          const data = await response.text();
          
          // Parse JSON response and extract output field
          let assistantContent = data;
          try {
            const jsonData = JSON.parse(data);
            assistantContent = jsonData.output || data;
          } catch {
            // If not JSON, use the raw response
            assistantContent = data;
          }
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: assistantContent,
            timestamp: new Date()
          };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 w-full">
        {messages.length === 0 && (
          <div className="text-center mt-6 sm:mt-10 md:mt-20 px-4">
            <img 
              src="/lovable-uploads/054544fe-d4fc-45d6-9c30-3624264b30a5.png" 
              alt="Mudita Bullforce Logo" 
              className="mx-auto mb-3 sm:mb-4 h-12 sm:h-16 md:h-20 w-auto"
            />
            <div 
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.125rem'
              }}
              className="sm:gap-1 md:flex-row md:justify-center md:gap-2"
            >
              <span
                style={{ 
                  fontSize: 'clamp(1rem, 5vw, 1.5rem)',
                  fontWeight: '600',
                  color: '#000000 !important',
                  WebkitTextFillColor: '#000000 !important',
                  textShadow: 'none !important',
                  background: 'transparent !important',
                  backgroundImage: 'none !important',
                  backgroundClip: 'initial !important',
                  WebkitBackgroundClip: 'initial !important',
                  filter: 'none !important'
                }}
              >
                Bullforce
              </span>
              <span
                style={{ 
                  fontSize: 'clamp(1rem, 5vw, 1.5rem)',
                  fontWeight: '600',
                  color: '#000000 !important',
                  WebkitTextFillColor: '#000000 !important',
                  textShadow: 'none !important',
                  background: 'transparent !important',
                  backgroundImage: 'none !important',
                  backgroundClip: 'initial !important',
                  WebkitBackgroundClip: 'initial !important',
                  filter: 'none !important'
                }}
              >
                ChatAssistant
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 leading-relaxed">Ask me anything about your portfolio or the market!</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} px-1 sm:px-2`}
          >
            <div className={`${message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'} max-w-[85%] sm:max-w-[80%] md:max-w-[75%]`}>
              {message.files && message.files.length > 0 && (
                <div className="mb-2 md:mb-3">
                  <div className="text-xs text-muted-foreground mb-1 md:mb-2">Attached files:</div>
                  <div className="grid gap-1 md:gap-2">
                    {message.files.map((file, index) => (
                      <div key={index}>
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name}
                            className="max-w-full sm:max-w-xs md:max-w-sm rounded-lg border border-border"
                          />
                        ) : (
                          <div className="text-xs bg-muted px-2 py-1 rounded">
                            📎 {file.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {message.type === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown 
                    components={{
                      h1: ({children}) => <h1 className="text-base sm:text-lg md:text-2xl font-bold text-accent mb-2 md:mb-4 mt-2 sm:mt-3 md:mt-6">{children}</h1>,
                      h2: ({children}) => <h2 className="text-sm sm:text-base md:text-xl font-semibold text-secondary mb-1.5 sm:mb-2 md:mb-3 mt-2 sm:mt-3 md:mt-5">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm md:text-lg font-medium text-accent/80 mb-1 md:mb-2 mt-1.5 sm:mt-2 md:mt-4">{children}</h3>,
                      p: ({children}) => <p className="text-foreground mb-1.5 sm:mb-2 md:mb-3 leading-relaxed text-xs sm:text-sm md:text-base">{children}</p>,
                      ul: ({children}) => <ul className="space-y-1 md:space-y-2 mb-2 md:mb-4">{children}</ul>,
                      li: ({children}) => (
                        <li className="flex items-start space-x-1.5 sm:space-x-2 text-foreground text-xs sm:text-sm md:text-base">
                          <span className="text-accent font-bold text-sm sm:text-base md:text-lg leading-none mt-0.5">•</span>
                          <span>{children}</span>
                        </li>
                      ),
                      strong: ({children}) => <strong className="font-semibold text-accent">{children}</strong>,
                      em: ({children}) => <em className="italic text-secondary">{children}</em>,
                      table: ({children}) => (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-border rounded-lg overflow-hidden mb-4 text-xs sm:text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({children}) => (
                        <th className="bg-primary text-primary-foreground px-2 sm:px-4 py-1 sm:py-2 text-left font-semibold text-xs sm:text-sm">
                          {children}
                        </th>
                      ),
                      td: ({children}) => (
                        <td className="border-t border-border px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">{children}</td>
                      ),
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-accent pl-2 sm:pl-4 ml-1 sm:ml-2 italic text-muted-foreground text-xs sm:text-sm">
                          {children}
                        </blockquote>
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs sm:text-sm md:text-base leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start px-1 sm:px-2">
            <div className="chat-bubble-assistant max-w-[85%] sm:max-w-[80%] md:max-w-[75%]">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 animate-pulse text-accent flex-shrink-0" />
                <span className="loading-pulse text-xs sm:text-sm md:text-base">{financeQuotes[currentQuote]}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="w-full bg-transparent">
        <div className="p-2 sm:p-3 md:p-4 m-2 sm:m-3 md:m-4 bg-transparent">
        {selectedFiles.length > 0 && (
          <div className="mb-2 sm:mb-3 p-2 bg-muted rounded-lg">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Selected files:</p>
            <div className="flex flex-wrap gap-1">
              {selectedFiles.map((file, index) => (
                <span key={index} className="text-xs bg-primary/20 px-2 py-1 rounded">
                  {file.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex space-x-1.5 sm:space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          >
            <Paperclip className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
          </Button>
          
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your portfolio, market trends, or trading strategies..."
            className="flex-1 text-xs sm:text-sm md:text-base min-h-[32px] sm:min-h-[36px] md:min-h-[40px]"
            style={{
              backgroundColor: 'white',
              border: '1px solid black',
              color: 'black'
            }}
            disabled={isLoading}
          />
          
          <Button
            onClick={() => sendMessage()}
            disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
            style={{
              backgroundColor: '#FADE7B',
              borderColor: 'black',
              border: '1px solid black'
            }}
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" style={{ color: 'black' }} />
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};