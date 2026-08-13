import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApiService, AiChatResponse } from '../services/ai.service';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  provider?: string;
  isError?: boolean;
}

export const SUGGESTED_PROMPTS = [
  'What welfare schemes am I eligible for?',
  'How do I apply for PM-Kisan Samman Nidhi?',
  'Which documents are required for Ration Card application?',
  'Explain the benefits of Ayushman Bharat Golden Card',
];

export const useAiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! I am your BenefitOS Citizen AI Assistant. How can I help you discover schemes or assist with your welfare applications today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'BenefitOS AI Core',
    },
  ]);
  const [lastPrompt, setLastPrompt] = useState<string>('');

  const chatMutation = useMutation<AiChatResponse, Error, { prompt: string; context?: Record<string, any> }>({
    mutationFn: (payload) => aiApiService.sendChatMessage(payload),
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider || 'BenefitOS AI',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error: Error) => {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Failed to receive response: ${error.message || 'Network communication error.'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const sendMessage = useCallback((promptText: string, context?: Record<string, any>) => {
    if (!promptText.trim()) return;

    const trimmedPrompt = promptText.trim();
    setLastPrompt(trimmedPrompt);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    chatMutation.mutate({ prompt: trimmedPrompt, context });
  }, [chatMutation]);

  const retryLastMessage = useCallback(() => {
    if (!lastPrompt) return;
    setMessages((prev) => prev.filter((m) => !m.isError));
    chatMutation.mutate({ prompt: lastPrompt });
  }, [lastPrompt, chatMutation]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How else may I assist you with citizen welfare services?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'BenefitOS AI Core',
      },
    ]);
  }, []);

  return {
    messages,
    isLoading: chatMutation.isPending,
    isError: chatMutation.isError,
    sendMessage,
    retryLastMessage,
    clearChat,
    suggestedPrompts: SUGGESTED_PROMPTS,
  };
};
