import React, { useState } from 'react';
import { PlusCircle, MessageSquare, Settings, X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { Chat, Theme } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: Theme;
  onThemeChange: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
  theme,
  onThemeChange,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className={`${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      } h-screen flex flex-col border-r relative`}>
        <button
          onClick={onToggle}
          className={`absolute -right-3 top-1/2 transform -translate-y-1/2 ${
            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
          } p-1 rounded-full border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} shadow-lg`}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {isOpen ? (
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <PlusCircle className="w-5 h-5" />
              Yeni Sohbet
            </button>
          ) : (
            <button
              onClick={onNewChat}
              className="w-full flex justify-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-opacity-80 transition-colors duration-200 ${
                chat.id === activeChatId
                  ? theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  : ''
              }`}
            >
              <button
                className="flex-1 flex items-center gap-2 text-left"
                onClick={() => onChatSelect(chat.id)}
              >
                <MessageSquare className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                {isOpen && <span className="text-sm truncate">{chat.title}</span>}
              </button>
              {isOpen && chat.id === activeChatId && (
                <button
                  onClick={() => onDeleteChat(chat.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={`relative p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center gap-2 ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors duration-200 ${!isOpen ? 'justify-center' : ''}`}
          >
            <Settings className="w-5 h-5" />
            {isOpen && <span>Ayarlar</span>}
          </button>

          {isSettingsOpen && (
            <div className={`absolute bottom-full left-0 w-48 mb-2 p-3 rounded-lg shadow-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            } ${!isOpen ? 'left-16' : 'left-4'}`}>
              <button
                onClick={onThemeChange}
                className="flex items-center gap-2 w-full hover:opacity-80"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>Açık Tema</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>Koyu Tema</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};