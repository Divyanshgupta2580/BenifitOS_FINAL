import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApiService, ExplainRecommendationDto } from '../services/ai.service';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  provider?: string;
}

export const AI_COPILOT_QUERY_KEY = ['aiCopilotHistory'];

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-welcome-1',
    sender: 'assistant',
    text: 'Namaste! I am your BenefitOS AI Citizen Copilot. I have loaded your verified citizen profile, uploaded documents, OCR records, and government service links. How can I assist your welfare journey today?',
    timestamp: '10:00 AM',
    sources: ['Government Database', 'Citizen Profile'],
    provider: 'BenefitOS AI',
  },
];

export const useAiCopilot = () => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async ({ prompt, context }: { prompt: string; context?: Record<string, any> }) => {
      setIsStreaming(true);
      const res = await aiApiService.sendChatMessage({ prompt, context, language });
      setIsStreaming(false);
      return res;
    },
    onSuccess: (data, variables) => {
      const assistantMsg: CopilotMessage = {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || ['Government Database', 'Recommendation Engine'],
        provider: data.provider || 'BenefitOS AI',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    },
    onError: (error: any) => {
      setIsStreaming(false);
      const errorMsg: CopilotMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary connection issue. Please check your network and tap Retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['System Exception'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const sendMessage = useCallback(
    async (promptText: string, context?: Record<string, any>) => {
      if (!promptText.trim()) return;

      const userMsg: CopilotMessage = {
        id: 'msg-user-' + Date.now(),
        sender: 'user',
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      await chatMutation.mutateAsync({ prompt: promptText, context });
    },
    [chatMutation]
  );

  const explainRecommendation = useCallback(
    async (dto: ExplainRecommendationDto) => {
      const userMsg: CopilotMessage = {
        id: 'msg-rec-' + Date.now(),
        sender: 'user',
        text: `Explain match criteria for ${dto.schemeTitle}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      try {
        const res = await aiApiService.explainRecommendation({ ...dto, language });
        setIsStreaming(false);
        const assistantMsg: CopilotMessage = {
          id: 'msg-exp-' + Date.now(),
          sender: 'assistant',
          text: res.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: res.sources || ['Recommendation Engine', 'Government Database'],
          provider: 'BenefitOS AI',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setIsStreaming(false);
      }
    },
    [language]
  );

  const clearMessages = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const toggleSpeech = useCallback(() => {
    setIsSpeechEnabled((prev) => !prev);
  }, []);

  const exportHistory = useCallback(() => {
    return aiApiService.exportHistory(messages);
  }, [messages]);

  return {
    messages,
    sendMessage,
    explainRecommendation,
    isLoading: chatMutation.isPending || isStreaming,
    isError: chatMutation.isError,
    clearMessages,
    language,
    toggleLanguage,
    isSpeechEnabled,
    toggleSpeech,
    exportHistory,
    retryLast: () => {
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
      if (lastUserMsg) {
        sendMessage(lastUserMsg.text);
      }
    },
  };
};
