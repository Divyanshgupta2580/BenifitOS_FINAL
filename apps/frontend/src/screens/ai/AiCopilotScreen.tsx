import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAiCopilot, CopilotMessage } from '../../hooks/useAiCopilot';
import { StructuredAiResponseRenderer } from '../../components/ai/StructuredAiResponseRenderer';
import { GlobeIcon, CheckCircle2Icon, AlertTriangleIcon, SparklesIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { wsService, WsConnectionStatus } from '../../services/websocket-client';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  onBack: () => void;
  onNavigateToSchemes?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
  onNavigateToGovernmentServices?: () => void;
}

const QUICK_ACTIONS = {
  en: [
    { label: 'Check my eligible schemes', query: 'What schemes am I eligible for?', useCase: 'eligible-schemes' },
    { label: 'Explain why I am eligible', query: 'Explain why I am eligible for this scheme.', useCase: 'eligibility-explanation' },
    { label: 'What documents do I need?', query: 'What documents do I need?', useCase: 'documents' },
    { label: 'How do I apply?', query: 'How do I apply for this scheme?', useCase: 'application-steps' },
    { label: 'Explain this scheme', query: 'Explain this scheme.', useCase: 'scheme-explanation' },
    { label: 'What am I missing?', query: 'What profile information is missing for accurate guidance?', useCase: 'missing-requirements' },
    { label: 'Help me understand my benefits', query: 'Help me understand my verified benefits.', useCase: 'general' },
  ],
  hi: [
    { label: 'मेरी पात्र योजनाएँ बताएं', query: 'मैं किन योजनाओं के लिए पात्र हूँ?', useCase: 'eligible-schemes' },
    { label: 'मैं पात्र क्यों हूँ समझाएं', query: 'मैं इस योजना के लिए पात्र क्यों हूँ समझाएं।', useCase: 'eligibility-explanation' },
    { label: 'कौन से दस्तावेज़ चाहिए?', query: 'मुझे कौन से दस्तावेज़ चाहिए?', useCase: 'documents' },
    { label: 'आवेदन कैसे करें?', query: 'मैं इस योजना के लिए आवेदन कैसे करूँ?', useCase: 'application-steps' },
    { label: 'इस योजना की जानकारी दें', query: 'इस योजना की जानकारी दें।', useCase: 'scheme-explanation' },
    { label: 'क्या जानकारी अधूरी है?', query: 'सटीक मार्गदर्शन के लिए मेरी कौन सी जानकारी अधूरी है?', useCase: 'missing-requirements' },
    { label: 'मेरे लाभ समझाएं', query: 'मेरे सत्यापित लाभ समझाएं।', useCase: 'general' },
  ],
};

const statusText = (status: WsConnectionStatus, isHindi: boolean) => {
  if (status === 'CONNECTED') return isHindi ? 'कनेक्टेड' : 'Connected';
  if (status === 'CONNECTING') return isHindi ? 'कनेक्ट हो रहा है' : 'Connecting';
  if (status === 'ERROR') return isHindi ? 'कनेक्शन समस्या' : 'Connection issue';
  return isHindi ? 'ऑफलाइन मोड' : 'Offline mode';
};

