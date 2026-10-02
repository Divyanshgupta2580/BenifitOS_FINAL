import React, { useState, useRef, useEffect } from 'react';
import { useAiChat, ChatMessage } from '../../hooks/useAiChat';
import { LightbulbIcon, ArrowRightIcon, AlertTriangleIcon } from '../../components/ui/Icons';
import { StructuredAiResponseRenderer } from '../../components/ai/StructuredAiResponseRenderer';
import { AppLayout } from '../../components/layout/AppLayout';

import { useLanguageStore } from '../../store/language.store';

interface Props {
  onBack?: () => void;
  onNavigateToSchemes?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
}

export const AiAssistantScreen: React.FC<Props> = ({
  onBack,
  onNavigateToSchemes,
  onNavigateToVault,
  onNavigateToApplications,
}) => {
  const { locale, setLocale } = useLanguageStore();
  const { messages, isLoading, sendMessage, retryLastMessage, clearChat, suggestedPrompts } = useAiChat();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHindi = locale === 'hi';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handlePromptSelect = (prompt: string) => {
    if (isLoading) return;
    sendMessage(prompt);
  };

  return (
    <AppLayout activeTab="copilot">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs font-semibold text-mint-400 hover:underline"
              >
                ← Back
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white font-heading leading-tight">
                {isHindi ? 'AI नागरिक सहायक' : 'AI Citizen Assistant'}
              </h1>
              <span className="text-[11px] text-emerald-400/80 block">
                {isHindi ? 'सत्यापित सरकारी कल्याणकारी मार्गदर्शन' : 'Official Digital Welfare Intelligence'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Segmented Control */}
            <div
              className="inline-flex items-center rounded-xl bg-[#080C0A] p-1 border border-[#1C3127]"
              role="group"
              aria-label={isHindi ? 'भाषा चयन' : 'Language selection'}
            >
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                  !isHindi
                    ? 'bg-[#0B3B2B] text-mint-300 border border-mint-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                aria-pressed={!isHindi}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLocale('hi')}
                className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                  isHindi
                    ? 'bg-[#0B3B2B] text-mint-300 border border-mint-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                aria-pressed={isHindi}
              >
                हिंदी
              </button>
            </div>
            <button
              onClick={clearChat}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/40 transition-colors"
            >
              {isHindi ? 'साफ़ करें' : 'Clear Chat'}
            </button>
          </div>
        </div>

        {/* Suggested Prompts Chips */}
        <div className="bg-[#0E1712] p-3.5 rounded-2xl border border-[#1C3127]/80 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Suggested Guidance Prompts:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptSelect(p)}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-full bg-forest-950/80 border border-[#1C3127] text-xs font-semibold text-mint-300 hover:text-white hover:border-mint-500/40 whitespace-nowrap transition-all flex items-center gap-1.5"
              >
                <LightbulbIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 bg-[#0E1712] rounded-2xl p-4 sm:p-5 border border-[#1C3127]/80 shadow-lg overflow-y-auto space-y-5 min-h-[360px] max-h-[500px] custom-scrollbar">
          {messages.map((item: ChatMessage) => {
            const isUser = item.sender === 'user';
            return (
              <div key={item.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`w-full ${
                    isUser
                      ? 'max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl bg-[#0B3B2B] text-white border border-mint-500/30 rounded-br-none text-sm ml-auto shadow-md'
                      : 'max-w-full p-4 sm:p-5 rounded-2xl bg-[#080C0A] border border-[#1C3127] rounded-bl-none shadow-md'
                  }`}
                >
                  {isUser ? (
                    <div>
                      <p className="whitespace-pre-wrap">{item.text}</p>
                      <div className="mt-1 text-right">
                        <span className="text-[10px] text-mint-300/80">{item.timestamp}</span>
                      </div>
                    </div>
                  ) : (
                    <StructuredAiResponseRenderer
                      content={item.text}
                      timestamp={item.timestamp}
                      onActionClick={(query) => sendMessage(query)}
                      onNavigateToSchemes={onNavigateToSchemes}
                      onNavigateToVault={onNavigateToVault}
                      onNavigateToApplications={onNavigateToApplications}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-mint-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs font-medium text-mint-200">
                  Synthesizing welfare guidance...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="bg-[#0E1712] p-3 rounded-2xl border border-[#1C3127]/80 shadow-xl flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your welfare question here..."
            disabled={isLoading}
            className="flex-1 bg-[#080C0A] border border-[#1C3127] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 sm:px-6 py-3 rounded-xl bg-mint-400 hover:bg-mint-300 disabled:opacity-50 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Send</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
};
