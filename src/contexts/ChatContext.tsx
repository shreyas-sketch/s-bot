import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text?: string;
  imageUrl?: string;
  ts: number;
};

export type Chat = {
  sessionId: string;
  title: string;
  createdAt: string;
  messages: Message[];
};

export type ChatState = {
  currentId: string;
  chats: Record<string, Chat>;
};

interface ChatContextType {
  state: ChatState;
  currentChat: Chat | null;
  createNewChat: () => string;
  selectChat: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  deleteChat: (sessionId: string) => void;
  updateChatTitle: (sessionId: string, title: string) => void;
  getAllChats: () => Chat[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'chatStore';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ChatState>(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load chat state from localStorage:', error);
    }
    return { currentId: '', chats: {} };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save chat state to localStorage:', error);
    }
  }, [state]);

  const currentChat = state.currentId ? state.chats[state.currentId] : null;

  const generateSessionId = useCallback(() => {
    return String(Math.floor(1e9 + Math.random() * 9e9));
  }, []);

  const createNewChat = useCallback(() => {
    const sessionId = generateSessionId();
    const newChat: Chat = {
      sessionId,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: []
    };
    
    setState(prev => ({
      currentId: sessionId,
      chats: { ...prev.chats, [sessionId]: newChat }
    }));
    
    return sessionId;
  }, [generateSessionId]);

  const selectChat = useCallback((sessionId: string) => {
    setState(prev => ({ ...prev, currentId: sessionId }));
  }, []);

  const addMessage = useCallback((sessionId: string, message: Message) => {
    setState(prev => {
      const chat = prev.chats[sessionId];
      if (!chat) return prev;
      
      return {
        ...prev,
        chats: {
          ...prev.chats,
          [sessionId]: {
            ...chat,
            messages: [...chat.messages, message]
          }
        }
      };
    });
  }, []);

  const deleteChat = useCallback((sessionId: string) => {
    setState(prev => {
      const newChats = { ...prev.chats };
      delete newChats[sessionId];
      
      // If we're deleting the current chat, create a new one
      let newCurrentId = prev.currentId;
      if (prev.currentId === sessionId) {
        const newSessionId = generateSessionId();
        const newChat: Chat = {
          sessionId: newSessionId,
          title: 'New Chat',
          createdAt: new Date().toISOString(),
          messages: []
        };
        newChats[newSessionId] = newChat;
        newCurrentId = newSessionId;
      }
      
      return {
        currentId: newCurrentId,
        chats: newChats
      };
    });
  }, [generateSessionId]);

  const updateChatTitle = useCallback((sessionId: string, title: string) => {
    setState(prev => {
      const chat = prev.chats[sessionId];
      if (!chat) return prev;
      
      return {
        ...prev,
        chats: {
          ...prev.chats,
          [sessionId]: { ...chat, title: title.substring(0, 60) }
        }
      };
    });
  }, []);

  const getAllChats = useCallback(() => {
    return Object.values(state.chats).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.chats]);

  // Initialize with a chat if none exists
  useEffect(() => {
    if (Object.keys(state.chats).length === 0) {
      createNewChat();
    }
  }, [createNewChat, state.chats]);

  return (
    <ChatContext.Provider value={{
      state,
      currentChat,
      createNewChat,
      selectChat,
      addMessage,
      deleteChat,
      updateChatTitle,
      getAllChats
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};