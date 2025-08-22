import React, { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMain } from '@/components/chat/ChatMain';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments: Array<{ type: string; url: string; base64?: string }>;
  images?: Array<{ type: string; url: string; base64?: string }>;
  timestamp: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export const ChatDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const generateSessionId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  };

  const loadSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Loading sessions for user:', user.email);
      const { data, error } = await supabase
        .from('Stocks_portfolio')
        .select('session_id, created_at, input_message')
        .eq('user_id', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Raw sessions data:', data);
      
      // Group unique sessions and filter out null session_ids
      const sessionMap = new Map();
      (data || [])
        .filter(item => item.session_id)
        .forEach(item => {
          if (!sessionMap.has(item.session_id)) {
            // Use the first user message as title, or fallback to session ID
            const title = item.input_message 
              ? item.input_message.slice(0, 50) + (item.input_message.length > 50 ? '...' : '')
              : `Chat ${item.session_id}`;
            
            sessionMap.set(item.session_id, {
              id: item.session_id,
              title,
              created_at: item.created_at,
              updated_at: item.created_at
            });
          }
        });
      
      const uniqueSessions = Array.from(sessionMap.values());
      
      console.log('Processed sessions:', uniqueSessions);
      setSessions(uniqueSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (sessionId: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('Stocks_portfolio')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.email)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages: Message[] = [];
      (data || []).forEach(item => {
        if (item.input_message) {
          formattedMessages.push({
            id: `${item.id}-user`,
            role: 'user',
            content: item.input_message,
            attachments: [],
            timestamp: item.created_at
          });
        }
        if (item.output_message) {
          formattedMessages.push({
            id: `${item.id}-assistant`,
            role: 'assistant', 
            content: item.output_message,
            attachments: [],
            timestamp: item.created_at
          });
        }
      });
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const createNewSession = () => {
    // Just clear the current session - backend will provide new session_id
    setCurrentSessionId(null);
    setMessages([]);
  };

  const selectSession = (sessionId: number) => {
    setCurrentSessionId(sessionId);
    loadMessages(sessionId);
  };

  const handleMessagesUpdate = (newMessages: Message[], sessionId?: number) => {
    setMessages(newMessages);
    
    // If we receive a new session ID, update current session
    if (sessionId && sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
    }
    
    // If this is a new session and we have messages, update sessions
    if ((!currentSessionId || sessionId) && newMessages.length > 0) {
      loadSessions();
    }
  };

  const handleSessionRename = async (sessionId: number, newTitle: string) => {
    try {
      // Update in database - we'll need to add a proper sessions table for this
      // For now, just update the local state
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, title: newTitle }
            : session
        )
      );
      
      toast({
        title: "Success",
        description: "Session renamed successfully"
      });
    } catch (error) {
      console.error('Error renaming session:', error);
      toast({
        title: "Error", 
        description: "Failed to rename session",
        variant: "destructive"
      });
    }
  };

  const handleSessionDelete = async (sessionId: number) => {
    try {
      // Send webhook for session deletion
      const webhookPayload = {
        message: `DELETE__${sessionId}`
      };

      console.log('Sending session delete webhook:', webhookPayload);
      
      const webhookResponse = await fetch(
        'https://n8n.srv956557.hstgr.cloud/webhook/1f4ae953-6d1c-4353-9aa3-a1746de6bc6d',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        }
      );

      if (!webhookResponse.ok) {
        console.warn('Webhook failed, but continuing with local deletion');
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('Stocks_portfolio')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user?.email);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      
      toast({
        title: "Success",
        description: "Session deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session", 
        variant: "destructive"
      });
    }
  };

  const handleQuickAction = (query: string) => {
    // This will trigger sending the message
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
  };

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full text-[color:var(--ink)]">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-screen">
        {/* Sidebar - Fixed on desktop */}
        <aside className="hidden md:block sticky top-0 h-screen flex flex-col bg-[color:var(--surface)]/90 backdrop-blur-sm border-r border-[color:var(--border)]">
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={selectSession}
            onNewSession={createNewSession}
            onSessionRename={handleSessionRename}
            onSessionDelete={handleSessionDelete}
            isLoading={isLoading}
          />
        </aside>
        
        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <>
            <div 
              className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="md:hidden fixed left-0 top-0 h-full w-80 z-50 bg-[color:var(--surface)]/95 backdrop-blur-sm border-r border-[color:var(--border)]">
              <div className="flex justify-between items-center p-4 border-b border-[color:var(--border)]">
                <h2 className="font-semibold text-[color:var(--ink)]">Chat Sessions</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-[color:var(--ink)] hover:bg-[#FFF7E6]"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <ChatSidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSessionSelect={(sessionId) => {
                  selectSession(sessionId);
                  setIsMobileSidebarOpen(false);
                }}
                onNewSession={() => {
                  createNewSession();
                  setIsMobileSidebarOpen(false);
                }}
                onSessionRename={handleSessionRename}
                onSessionDelete={handleSessionDelete}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
        
        {/* Chat column */}
        <main className="flex flex-col min-h-screen">
          {/* Mobile menu button */}
          <div className="md:hidden p-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[color:var(--ink)] hover:bg-[#FFF7E6] border-0 focus:ring-0"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1">
            <ChatMain
              sessionId={currentSessionId}
              messages={messages}
              onMessagesUpdate={handleMessagesUpdate}
              onQuickAction={handleQuickAction}
            />
          </div>
        </main>
      </div>
    </div>
  );
};