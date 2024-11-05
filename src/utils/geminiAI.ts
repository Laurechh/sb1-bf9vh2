import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../types';
import { systemPrompt } from './prompts';
import { MemoryManager } from './memoryManager';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'your_api_key_here') {
  throw new Error('Lütfen geçerli bir Gemini API anahtarı ekleyin. .env dosyasındaki VITE_GEMINI_API_KEY değerini güncelleyin.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_CONFIG = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
};

const formatMessagesForContext = (messages: Message[]): string => {
  return messages
    .map(msg => `${msg.role === 'user' ? 'Kullanıcı' : 'Lora'}: ${msg.content}`)
    .join('\n');
};

const formatHistoryForGemini = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
};

export const getGeminiResponse = async (input: string, messages: Message[]): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig: MODEL_CONFIG });
    
    MemoryManager.processInput(input);
    const memory = MemoryManager.getMemory();
    const recentMessages = messages.slice(-10);
    
    let context = systemPrompt;
    if (memory.name) {
      context += `\nKullanıcının adı: ${memory.name}`;
    }
    if (recentMessages.length > 0) {
      context += '\n\nÖnceki konuşma:\n' + formatMessagesForContext(recentMessages);
    }

    const chat = model.startChat({
      history: formatHistoryForGemini(recentMessages),
      generationConfig: MODEL_CONFIG,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('İstek zaman aşımına uğradı')), 30000);
    });

    const responsePromise = chat.sendMessage([
      { text: `${context}\n\nKullanıcı: ${input}\nLora:` }
    ]);

    const result = await Promise.race([responsePromise, timeoutPromise]);
    
    if ('response' in result) {
      const response = await result.response;
      const text = response.text().trim();
      return text.replace(/^Lora:\s*/i, '');
    }
    
    throw new Error('Geçersiz yanıt formatı');
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    if (!navigator.onLine) {
      throw new Error('İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.');
    }
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API anahtarı hatası. Lütfen sistem yöneticisiyle iletişime geçin.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }
      if (error.message.includes('network')) {
        throw new Error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.');
      }
      throw error;
    }
    
    throw new Error('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
  }
};