import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Theme } from '../types';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  theme: Theme;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, theme }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSend(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className={`py-4 border-t ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bir mesaj yazın..."
          className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'dark'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors duration-200 text-white"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};