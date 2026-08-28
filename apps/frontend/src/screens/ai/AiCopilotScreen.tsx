import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useAiCopilot, CopilotMessage } from '../../hooks/useAiCopilot';
import { useVerificationSources } from '../../hooks/useVerificationSources';
import { StructuredAiResponseRenderer } from '../../components/ai/StructuredAiResponseRenderer';
import {
  GlobeIcon,
  VolumeIcon,
  MicIcon,
  DownloadIcon,
  TrashIcon,
  UserIcon,
  IdCardIcon,
  FolderIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckIcon,
  CheckCircleIcon,
  LandmarkIcon,
} from '../../components/ui/Icons';

interface Props {
  onBack: () => void;
  onNavigateToSchemes?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
  onNavigateToGovernmentServices?: () => void;
}

const QUICK_ACTIONS_EN = [
  { label: 'Apply for Scheme', query: 'Guide me through applying for a welfare scheme.' },
  { label: 'Check Documents', query: 'What documents do I need to prepare for welfare schemes?' },
  { label: 'Explain Recommendation', query: 'Explain the top recommended welfare scheme for my profile.' },
  { label: 'Check Eligibility', query: 'Check my eligibility for government welfare programs.' },
  { label: 'Government Services', query: 'How do I connect government services like Aadhaar and DigiLocker?' },
  { label: 'My Applications', query: 'What is the step-by-step process to track my submitted application?' },
];

