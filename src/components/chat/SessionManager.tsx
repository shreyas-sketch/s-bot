import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatSidebar } from './ChatSidebar';
import { Trash2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SessionManagerProps {
  children: React.ReactNode;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const { user } = useAuth();
  const { getAllChats, selectChat, createNewChat, deleteChat, updateChatTitle, currentChat } = useChat();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const allChats = getAllChats();

  const handleSessionDelete = async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Send delete webhook
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

      // Delete from local state
      deleteChat(sessionId);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Convert chats to legacy format for ChatSidebar
  const legacySessions = allChats.map(chat => ({
    id: parseInt(chat.sessionId),
    title: chat.title,
    created_at: chat.createdAt,
    updated_at: chat.createdAt
  }));

  return (
    <div className="min-h-screen w-full bg-finance-fixed bg-fixed text-slate-100">
      <div className="mx-auto  grid grid-cols-1 md:grid-cols-[298px_1fr] md:gap-6 min-h-screen">
        {/* Sidebar - Fixed on desktop */}
        <aside className="hidden md:block sticky top-0 h-screen flex flex-col bg-white/5 backdrop-blur-sm border-r border-white/10">
          <ChatSidebar
            sessions={legacySessions}
            currentSessionId={currentChat?.sessionId ? parseInt(currentChat.sessionId) : null}
            onSessionSelect={(id) => selectChat(id.toString())}
            onNewSession={createNewChat}
            onSessionRename={(id, title) => updateChatTitle(id.toString(), title)}
            onSessionDelete={(id) => handleSessionDelete(id.toString())}
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
            <div className="md:hidden fixed left-0 top-0 h-[100vh] w-80 z-50 bg-gray-900 border-r border-white/20">
              <div className="flex justify-between items-center p-4 border-b border-white/20">
                <h2 className="font-semibold text-slate-100">Chat Sessions</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-slate-100 hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatSidebar
                  sessions={legacySessions}
                  currentSessionId={currentChat?.sessionId ? parseInt(currentChat.sessionId) : null}
                  onSessionSelect={(id) => {
                    selectChat(id.toString());
                    setIsMobileSidebarOpen(false);
                  }}
                  onNewSession={() => {
                    createNewChat();
                    setIsMobileSidebarOpen(false);
                  }}
                  onSessionRename={(id, title) => updateChatTitle(id.toString(), title)}
                  onSessionDelete={(id) => handleSessionDelete(id.toString())}
                  isLoading={isLoading}
                />
              </div>
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
              className="text-black hover:bg-white/10 border-0 focus:ring-0"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};