export const AiCopilotScreen: React.FC<Props> = ({
  onBack,
  onNavigateToSchemes,
  onNavigateToVault,
  onNavigateToApplications,
}) => {
  const {
    messages,
    sendMessage,
    isLoading,
    isError,
    clearMessages,
    language,
    setLanguageExplicit,
    exportHistory,
    retryLast,
    cancelPending,
  } = useAiCopilot();

  const [searchParams] = useSearchParams();
  const schemeId = searchParams.get('schemeId') || undefined;
  const schemeTitle = searchParams.get('schemeTitle') || undefined;

  const [inputQuery, setInputQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>('DISCONNECTED');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHindi = language === 'hi';
  const quickActions = QUICK_ACTIONS[isHindi ? 'hi' : 'en'];

  useEffect(() => {
    const unsubscribe = wsService.subscribeStatus(setConnectionStatus);
    wsService.connect().catch(() => undefined);
    return unsubscribe;
  }, []);

  useEffect(() => {
    cancelPending();
  }, [schemeId, schemeTitle, cancelPending]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const requestContext = useMemo(
    () => ({
      schemeId,
      schemeTitle,
    }),
    [schemeId, schemeTitle]
  );

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const query = inputQuery.trim();
    setInputQuery('');
    await sendMessage(query, { ...requestContext, useCase: 'general' });
  };

  const handleQuickAction = async (action: { label: string; query: string; useCase: string }) => {
    if (isLoading) return;
    await sendMessage(action.query, { ...requestContext, useCase: action.useCase });
  };

  const handleExport = () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-copilot-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout activeTab="copilot">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex-1 flex flex-col gap-4">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C3127]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/90 border border-emerald-500/40 flex items-center justify-center text-mint-400 shadow-xs">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                {isHindi ? 'AI नागरिक कोपायलट' : 'AI Citizen Copilot'}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isHindi
                ? 'सत्यापित योजना और पात्रता डेटा पर आधारित नागरिक कल्याण सहायता'
                : 'Intelligent welfare advisor powered by deterministic verified scheme data'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Segmented Control */}
            <div
              className="inline-flex items-center rounded-xl bg-[#080C0A] p-1 border border-[#1C3127]"
              role="group"
              aria-label={isHindi ? 'भाषा चयन' : 'Language selection'}
            >
              <button
                type="button"
                onClick={() => setLanguageExplicit('en')}
                className={`min-h-[34px] px-3.5 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-mint-400 ${
                  language === 'en'
                    ? 'bg-[#0B3B2B] text-mint-300 border border-mint-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                aria-pressed={language === 'en'}
                aria-label="Switch to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguageExplicit('hi')}
                className={`min-h-[34px] px-3.5 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-mint-400 ${
                  language === 'hi'
                    ? 'bg-[#0B3B2B] text-mint-300 border border-mint-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
                aria-pressed={language === 'hi'}
                aria-label="हिंदी भाषा चुनें"
              >
                हिंदी
              </button>
            </div>

            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-xl bg-[#0E1712] text-xs font-semibold text-slate-300 hover:text-white border border-[#1C3127] hover:border-forest-700 transition-colors"
            >
              {isHindi ? 'निर्यात' : 'Export'}
            </button>
            <button
              onClick={clearMessages}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 text-xs font-semibold text-rose-300 hover:text-rose-200 border border-rose-900/60 transition-colors"
            >
              {isHindi ? 'साफ़ करें' : 'Clear'}
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#1C3127] bg-[#0E1712] text-slate-300">
            <GlobeIcon className="w-3.5 h-3.5 text-mint-400" />
            <span>{isHindi ? 'भाषा' : 'Language'}: {language === 'hi' ? 'हिंदी' : 'English'}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              connectionStatus === 'CONNECTED'
                ? 'border-emerald-500/30 text-mint-300 bg-emerald-950/60'
                : 'border-amber-500/30 text-amber-300 bg-amber-950/60'
            }`}
          >
            <CheckCircle2Icon className="w-3.5 h-3.5" />
            <span>{isHindi ? 'स्थिति' : 'Status'}: {statusText(connectionStatus, isHindi)}</span>
          </span>
          {schemeTitle && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-sky-500/30 text-sky-300 bg-sky-950/60">
              <span>{isHindi ? 'वर्तमान योजना' : 'Context'}: {schemeTitle}</span>
            </span>
          )}
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="bg-[#0E1712] p-3 rounded-2xl border border-[#1C3127]/80 shadow-md flex gap-2 overflow-x-auto custom-scrollbar">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-full bg-forest-950/80 border border-[#1C3127] hover:border-mint-500/40 text-xs font-semibold text-mint-300 hover:text-white whitespace-nowrap transition-all"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Messages Stream Container */}
        <div
          className="flex-1 bg-[#0E1712] rounded-2xl p-4 sm:p-5 border border-[#1C3127]/80 shadow-lg overflow-y-auto space-y-5 min-h-[380px] max-h-[520px] custom-scrollbar"
          aria-live="polite"
        >
          {messages.map((item: CopilotMessage) => {
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
                      sources={item.sources || ['Verified scheme information']}
                      timestamp={item.timestamp}
                      language={language}
                      onActionClick={(actionQuery) =>
                        sendMessage(actionQuery, { ...requestContext, useCase: 'general' })
                      }
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
                <svg
                  className="animate-spin h-5 w-5 text-mint-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-xs font-medium text-mint-200">
                  {isHindi ? 'मार्गदर्शन तैयार किया जा रहा है...' : 'Synthesizing verified guidance...'}
                </span>
              </div>
            </div>
          )}

          {isError && (
            <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl flex justify-between items-center text-xs font-semibold text-rose-300">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4" />
                <span>
                  {isHindi
                    ? 'मार्गदर्शन अभी उपलब्ध नहीं है। कृपया पुनः प्रयास करें।'
                    : 'Guidance is temporarily unavailable. Please retry.'}
                </span>
              </div>
              <button onClick={retryLast} className="underline font-bold ml-2 shrink-0 hover:text-white">
                {isHindi ? 'पुनः प्रयास करें' : 'Retry'}
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSend}
          className="bg-[#0E1712] p-3 rounded-2xl border border-[#1C3127]/80 shadow-xl flex gap-2 items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isHindi
                ? 'अपना प्रश्न लिखें: पात्रता, दस्तावेज़, आवेदन या लाभ'
                : 'Ask anything about welfare eligibility, required documents, or application steps...'
            }
            disabled={isLoading}
            aria-label={isHindi ? 'प्रश्न इनपुट' : 'Question input'}
            className="flex-1 bg-[#080C0A] border border-[#1C3127] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500 transition-all"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 sm:px-6 py-3 rounded-xl bg-mint-400 hover:bg-mint-300 disabled:opacity-50 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>{isHindi ? 'भेजें' : 'Send'}</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
};
