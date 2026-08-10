import React from 'react';
import { Button } from '../../components/ui/Button';
import { useLanguageStore } from '../../store/language.store';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'கன்னட' },
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
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Select Your Language</h1>
          <p className="text-sm text-slate-600">Choose your preferred language for government welfare scheme access.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-[380px] overflow-y-auto pr-1">
          {LANGUAGES.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/50 text-blue-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                }`}
              >
                <span className="text-base font-semibold">{lang.native}</span>
                <span className={`text-xs ${isSelected ? 'text-blue-800 font-bold' : 'text-slate-500'}`}>{lang.name}</span>
              </button>
            );
          })}
        </div>

        <Button title="Continue to BenefitOS" onClick={onContinue} className="w-full py-3" />
      </div>
    </main>
  );
};
