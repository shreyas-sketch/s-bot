import React, { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, Message } from '@/contexts/ChatContext';
import { useToast } from '@/hooks/use-toast';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { NewSessionInterface } from './NewSessionInterface';

const DEBUG_CHAT = typeof window !== 'undefined' && (window as any).DEBUG_CHAT; // Set DEBUG_CHAT=true in browser console for debugging

interface ChatMainV2Props {
  onQuickAction?: (query: string) => void;
}

export const ChatMainV2: React.FC<ChatMainV2Props> = ({ onQuickAction }) => {
  const { user } = useAuth();
  const { currentChat, createNewChat, addMessage, updateChatTitle } = useChat();
  const { toast } = useToast();
  
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentMessages = currentChat?.messages || [];
  const hasMessages = currentMessages.length > 0;

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollToBottom = () => {
        scrollAreaRef.current?.scrollTo({ 
          top: scrollAreaRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      };
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentMessages, isLoading]);

  const sendToWebhook = async (formData: FormData): Promise<any> => {
    if (DEBUG_CHAT) {
      console.log('Sending to webhook with FormData');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s timeout

    try {
      const response = await fetch('https://n8n.srv956557.hstgr.cloud/webhook/1f4ae953-6d1c-4353-9aa3-a1746de6bc6d', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      const data = await response.json();
      if (DEBUG_CHAT) console.log('Webhook response:', data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!user || (!message.trim() && (!files || files.length === 0))) return;

    // Get or create session
    let sessionId = currentChat?.sessionId;
    if (!sessionId) {
      sessionId = createNewChat();
    }

    setIsLoading(true);
    const userMessageId = nanoid();

    try {
      // Create blob URLs for image display in chat
      let imageUrl: string | undefined;
      const imageFiles = files?.filter(file => file.type.startsWith('image/')) || [];
      if (imageFiles.length > 0) {
        imageUrl = URL.createObjectURL(imageFiles[0]);
      }

      // Create user message for display
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        text: message.trim(),
        imageUrl: imageUrl,
        ts: Date.now()
      };

      // Optimistically add user message
      addMessage(sessionId, userMessage);

      // Update chat title if this is the first message
      if (currentChat && currentChat.messages.length === 0 && message.trim()) {
        updateChatTitle(sessionId, message.trim());
      }

      // Prepare multipart/form-data payload
      const formData = new FormData();
      formData.append('msg', message.trim());
      formData.append('session_id', sessionId);
      formData.append('user_id', user.email || 'guest@local');
      formData.append('timestamp', new Date().toISOString());

      // Add files if present
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      if (DEBUG_CHAT) {
        console.log('Sending FormData with files:', files?.length || 0);
      }

      // Send to webhook
      const response = await sendToWebhook(formData);

      // Parse response array and get first element
      const responseData = Array.isArray(response) ? response[0] : response;
      const outputMessage = responseData?.output_message || 'No response received';

      // Create assistant message
      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        text: outputMessage,
        ts: Date.now()
      };

      // Add assistant message and scroll to bottom
      addMessage(sessionId, assistantMessage);
      
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ 
            top: scrollAreaRef.current.scrollHeight, 
            behavior: 'smooth' 
          });
        }
      }, 200);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        text: 'I couldn\'t reach the server. Please try again.',
        ts: Date.now()
      };
      addMessage(sessionId!, errorMessage);

      toast({
        title: "Error",
        description: "Could not reach server. Message kept in chat.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setInputMessage('');
      setSelectedFiles([]);
    }
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
    if (onQuickAction) onQuickAction(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage, selectedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  if (!hasMessages && !isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <NewSessionInterface
          showQuickActions={true}
          onQuickAction={handleQuickAction}
          onSendMessage={handleSendMessage}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          handleKeyPress={handleKeyPress}
          handleFileSelect={handleFileSelect}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages viewport */}
      <section
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-28 space-y-3"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {currentMessages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </section>

      {/* Composer - transparent container (no white, no glass) */}
      <div className="sticky bottom-0 w-full border-t border-[color:var(--border)] bg-transparent" style={{ boxShadow: 'var(--shadow)' }}>
        <div className="mx-auto max-w-3xl p-3">
          <NewSessionInterface
            showQuickActions={false}
            onQuickAction={handleQuickAction}
            onSendMessage={handleSendMessage}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            handleKeyPress={handleKeyPress}
            handleFileSelect={handleFileSelect}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
