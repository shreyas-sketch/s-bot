import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { SessionManager } from '@/components/chat/SessionManager';
import { ChatMainV2 } from '@/components/chat/ChatMainV2';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <SessionManager>
      <ChatMainV2 />
    </SessionManager>
  );
};

export default Index;