const QUICK_ACTIONS_HI = [
  { label: 'योजना आवेदन', query: 'मुझे किसी सरकारी कल्याण योजना के लिए आवेदन करने में मदद करें।' },
  { label: 'दस्तावेज़ सूची', query: 'सरकारी योजनाओं के लिए मुझे कौन से दस्तावेज़ तैयार करने होंगे?' },
  { label: 'सिफारिश समझें', query: 'मेरी प्रोफ़ाइल के लिए सबसे उपयुक्त सरकारी योजना समझाएं।' },
  { label: 'पात्रता जाँचें', query: 'सरकारी कल्याण कार्यक्रमों के लिए मेरी पात्रता की जाँच करें।' },
  { label: 'सरकारी सेवाएँ', query: 'मैं आधार और डिजिलॉकर जैसी सरकारी सेवाओं को कैसे जोड़ सकता हूँ?' },
  { label: 'मेरे आवेदन', query: 'जमा किए गए आवेदन की स्थिति कैसे ट्रैक करें?' },
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
    setLanguageExplicit,
    isSpeechEnabled,
    toggleSpeech,
    exportHistory,
    retryLast,
  } = useAiCopilot();

  const {
    isProfileVerified,
    profileCompletionPercentage,
    profileName,
    isAadhaarLinked,
    isDigiLockerSynced,
    isVaultLinked,
    documentCount,
    isDatabaseLinked,
    activeSources,
  } = useVerificationSources();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHindi = language === 'hi';
  const quickActions = isHindi ? QUICK_ACTIONS_HI : QUICK_ACTIONS_EN;

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
        utterance.lang = isHindi ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [messages, isSpeechEnabled, isHindi]);

  // Web Speech Recognition STT
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHindi ? 'इस ब्राउज़र में ध्वनि पहचान समर्थित नहीं है।' : 'Speech recognition is not supported in this browser version.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? 'hi-IN' : 'en-US';
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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const query = inputQuery.trim();
    setInputQuery('');
    await sendMessage(query);
  };

  const handleQuickAction = async (action: { label: string; query: string }) => {
    if (isLoading) return;
    await sendMessage(action.query);
  };

  const handleExport = () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benefit-os-copilot-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>← {isHindi ? 'वापस' : 'Back'}</span>
            </button>
            <div>
              <h1 className="text-base font-bold text-blue-900 dark:text-blue-100 leading-tight">
                {isHindi ? 'एआई नागरिक कोपायलट' : 'AI Citizen Copilot'}
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                {profileName
                  ? `${isHindi ? 'सहायक नागरिक' : 'Assisting'}: ${profileName}`
                  : isHindi
                  ? 'डिजिटल कल्याण सलाहकार'
                  : 'Intelligent Welfare Assistant'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Explicit Bilingual Segmented Control */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setLanguageExplicit('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                aria-pressed={language === 'en'}
              >
                EN {language === 'en' ? '✓' : ''}
              </button>
              <button
                type="button"
                onClick={() => setLanguageExplicit('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                aria-pressed={language === 'hi'}
              >
                हिंदी {language === 'hi' ? '✓' : ''}
              </button>
            </div>

            <button
              onClick={toggleSpeech}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 ${
                isSpeechEnabled
                  ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isSpeechEnabled ? 'Disable Audio Voice' : 'Enable Audio Voice'}
            >
              {isSpeechEnabled ? (
                <>
                  <VolumeIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isHindi ? 'आवाज चालू' : 'Audio On'}</span>
                </>
              ) : (
                <>
                  <MicIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isHindi ? 'आवाज' : 'TTS Voice'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleExport}
              title={isHindi ? 'बातचीत डाउनलोड करें' : 'Export Conversation'}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHindi ? 'निर्यात' : 'Export'}</span>
            </button>

            <button
              onClick={clearMessages}
              title={isHindi ? 'इतिहास साफ़ करें' : 'Clear History'}
              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 flex items-center gap-1"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHindi ? 'साफ़ करें' : 'Clear'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Truthful Context Awareness Bar (Never displays false verification states) */}
      <div className="bg-slate-100/90 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 py-1.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
            {isHindi ? 'सत्यापित स्रोत:' : 'Active Sources:'}
          </span>

          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0">
            <CheckCircleIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{isHindi ? 'सरकारी योजना डेटाबेस' : 'Government Scheme DB'}</span>
          </span>

          {isProfileVerified && (
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0">
              <UserIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? `नागरिक प्रोफ़ाइल (${profileCompletionPercentage}%)` : `Verified Profile (${profileCompletionPercentage}%)`}</span>
            </span>
          )}

          {isAadhaarLinked && (
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0">
              <IdCardIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'आधार लिंक' : 'Aadhaar Linked'}</span>
            </span>
          )}

          {isDigiLockerSynced && (
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0">
              <FolderIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'डिजिलॉकर सिंक' : 'DigiLocker Synced'}</span>
            </span>
          )}

          {isVaultLinked && (
            <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shrink-0">
              <DocumentTextIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{isHindi ? `दस्तावेज़ वॉल्ट (${documentCount})` : `Document Vault (${documentCount})`}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto flex-1 px-4 py-5 flex flex-col justify-between space-y-4">
        {/* Quick Action Chips (Bilingual) */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex gap-2 overflow-x-auto scrollbar-none">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="px-3 py-1.5 rounded-full bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-blue-800 dark:text-blue-400" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto space-y-5 max-h-[560px]">
          {messages.map((item: CopilotMessage) => {
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
                  ) : (
                    <StructuredAiResponseRenderer
                      content={item.text}
                      sources={item.sources || activeSources}
                      timestamp={item.timestamp}
                      language={language}
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
              <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block">
                    BenefitOS AI
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium animate-pulse block">
                    {isHindi
                      ? 'नागरिक प्रोफ़ाइल और सत्यापित सरकारी योजना डेटाबेस का विश्लेषण हो रहा है...'
                      : 'Analyzing citizen profile & verified government scheme database...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex justify-between items-center text-xs font-semibold text-rose-800 dark:text-rose-300 shadow-xs">
              <span>
                {isHindi
                  ? 'हम अभी आपका अनुरोध संसाधित करने में असमर्थ हैं। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।'
                  : 'We could not prepare your response right now. Please verify your connection and try again.'}
              </span>
              <button onClick={retryLast} className="underline font-bold hover:text-rose-900 dark:hover:text-rose-100 ml-2 shrink-0">
                {isHindi ? 'पुनः प्रयास करें' : 'Retry'}
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Speech Recognition STT */}
        <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-2 items-center">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border text-sm transition-colors flex items-center gap-1.5 shrink-0 ${
              isListening ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isHindi ? 'आवाज इनपुट' : 'Speech-to-Text Voice Input'}
            aria-label="Speech-to-Text Voice Input"
          >
            <MicIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{isListening ? (isHindi ? 'सुन रहा है...' : 'Listening...') : (isHindi ? 'माइक' : 'Mic')}</span>
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isHindi
                ? 'अपनी कल्याणकारी योजना या पात्रता संबंधी प्रश्न यहाँ पूछें...'
                : 'Ask your welfare journey or eligibility questions...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800"
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
