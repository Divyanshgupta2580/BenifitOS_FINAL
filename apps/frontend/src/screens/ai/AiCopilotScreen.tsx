import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAiCopilot, CopilotMessage } from '../../hooks/useAiCopilot';
import { StructuredAiResponseRenderer } from '../../components/ai/StructuredAiResponseRenderer';
import { GlobeIcon, CheckCircleIcon, AlertTriangleIcon } from '../../components/ui/Icons';
import { wsService, WsConnectionStatus } from '../../services/websocket-client';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
              {isHindi ? 'वापस जाएँ' : 'Go back'}
            </button>
            <h1 className="text-base font-bold text-blue-900 dark:text-blue-100">{isHindi ? 'AI नागरिक कोपायलट' : 'AI Citizen Copilot'}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isHindi
                ? 'सत्यापित योजना और पात्रता डेटा पर आधारित नागरिक सहायता सेवा'
                : 'Citizen assistance service based on verified scheme and eligibility data'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700" role="group" aria-label={isHindi ? 'भाषा चयन' : 'Language selector'}>
              <button
                type="button"
                onClick={() => setLanguageExplicit('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold ${language === 'en' ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}
                aria-pressed={language === 'en'}
                aria-label="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguageExplicit('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold ${language === 'hi' ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}
                aria-pressed={language === 'hi'}
                aria-label="Hindi"
              >
                हिंदी
              </button>
            </div>

            <button onClick={handleExport} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700">
              {isHindi ? 'निर्यात' : 'Export'}
            </button>
            <button onClick={clearMessages} className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {isHindi ? 'इतिहास साफ़ करें' : 'Clear history'}
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <GlobeIcon className="w-3.5 h-3.5" />
            <span>{isHindi ? 'भाषा' : 'Language'}: {language === 'hi' ? 'हिंदी' : 'English'}</span>
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${connectionStatus === 'CONNECTED' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30' : 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/30'}`}>
            <CheckCircleIcon className="w-3.5 h-3.5" />
            <span>{isHindi ? 'स्थिति' : 'Status'}: {statusText(connectionStatus, isHindi)}</span>
          </span>
          {schemeTitle && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/30">
              <span>{isHindi ? 'वर्तमान योजना' : 'Current scheme'}: {schemeTitle}</span>
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto flex-1 px-4 py-5 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex gap-2 overflow-x-auto">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-300 whitespace-nowrap"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto space-y-5 max-h-[560px]" aria-live="polite">
          {messages.map((item: CopilotMessage) => {
            const isUser = item.sender === 'user';
            return (
              <div key={item.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`w-full ${
                    isUser
                      ? 'max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl bg-blue-900 text-white rounded-br-none text-sm ml-auto'
                      : 'max-w-full p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                  }`}
                >
                  {isUser ? (
                    <div>
                      <p className="whitespace-pre-wrap">{item.text}</p>
                      <div className="mt-1 text-right">
                        <span className="text-[10px] text-blue-200">{item.timestamp}</span>
                      </div>
                    </div>
                  ) : (
                    <StructuredAiResponseRenderer
                      content={item.text}
                      sources={item.sources || ['Verified scheme information']}
                      timestamp={item.timestamp}
                      language={language}
                      onActionClick={(actionQuery) => sendMessage(actionQuery, { ...requestContext, useCase: 'general' })}
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
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {isHindi ? 'मार्गदर्शन तैयार किया जा रहा है...' : 'Preparing your guidance...'}
                </span>
              </div>
            </div>
          )}

          {isError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex justify-between items-center text-xs font-semibold text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-1.5">
                <AlertTriangleIcon className="w-4 h-4" />
                <span>{isHindi ? 'मार्गदर्शन अभी उपलब्ध नहीं है। कृपया पुनः प्रयास करें।' : 'Guidance is not available right now. Please retry.'}</span>
              </div>
              <button onClick={retryLast} className="underline font-bold ml-2 shrink-0">
                {isHindi ? 'पुनः प्रयास करें' : 'Retry'}
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-2 items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isHindi
                ? 'अपना प्रश्न लिखें: पात्रता, दस्तावेज़, आवेदन या लाभ'
                : 'Enter your question: eligibility, documents, application, or benefits'
            }
            disabled={isLoading}
            aria-label={isHindi ? 'प्रश्न इनपुट' : 'Question input'}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Button
            type="submit"
            title={isHindi ? 'भेजें' : 'Send'}
            isLoading={isLoading}
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 sm:px-6 py-2.5 font-bold shrink-0"
          />
        </form>
      </main>
    </div>
  );
};
