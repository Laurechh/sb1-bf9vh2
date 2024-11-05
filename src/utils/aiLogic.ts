import { Message } from '../types';
import { getGeminiResponse } from './geminiAI';

export const generateResponse = async (input: string, messages: Message[]): Promise<string> => {
  try {
    const response = await getGeminiResponse(input, messages);
    return response;
  } catch (error) {
    console.error('Error generating response:', error);
    return "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
  }
};