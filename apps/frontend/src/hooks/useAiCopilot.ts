import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApiService, ExplainRecommendationDto } from '../services/ai.service';
import { useLanguageStore } from '../store/language.store';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
}

export const AI_COPILOT_QUERY_KEY = ['aiCopilotHistory'];

export const getWelcomeMessage = (lang: 'en' | 'hi'): CopilotMessage => ({
  id: 'msg-welcome-1',
  sender: 'assistant',
  text:
    lang === 'hi'
      ? 'AI Citizen Copilot में आपका स्वागत है। मैं सत्यापित योजना और पात्रता जानकारी के आधार पर संक्षिप्त और स्पष्ट मार्गदर्शन प्रदान कर सकता हूँ।'
      : 'Welcome to AI Citizen Copilot. I can provide concise guidance based on verified scheme and eligibility information.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  sources: ['Verified scheme information'],
});

export const useAiCopilot = () => {
  const { locale, setLocale } = useLanguageStore();
  const currentLanguage: 'en' | 'hi' = locale === 'hi' ? 'hi' : 'en';

  const [messages, setMessages] = useState<CopilotMessage[]>([getWelcomeMessage(currentLanguage)]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastContext, setLastContext] = useState<Record<string, any> | undefined>(undefined);
  const [lastPrompt, setLastPrompt] = useState('');
  const activeAbortController = useRef<AbortController | null>(null);
  const activeRequestId = useRef<string>('');

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome-1') {
        return [getWelcomeMessage(currentLanguage)];
      }
      return prev;
    });
  }, [currentLanguage]);

  const cancelPending = useCallback(() => {
    if (activeAbortController.current) {
      activeAbortController.current.abort();
      activeAbortController.current = null;
    }
    setIsStreaming(false);
  }, []);

  const chatMutation = useMutation({
    mutationFn: async ({ prompt, context, requestId }: { prompt: string; context?: Record<string, any>; requestId: string }) => {
      const controller = new AbortController();
      cancelPending();
      activeAbortController.current = controller;
      activeRequestId.current = requestId;
      setIsStreaming(true);
      const res = await aiApiService.sendChatMessage({ prompt, context, language: currentLanguage });
      return { ...res, requestId };
    },
    onSuccess: (data) => {
      if (activeRequestId.current !== data.requestId) {
        return;
      }
      setIsStreaming(false);
      const assistantMsg: CopilotMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || ['Verified scheme information'],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      activeAbortController.current = null;
    },
    onError: () => {
      setIsStreaming(false);
      const errorMsg: CopilotMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text:
          currentLanguage === 'hi'
            ? 'हम अभी मार्गदर्शन तैयार नहीं कर सके। कृपया पुनः प्रयास करें।'
            : 'We could not generate the guidance right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['System Status'],
      };
      setMessages((prev) => [...prev, errorMsg]);
      activeAbortController.current = null;
    },
  });

  const sendMessage = useCallback(
    async (promptText: string, context?: Record<string, any>) => {
      if (!promptText.trim()) return;

      const trimmed = promptText.trim();
      setLastPrompt(trimmed);
      setLastContext(context);

      const userMsg: CopilotMessage = {
        id: `msg-user-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      await chatMutation.mutateAsync({
        prompt: trimmed,
        context,
        requestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
    },
    [chatMutation]
  );

  const explainRecommendation = useCallback(
    async (dto: ExplainRecommendationDto) => {
      const userMsg: CopilotMessage = {
        id: `msg-rec-${Date.now()}`,
        sender: 'user',
        text: currentLanguage === 'hi' ? `${dto.schemeTitle} की पात्रता समझाएँ` : `Explain eligibility for ${dto.schemeTitle}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      try {
        const res = await aiApiService.explainRecommendation({ ...dto, language: currentLanguage });
        setIsStreaming(false);
        const assistantMsg: CopilotMessage = {
          id: `msg-exp-${Date.now()}`,
          sender: 'assistant',
          text: res.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: res.sources || ['Verified eligibility engine'],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setIsStreaming(false);
      }
    },
    [currentLanguage]
  );

  const clearMessages = useCallback(() => {
    cancelPending();
    setMessages([getWelcomeMessage(currentLanguage)]);
  }, [cancelPending, currentLanguage]);

  const setLanguageExplicit = useCallback(
    async (lang: 'en' | 'hi') => {
      cancelPending();
      await setLocale(lang);
    },
    [cancelPending, setLocale]
  );

  return {
    messages,
    sendMessage,
    explainRecommendation,
    isLoading: chatMutation.isPending || isStreaming,
    isError: chatMutation.isError,
    clearMessages,
    language: currentLanguage,
    setLanguageExplicit,
    exportHistory: () => aiApiService.exportHistory(messages),
    cancelPending,
    retryLast: () => {
      if (lastPrompt) {
        sendMessage(lastPrompt, lastContext);
      }
    },
  };
};
