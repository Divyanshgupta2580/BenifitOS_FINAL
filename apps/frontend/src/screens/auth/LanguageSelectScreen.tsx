import React from 'react';
import { useLanguageStore } from '../../store/language.store';
import { GlobeIcon, CheckCircle2Icon, ArrowRightIcon } from '../../components/ui/Icons';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

interface Props {
  onContinue: () => void;
}

export const LanguageSelectScreen: React.FC<Props> = ({ onContinue }) => {
  const { locale, setLocale } = useLanguageStore();

  return (
    <main className="min-h-screen bg-[#080C0A] bg-botanical-auth flex flex-col justify-center items-center p-4 sm:p-6 relative text-slate-100 selection:bg-mint-500 selection:text-forest-950">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0E1712] rounded-3xl p-7 sm:p-9 border border-[#1C3127]/80 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-950 border border-[#1C3127] text-mint-400 mb-1 shadow-md">
            <GlobeIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Select Your Language
          </h1>
          <p className="text-xs text-slate-400">
            Choose your preferred language for government welfare scheme access and AI guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {LANGUAGES.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                  isSelected
                    ? 'border-mint-500/60 bg-[#0B3B2B] text-white shadow-md'
                    : 'border-[#1C3127] bg-[#080C0A] hover:border-forest-700 text-slate-300'
                }`}
              >
                <div>
                  <span className="text-base font-bold block">{lang.native}</span>
                  <span className={`text-[11px] ${isSelected ? 'text-mint-300' : 'text-slate-400'}`}>
                    {lang.name}
                  </span>
                </div>
                {isSelected && <CheckCircle2Icon className="w-5 h-5 text-mint-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-mint-500/25 transition-all"
        >
          <span>Continue to BenefitOS</span>
          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </main>
  );
};
