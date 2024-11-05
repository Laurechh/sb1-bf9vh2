import { Chat, Theme } from '../types';

const CHATS_STORAGE_KEY = 'chats';
const ACTIVE_CHAT_KEY = 'active_chat_id';
const THEME_KEY = 'theme';

export const saveChats = (chats: Chat[]): void => {
  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
};

export const loadChats = (): Chat[] => {
  try {
    const stored = localStorage.getItem(CHATS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading chats:', error);
    return [];
  }
};

export const saveActiveChat = (chatId: string): void => {
  localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
};

export const loadActiveChat = (): string | null => {
  return localStorage.getItem(ACTIVE_CHAT_KEY);
};

export const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const loadTheme = (): Theme => {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'dark';
};

export const clearStorage = (): void => {
  localStorage.removeItem(CHATS_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_CHAT_KEY);
  localStorage.removeItem(THEME_KEY);
};