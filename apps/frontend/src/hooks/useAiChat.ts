import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApiService, AiChatResponse } from '../services/ai.service';
import { useLanguageStore } from '../store/language.store';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  provider?: string;
  isError?: boolean;
}

export const SUGGESTED_PROMPTS_EN = [
  'What welfare schemes am I eligible for right now?',
  'Which schemes will I become eligible for in the future?',
  'Which documents are required for my eligible applications?',
  'Explain the benefits of my recommended schemes',
];

export const SUGGESTED_PROMPTS_HI = [
  'मैं अभी किन सरकारी योजनाओं के लिए पात्र हूँ?',
  'मैं भविष्य में किन योजनाओं के लिए पात्र बनूँगा?',
  'मेरे पात्र आवेदनों के लिए कौन से दस्तावेज़ आवश्यक हैं?',
  'मेरी अनुशंसित योजनाओं के लाभ समझाएं',
];

export const getAssistantWelcomeMessage = (lang: string): ChatMessage => ({
  id: 'welcome-1',
  sender: 'assistant',
  text:
    lang === 'hi'
      ? 'BenefitOS में आपका स्वागत है।\n\nमैं आपके प्रोफ़ाइल में उपलब्ध जानकारी के आधार पर सरकारी कल्याण योजनाएँ खोजने, पात्रता समझने और आवेदन प्रक्रियाओं में सहायता कर सकता हूँ।\n\nआज आप किस विषय में सहायता चाहते हैं?'
      : 'Welcome to BenefitOS.\n\nI can help you discover welfare schemes, understand eligibility requirements, prepare documents, and navigate government services using the information available in your profile.\n\nWhat would you like help with today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  provider: 'BenefitOS AI',
});

export const useAiChat = () => {
  const { locale } = useLanguageStore();
  const currentLanguage: 'en' | 'hi' = locale === 'hi' ? 'hi' : 'en';

  const [messages, setMessages] = useState<ChatMessage[]>([getAssistantWelcomeMessage(currentLanguage)]);
  const [lastPrompt, setLastPrompt] = useState<string>('');

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-1') {
        return [getAssistantWelcomeMessage(currentLanguage)];
      }
      return prev;
    });
  }, [currentLanguage]);

  const chatMutation = useMutation<AiChatResponse, Error, { prompt: string; context?: Record<string, any> }>({
    mutationFn: (payload) => aiApiService.sendChatMessage({ ...payload, language: currentLanguage }),
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'BenefitOS AI',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          currentLanguage === 'hi'
            ? 'हम अभी आपका अनुरोध संसाधित करने में असमर्थ हैं। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।'
            : 'We could not prepare your response right now. Please verify your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const sendMessage = useCallback(
    (promptText: string, context?: Record<string, any>) => {
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
    },
    [chatMutation]
  );

  const retryLastMessage = useCallback(() => {
    if (!lastPrompt) return;
    setMessages((prev) => prev.filter((m) => !m.isError));
    chatMutation.mutate({ prompt: lastPrompt });
  }, [lastPrompt, chatMutation]);

  const clearChat = useCallback(() => {
    setMessages([getAssistantWelcomeMessage(currentLanguage)]);
  }, [currentLanguage]);

  return {
    messages,
    isLoading: chatMutation.isPending,
    isError: chatMutation.isError,
    sendMessage,
    retryLastMessage,
    clearChat,
    suggestedPrompts: currentLanguage === 'hi' ? SUGGESTED_PROMPTS_HI : SUGGESTED_PROMPTS_EN,
  };
};
