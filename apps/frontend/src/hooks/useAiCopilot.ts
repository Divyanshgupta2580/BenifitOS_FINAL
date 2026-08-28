import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApiService, ExplainRecommendationDto } from '../services/ai.service';
import { useLanguageStore } from '../store/language.store';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  provider?: string;
}

export const AI_COPILOT_QUERY_KEY = ['aiCopilotHistory'];

export const getWelcomeMessage = (lang: 'en' | 'hi'): CopilotMessage => ({
  id: 'msg-welcome-1',
  sender: 'assistant',
  text:
    lang === 'hi'
      ? 'BenefitOS में आपका स्वागत है।\n\nमैं आपके प्रोफ़ाइल में उपलब्ध जानकारी के आधार पर सरकारी कल्याण योजनाएँ खोजने, पात्रता समझने, आवश्यक दस्तावेज़ तैयार करने और सरकारी सेवाओं तक पहुँचने में सहायता कर सकता हूँ।\n\nआज आप किस विषय में सहायता चाहते हैं?'
      : 'Welcome to BenefitOS.\n\nI can help you discover welfare schemes, understand eligibility requirements, prepare documents, and navigate government services using the information available in your profile.\n\nWhat would you like help with today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  sources: ['Government Scheme Database', 'Citizen Profile'],
  provider: 'BenefitOS AI',
});

export const useAiCopilot = () => {
  const queryClient = useQueryClient();
  const { locale, setLocale } = useLanguageStore();
  const currentLanguage: 'en' | 'hi' = locale === 'hi' ? 'hi' : 'en';

  const [messages, setMessages] = useState<CopilotMessage[]>([getWelcomeMessage(currentLanguage)]);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // If conversation only contains welcome message, auto-update when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome-1') {
        return [getWelcomeMessage(currentLanguage)];
      }
      return prev;
    });
  }, [currentLanguage]);

  const chatMutation = useMutation({
    mutationFn: async ({ prompt, context }: { prompt: string; context?: Record<string, any> }) => {
      setIsStreaming(true);
      const res = await aiApiService.sendChatMessage({ prompt, context, language: currentLanguage });
      setIsStreaming(false);
      return res;
    },
    onSuccess: (data) => {
      const assistantMsg: CopilotMessage = {
        id: 'msg-' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || ['Government Scheme Database', 'Citizen Profile'],
        provider: 'BenefitOS AI',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    },
    onError: () => {
      setIsStreaming(false);
      const errorMsg: CopilotMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text:
          currentLanguage === 'hi'
            ? 'हम अभी आपका अनुरोध संसाधित करने में असमर्थ हैं। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।'
            : 'We could not prepare your response right now. Please verify your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['System Status'],
        provider: 'BenefitOS AI',
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
        text: currentLanguage === 'hi' ? `${dto.schemeTitle} के लिए पात्रता मानदंड समझाएं` : `Explain match criteria for ${dto.schemeTitle}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      try {
        const res = await aiApiService.explainRecommendation({ ...dto, language: currentLanguage });
        setIsStreaming(false);
        const assistantMsg: CopilotMessage = {
          id: 'msg-exp-' + Date.now(),
          sender: 'assistant',
          text: res.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: res.sources || ['Recommendation Engine', 'Government Scheme Database'],
          provider: 'BenefitOS AI',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setIsStreaming(false);
      }
    },
    [currentLanguage]
  );

  const clearMessages = useCallback(() => {
    setMessages([getWelcomeMessage(currentLanguage)]);
  }, [currentLanguage]);

  const toggleLanguage = useCallback(async () => {
    const nextLocale = currentLanguage === 'en' ? 'hi' : 'en';
    await setLocale(nextLocale);
  }, [currentLanguage, setLocale]);

  const setLanguageExplicit = useCallback(
    async (lang: 'en' | 'hi') => {
      await setLocale(lang);
    },
    [setLocale]
  );

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
    language: currentLanguage,
    toggleLanguage,
    setLanguageExplicit,
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
