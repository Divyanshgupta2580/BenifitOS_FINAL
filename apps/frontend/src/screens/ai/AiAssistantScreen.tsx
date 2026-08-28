import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAiChat, ChatMessage } from '../../hooks/useAiChat';
import { LightbulbIcon, BotIcon, RefreshIcon } from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { StructuredAiResponseRenderer } from '../../components/ai/StructuredAiResponseRenderer';

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
  const { messages, isLoading, sendMessage, retryLastMessage, clearChat, suggestedPrompts } = useAiChat();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
                ← Back
              </button>
            )}
            <div>
              <h1 className="text-base font-bold text-blue-900 dark:text-blue-100 leading-tight">BenefitOS AI Citizen Copilot</h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Official Digital Welfare Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={clearChat}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <main className="max-w-4xl w-full mx-auto flex-1 px-4 py-6 flex flex-col justify-between space-y-4">
        {/* Suggested Prompts Chips */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Suggested Guidance Prompts:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptSelect(p)}
                disabled={isLoading}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-900 dark:hover:text-blue-300 whitespace-nowrap transition-colors flex items-center gap-1.5"
              >
                <LightbulbIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto space-y-5 max-h-[520px]">
          {messages.map((item: ChatMessage) => {
            const isUser = item.sender === 'user';
            return (
              <div key={item.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`w-full ${
                    isUser
                      ? 'max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl bg-blue-900 dark:bg-blue-700 text-white border border-blue-900 dark:border-blue-700 rounded-br-none shadow-xs text-sm leading-relaxed ml-auto'
                      : 'max-w-full p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <div>
                      <p className="whitespace-pre-wrap">{item.text}</p>
                      <div className="mt-1 text-right">
                        <span className="text-[10px] text-blue-200">{item.timestamp}</span>
                      </div>
                    </div>
                  ) : item.isError ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                        {item.text}
                      </p>
                      <button
                        onClick={retryLastMessage}
                        className="text-xs font-bold text-rose-700 dark:text-rose-400 underline flex items-center gap-1"
                      >
                        <RefreshIcon className="w-3.5 h-3.5" />
                        <span>Retry Request</span>
                      </button>
                    </div>
                  ) : (
                    <StructuredAiResponseRenderer
                      content={item.text}
                      sources={['Government Database', 'Citizen Profile']}
                      timestamp={item.timestamp}
                      onActionClick={(actionQuery) => sendMessage(actionQuery)}
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
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center gap-3">
                <svg className="animate-spin h-4 w-4 text-blue-900 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 animate-pulse">
                  BenefitOS AI is analyzing citizen context...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Bar */}
        <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-3 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI about schemes, documents, or eligibility..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850"
          />
          <Button
            type="submit"
            title="Send"
            isLoading={isLoading}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-2.5 font-bold"
          />
        </form>
      </main>
    </div>
  );
};
