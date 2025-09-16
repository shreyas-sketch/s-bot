import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MessageCircle, Plus, LogOut, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: number | null;
  onSessionSelect: (sessionId: number) => void;
  onNewSession: () => void;
  onSessionRename: (sessionId: number, newTitle: string) => void;
  onSessionDelete: (sessionId: number) => void;
  isLoading: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onSessionRename,
  onSessionDelete,
  isLoading,
  isCollapsed,
  onToggleCollapse
}) => {
  const { signOut, user } = useAuth();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<number | null>(null);

  const getFirstThreeWords = (text: string) => {
    return text.split(' ').slice(0, 3).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleRename = (sessionId: number, currentTitle: string) => {
    setRenameSessionId(sessionId);
    setRenameValue(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (renameSessionId && renameValue.trim()) {
      onSessionRename(renameSessionId, renameValue.trim());
      setRenameDialogOpen(false);
      setRenameSessionId(null);
      setRenameValue('');
    }
  };

  const handleDelete = (sessionId: number) => {
    setDeleteSessionId(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteSessionId) {
      onSessionDelete(deleteSessionId);
      setDeleteDialogOpen(false);
      setDeleteSessionId(null);
    }
  };

  return (
    <>
      <div className={`flex flex-col h-screen lg:h-full transition-all duration-300 bg-white ${isCollapsed ? 'w-20' : 'w-80 border-r border-white'}`}>
        {/* Header - Pinned */}
        <header className="sticky top-0 z-10 p-4 border-b border-[color:var(--border)]">
          {!isCollapsed && (
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/lovable-uploads/054544fe-d4fc-45d6-9c30-3624264b30a5.png" 
                alt="Mudita Bullforce Logo" 
                className="h-8 w-auto"
              />
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/7694b526-dd2f-4253-8353-943e407d654f.png" 
                alt="Bull Logo" 
                className="h-8 w-auto"
              />
            </div>
          )}
          <div className={`${isCollapsed ? 'flex justify-center' : ''}`}>
            <Button 
              onClick={onNewSession}
              className={`${isCollapsed ? 'w-12 h-12 p-0 bg-[color:var(--accent-2)] hover:bg-[color:var(--accent-2)] justify-center items-center' : 'w-full bg-[color:var(--accent)] hover:bg-[color:var(--accent-2)]'} text-black rounded-md`}
              disabled={isLoading}
              title={isCollapsed ? "New Chat" : ""}
            >
              <Plus className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} text-black`} />
              {!isCollapsed && <span className="ml-2 text-black">New Chat</span>}
            </Button>
          </div>
          
          {/* Collapse Toggle Button */}
          <div className={`${isCollapsed ? 'flex justify-center' : ''}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:block absolute -right-3 top-4 z-10 bg-white border border-[color:var(--border)] rounded-full w-6 h-6 p-0 hover:bg-[#FFF7E6]"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3 !text-black" /> : <ChevronLeft className="w-3 h-3 !text-black" />}
            </Button>
          </div>
        </header>

        {/* Sessions List - Scrollable */}
        <nav className={`flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300/40 scrollbar-track-transparent ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {sessions.map((session) => (
            <div key={session.id} className={`relative group ${isCollapsed ? 'flex justify-center' : ''}`}>
                <Button
                variant="ghost"
                className={`${isCollapsed ? 'w-12 h-12 justify-center p-2' : 'w-full justify-start text-left h-auto p-3'} bg-white hover:bg-[#FFF7E6] border border-[color:var(--border)] rounded-xl shadow-[var(--shadow)] text-black ${
                  currentSessionId === session.id ? 'bg-[#FFF7E6] border-l-2 border-[color:var(--accent-2)]' : ''
                }`}
                onClick={() => onSessionSelect(session.id)}
                title={isCollapsed ? session.title : ""}
              >
                {isCollapsed ? (
                  <MessageCircle className="w-6 h-6 text-black" />
                ) : (
                  <div className="flex items-start gap-2 w-full">
                    <MessageCircle className="w-4 h-4 mt-0.5 text-black flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium text-black">
                        {session.title}
                      </div>
                      <div className="text-xs text-[color:var(--muted)] mt-1">
                        {formatDate(session.updated_at)}
                      </div>
                    </div>
                    <button
                      className="ml-auto text-black hover:text-red-500"
                      title="Delete session"
                      onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Button>

              {!isCollapsed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 hover:bg-[#FFF7E6]"
                    >
                      <MoreVertical className="w-3 h-3 text-black" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-[color:var(--border)]">
                    <DropdownMenuItem 
                      onClick={() => handleRename(session.id, session.title)}
                      className="hover:bg-[#FFF7E6] cursor-pointer text-[color:var(--ink)]"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(session.id)}
                      className="hover:bg-red-50 text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </nav>

        {/* Footer - Pinned at bottom */}
        <footer className={`sticky bottom-0 p-3 border-t border-[color:var(--border)] bg-white ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed && (
            <div className="text-xs text-black mb-2 truncate">
              {user?.email}
            </div>
          )}
          <div className={`${isCollapsed ? 'flex justify-center' : ''}`}>
            <Button 
              variant="ghost" 
              className={`${isCollapsed ? 'w-12 h-12 p-0 justify-center' : 'w-full justify-start'} text-black hover:bg-[#FFF7E6]`}
              onClick={signOut}
              title={isCollapsed ? "Sign Out" : ""}
            >
              <LogOut className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} text-black`} />
              {!isCollapsed && <span className="ml-2 text-black">Sign Out</span>}
            </Button>
          </div>
        </footer>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new session name..."
              onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit()}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};