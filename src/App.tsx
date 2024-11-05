import React, { useState, useRef, useEffect } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { Message, Chat, Theme } from './types';
import { generateResponse } from './utils/aiLogic';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import { loadChats, saveChats, loadActiveChat, saveActiveChat, loadTheme, saveTheme } from './utils/storage';

function App() {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const savedId = loadActiveChat();
    return savedId && chats.some(chat => chat.id === savedId) ? savedId : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = activeChatId ? chats.find(chat => chat.id === activeChatId) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      saveActiveChat(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    saveTheme(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
    return newChat.id;
  };

  const updateChatTitle = (chatId: string, message: string) => {
    const title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ));
  };

  const handleSendMessage = async (message: string) => {
    const chatId = activeChatId || createNewChat();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    const newMessage: Message = { role: 'user', content: message };

    // Immediately update UI with user message
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastUpdated: new Date()
        };
      }
      return chat;
    }));

    try {
      const chat = chats.find(c => c.id === chatId);
      if (chat && chat.messages.length === 0) {
        updateChatTitle(chatId, message);
      }

      const response = await generateResponse(message, activeChat?.messages || []);
      
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, { role: 'assistant', content: response }],
            lastUpdated: new Date()
          };
        }
        return chat;
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onChatSelect={setActiveChatId}
        onNewChat={createNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        theme={theme}
        onThemeChange={toggleTheme}
      />

      <div className="flex-1 flex flex-col h-screen">
        <header className={`py-6 px-4 text-center border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Bot className="w-8 h-8" />
            Lora Alpha 0.53
          </h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Lora hatalar yapabilir. Kesin olarak doğru bir yanıt için araştırma yapmayı ihmal etmeyin.
          </p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loralabs 2024
          </p>          
        </header>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
          {activeChat?.messages.map((message, index) => (
            <ChatMessage key={index} message={message} theme={theme} />
          ))}
          {isLoading && (
            <div className={`flex items-center gap-3 rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Bot className="w-6 h-6" />
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          {error && (
            <div className={`p-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100`}>
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} theme={theme} />
        </div>
      </div>
    </div>
  );
}

export default App;