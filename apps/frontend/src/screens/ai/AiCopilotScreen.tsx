import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAiCopilot, CopilotMessage } from '../../hooks/useAiCopilot';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
  onNavigateToSchemes?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
  onNavigateToGovernmentServices?: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Apply for Scheme', query: 'Guide me through applying for a welfare scheme.' },
  { label: 'Check Documents', query: 'What documents are missing from my vault?' },
  { label: 'Explain Recommendation', query: 'Explain why PM-KISAN is recommended for me.' },
  { label: 'Check Eligibility', query: 'Am I eligible for PM Awas Yojana housing scheme?' },
  { label: 'Government Services', query: 'How do I connect my DigiLocker and Aadhaar?' },
  { label: 'My Applications', query: 'What is the current timeline for my submitted application?' },
];

export const AiCopilotScreen: React.FC<Props> = ({
  onBack,
  onNavigateToSchemes,
  onNavigateToVault,
  onNavigateToApplications,
  onNavigateToGovernmentServices,
}) => {
  const {
    messages,
    sendMessage,
    isLoading,
    isError,
    clearMessages,
    language,
    toggleLanguage,
    isSpeechEnabled,
    toggleSpeech,
    exportHistory,
    retryLast,
  } = useAiCopilot();

  const { profile } = useCitizenProfile();
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Web Speech Synthesis TTS for last AI message when speech enabled
  useEffect(() => {
    if (isSpeechEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'assistant' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastMsg.text);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, isSpeechEnabled, language]);

  // Web Speech Recognition STT
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser version.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
    };

    recognition.start();
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    const text = inputQuery;
    setInputQuery('');
    sendMessage(text, {
      citizenId: profile?.id,
      income: profile?.annualIncomeINR,
      state: profile?.address?.state,
    });
  };

  const handleQuickAction = (action: (typeof QUICK_ACTIONS)[0]) => {
    if (action.label === 'Government Services' && onNavigateToGovernmentServices) {
      onNavigateToGovernmentServices();
      return;
    }
    if (action.label === 'Check Documents' && onNavigateToVault) {
      onNavigateToVault();
      return;
    }
    if (action.label === 'Apply for Scheme' && onNavigateToSchemes) {
      onNavigateToSchemes();
      return;
    }
    if (action.label === 'My Applications' && onNavigateToApplications) {
      onNavigateToApplications();
      return;
    }
    sendMessage(action.query);
  };

  const handleExport = () => {
    const jsonStr = exportHistory();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benefitOS_copilot_chat_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
              ← Back
            </button>
            <div>
              <h1 className="text-base font-bold text-blue-900 leading-tight">AI Citizen Copilot</h1>
              <span className="text-[10px] text-slate-500 block font-medium">
                {profile ? `Assisting ${profile.firstName} ${profile.lastName}` : 'Intelligent Welfare Assistant'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-blue-900 hover:bg-slate-200 border border-slate-200"
            >
              {language === 'en' ? '🌐 HI' : '🌐 EN'}
            </button>

            <button
              onClick={toggleSpeech}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                isSpeechEnabled
                  ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isSpeechEnabled ? '🔊 Audio On' : '🎙️ TTS Voice'}
            </button>

            <button
              onClick={handleExport}
              title="Export Conversation"
              className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-200"
            >
              📥 Export
            </button>

            <button
              onClick={clearMessages}
              title="Clear History"
              className="px-2.5 py-1 rounded-lg bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 border border-rose-200"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </header>

      {/* Context Awareness Bar */}
      <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-4 text-xs font-medium text-slate-600">
        <div className="max-w-5xl mx-auto flex items-center gap-3 overflow-x-auto scrollbar-none">
          <span className="bg-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">👤 Verified Profile</span>
          <span className="bg-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">🆔 Aadhaar Linked</span>
          <span className="bg-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">📂 DigiLocker Synced</span>
          <span className="bg-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">📜 Document Vault Linked</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto flex-1 px-4 py-6 flex flex-col justify-between space-y-4">
        {/* Quick Action Chips */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex gap-2 overflow-x-auto scrollbar-none">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="px-3 py-1.5 rounded-full bg-blue-50/70 border border-blue-200 text-xs font-semibold text-blue-900 hover:bg-blue-100 whitespace-nowrap transition-colors"
            >
              ✨ {action.label}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm overflow-y-auto space-y-4 max-h-[500px]">
          {messages.map((item: CopilotMessage) => {
            const isUser = item.sender === 'user';
            return (
              <div key={item.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl border text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-900 text-white border-blue-900 rounded-br-none shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  {!isUser && (
                    <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-blue-900">
                      <span>[Gemini 1.5 Pro AI]</span>
                      <span className="text-slate-400 font-normal">{item.timestamp}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{item.text}</p>

                  {isUser && (
                    <div className="mt-1 text-right">
                      <span className="text-[10px] text-blue-200">{item.timestamp}</span>
                    </div>
                  )}

                  {!isUser && item.sources && item.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Verified Sources:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.sources.map((src, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold"
                          >
                            ✓ {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                <svg className="animate-spin h-4 w-4 text-blue-900" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xs font-medium text-slate-600 animate-pulse">
                  Copilot is analyzing profile & government databases...
                </span>
              </div>
            </div>
          )}

          {isError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center text-xs font-semibold text-rose-800">
              <span>Connection timeout. Failed to fetch response.</span>
              <button onClick={retryLast} className="underline font-bold">
                Retry
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Speech Recognition STT */}
        <form onSubmit={handleSend} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex gap-2 items-center">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border text-sm transition-colors ${
              isListening ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Speech-to-Text Input"
          >
            {isListening ? '🎙️ Listening...' : '🎙️ Mic'}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={language === 'hi' ? 'अपनी कल्याणकारी योजना के प्रश्न यहाँ पूछें...' : 'Ask your welfare journey questions...'}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />

          <Button
            type="submit"
            title="Send"
            isLoading={isLoading}
            disabled={!inputQuery.trim() || isLoading}
            className="px-6 py-2.5 font-bold"
          />
        </form>
      </main>
    </div>
  );
};
