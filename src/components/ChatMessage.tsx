import React, { useState } from 'react';
import { Bot, User, Copy, Check, Flag, X } from 'lucide-react';
import { Message, Theme } from '../types';

interface ChatMessageProps {
  message: Message;
  theme: Theme;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, theme }) => {
  const isBot = message.role === 'assistant';
  const [copied, setCopied] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const copyToClipboard = async (text: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(blockId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setIsSubmitting(true);
    try {
      const emailBody = `
Bildirilen mesaj:
${message.content}

Bildiri açıklaması:
${reportReason}
      `;

      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_h1l8bc9',
          template_id: 'template_4a8ym8i',
          user_id: 'wEh3B3VmEpfleK_zJ', // EmailJS user ID
          template_params: {
            to_email: 'loralabsnet@gmail.com',
            message: emailBody,
            subject: 'Lora Message Report',
          },
        }),
      });

      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason('');
      }, 2000);
    } catch (error) {
      console.error('Failed to send report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMessage = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        const language = code.split('\n')[0].trim();
        const actualCode = code.substring(code.indexOf('\n') + 1).trim();
        const blockId = `code-block-${index}`;

        return (
          <div 
            key={blockId}
            className={`my-4 rounded-lg overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
              <span className="text-gray-400 text-sm">{language || 'code'}</span>
              <button
                onClick={() => copyToClipboard(actualCode, blockId)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
                title="Copy code"
              >
                {copied === blockId ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono text-gray-300">{actualCode}</code>
            </pre>
          </div>
        );
      }

      const boldFormatted = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const italicFormatted = boldFormatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <p 
          key={index}
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: italicFormatted }}
        />
      );
    });
  };

  return (
    <div className="relative">
      <div className={`flex items-start gap-3 rounded-lg p-4 ${
        theme === 'dark'
          ? isBot ? 'bg-gray-800' : 'bg-gray-700'
          : isBot ? 'bg-gray-100' : 'bg-blue-50'
      }`}>
        {isBot ? (
          <Bot className="w-6 h-6 mt-1" />
        ) : (
          <User className="w-6 h-6 mt-1" />
        )}
        <div className="flex-1">
          {formatMessage(message.content)}
        </div>
        {isBot && (
          <button
            onClick={() => setShowReportModal(true)}
            className="text-gray-400 hover:text-red-400 transition-colors duration-200"
            title="Report message"
          >
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-semibold mb-4">Mesajı Bildir</h3>
            
            {reportSuccess ? (
              <div className="text-green-500 text-center py-4">
                Bildiriminiz başarıyla gönderildi!
              </div>
            ) : (
              <form onSubmit={handleReport}>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Bu mesajı neden bildiriyorsunuz?"
                  className={`w-full p-3 rounded-lg mb-4 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !reportReason.trim()}
                  className={`w-full py-2 px-4 rounded-lg ${
                    isSubmitting
                      ? 'bg-gray-500'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition-colors duration-200`}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Bildir'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};