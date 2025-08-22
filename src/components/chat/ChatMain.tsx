import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MarkdownComponents } from './MarkdownComponents';
import { NewSessionInterface } from './NewSessionInterface';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments: Array<{ type: string; url: string; base64?: string }>;
  images?: Array<{ type: string; url: string; base64?: string }>;
  timestamp: string;
}

interface ChatMainProps {
  sessionId: number | null;
  messages: Message[];
  onMessagesUpdate: (messages: Message[], sessionId?: number) => void;
  onQuickAction?: (query: string) => void;
}

export const ChatMain: React.FC<ChatMainProps> = ({
  sessionId,
  messages,
  onMessagesUpdate,
  onQuickAction
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSessionId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const sendToN8N = async (sessionId: number, content: string, attachments: any[], files: File[] = []) => {
    // Upload first image (if any) to Supabase Storage and send URL to backend
    let uploadedImageUrl: string | null = null;

    try {
      if (files && files.length > 0 && user) {
        const imageFile = files.find((f) => f.type.startsWith('image/'));
        if (imageFile) {
          const path = `${user.id}/${sessionId}/${Date.now()}-${imageFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('chat-temp')
            .upload(path, imageFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: imageFile.type,
            });
          if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw uploadError;
          }
          const { data: publicData } = supabase.storage.from('chat-temp').getPublicUrl(path);
          uploadedImageUrl = publicData.publicUrl;
        }
      }

      const n8nPayload = {
        session_id: sessionId,
        user_id: user?.email || user?.id || '',
        input: {
          text: content || '',
          image_url: uploadedImageUrl,
        },
        timestamp: new Date().toISOString(),
      };

      console.log('Sending to n8n (new payload):', n8nPayload);
      const res = await fetch(
        'https://n8n.srv956557.hstgr.cloud/webhook/1f4ae953-6d1c-4353-9aa3-a1746de6bc6d',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('n8n webhook error:', res.status, res.statusText, errorText);
        throw new Error(`n8n webhook error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('n8n response:', data);

      // Ask backend to delete the uploaded temp file after response is generated
      if (uploadedImageUrl) {
        const cleanupPayload = {
          action: 'DELETE_UPLOADED_IMAGE',
          session_id: sessionId,
          user_id: user?.email || user?.id || '',
          image_url: uploadedImageUrl,
          timestamp: new Date().toISOString(),
        };
        fetch('https://n8n.srv956557.hstgr.cloud/webhook/1f4ae953-6d1c-4353-9aa3-a1746de6bc6d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanupPayload),
        }).catch((e) => console.warn('Image cleanup request failed:', e));
      }

      return data; // Expecting object with output_message and optional image(s)
    } catch (error) {
      console.error('n8n request failed:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;
    if (!user) return;

    setIsLoading(true);
    try {
      const attachments = selectedFiles.map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file)
      }));

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: inputMessage,
        attachments,
        timestamp: new Date().toISOString()
      };

      const currentSessionId = sessionId || generateSessionId();

      // Add user message to UI immediately
      const updatedMessages = [...messages, userMessage];
      onMessagesUpdate(updatedMessages, currentSessionId);

      // Clear input
      setInputMessage('');
      setSelectedFiles([]);

      // Send to n8n and get response (backend will save the data)
      const n8nResponse = await sendToN8N(currentSessionId, inputMessage, attachments, selectedFiles);
      
      console.log('Processing n8n response:', n8nResponse);
      
      // Handle response - expect object format with output_message
      if (n8nResponse && n8nResponse.output_message) {
        // Parse response images if any (support array or single URL)
        const responseImages = n8nResponse.images
          ? n8nResponse.images
          : (n8nResponse.image_url ? [{ type: 'image', url: n8nResponse.image_url }] : []);
        
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: n8nResponse.output_message,
          attachments: [],
          images: responseImages,
          timestamp: n8nResponse.created_at || new Date().toISOString()
        };

        console.log('Adding assistant message:', assistantMessage);
        
        // Add assistant message to UI
        const finalMessages = [...updatedMessages, assistantMessage];
        onMessagesUpdate(finalMessages, currentSessionId);
      } else {
        console.error('Invalid n8n response format:', n8nResponse);
        toast({
          title: "Error",
          description: "Invalid response format from backend",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleQuickAction = async (query: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: query,
        attachments: [],
        timestamp: new Date().toISOString()
      };

      const currentSessionId = sessionId || generateSessionId();

      // Add user message to UI immediately
      const updatedMessages = [...messages, userMessage];
      onMessagesUpdate(updatedMessages, currentSessionId);

      // Send to n8n and get response (backend will save the data)
      const n8nResponse = await sendToN8N(currentSessionId, query, [], []);
      
      console.log('Processing n8n response:', n8nResponse);
      
      // Handle response - expect object format with output_message
      if (n8nResponse && n8nResponse.output_message) {
        // Parse response images if any (support array or single URL)
        const responseImages = n8nResponse.images
          ? n8nResponse.images
          : (n8nResponse.image_url ? [{ type: 'image', url: n8nResponse.image_url }] : []);
        
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: n8nResponse.output_message,
          attachments: [],
          images: responseImages,
          timestamp: n8nResponse.created_at || new Date().toISOString()
        };

        console.log('Adding assistant message:', assistantMessage);
        
        // Add assistant message to UI
        const finalMessages = [...updatedMessages, assistantMessage];
        onMessagesUpdate(finalMessages, currentSessionId);
      } else {
        console.error('Invalid n8n response format:', n8nResponse);
        toast({
          title: "Error",
          description: "Invalid response format from backend",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasStartedChat = sessionId || messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {hasStartedChat && (
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                  {message.role === 'assistant' ? (
                    <div className="markdown-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={MarkdownComponents}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div>{message.content}</div>
                  )}
                  
                  {/* User attachments */}
                  {message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="relative">
                          {attachment.type === 'image' && (
                            <img
                              src={attachment.url}
                              alt="Attachment"
                              className="max-w-xs rounded-lg"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Assistant response images */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.base64 || image.url}
                            alt="Response Image"
                            className="max-w-sm rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="chat-bubble-assistant flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}

      <NewSessionInterface 
        showQuickActions={!hasStartedChat}
        onQuickAction={handleQuickAction}
        onSendMessage={(message, files) => {
          setInputMessage(message);
          if (files) setSelectedFiles(files);
          setTimeout(() => handleSendMessage(), 0);
        }}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        handleFileSelect={handleFileSelect}
        isLoading={isLoading}
      />
    </div>
  );
};