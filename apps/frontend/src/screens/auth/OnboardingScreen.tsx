import React, { useState } from 'react';
import { BuildingIcon, CameraIcon, BotIcon, ArrowRightIcon } from '../../components/ui/Icons';

const SLIDES = [
  {
    Icon: BuildingIcon,
    title: 'Discover Welfare Schemes',
    description: 'Find official central and state government benefit schemes tailored specifically to your citizen profile.',
  },
  {
    Icon: CameraIcon,
    title: 'Vision OCR Document Vault',
    description: 'Scan Aadhaar, Educational Certificates, and Caste Certificates with AI Vision for automated document verification.',
  },
  {
    Icon: BotIcon,
    title: 'AI Multi-Lingual Copilot',
    description: 'Chat and interact in your regional language to receive clear, accessible guidance on applications.',
  },
];

interface Props {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onFinish }) => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      onFinish();
    }
  };

  const slide = SLIDES[index];

  return (
    <main className="min-h-screen bg-[#080C0A] bg-botanical-auth flex flex-col justify-center items-center p-4 sm:p-6 relative text-slate-100 selection:bg-mint-500 selection:text-forest-950">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0E1712] rounded-3xl p-7 sm:p-9 border border-[#1C3127]/80 shadow-2xl flex flex-col items-center text-center relative z-10 space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mint-400 to-emerald-600 text-forest-950 flex items-center justify-center shadow-lg shadow-mint-500/20">
          <slide.Icon className="w-10 h-10 text-forest-950" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight mb-2">
            {slide.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xs mx-auto">
            {slide.description}
          </p>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-mint-400' : 'w-2 bg-[#1C3127] hover:bg-forest-700'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-mint-500/25 transition-all"
        >
          <span>{index === SLIDES.length - 1 ? 'Get Started' : 'Next'}</span>
          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </main>
  );
};
