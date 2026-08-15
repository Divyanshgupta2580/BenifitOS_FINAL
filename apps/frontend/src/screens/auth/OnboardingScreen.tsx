import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { BuildingIcon, CameraIcon, BotIcon } from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-blue-900 dark:bg-blue-700 text-white flex items-center justify-center mb-6 shadow-md">
          <slide.Icon className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-3">{slide.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8">{slide.description}</p>

        {/* Carousel Dots */}
        <div className="flex justify-center items-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-blue-900 dark:bg-blue-500' : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <Button
          title={index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onClick={handleNext}
          className="w-full py-3"
        />
      </div>
    </main>
  );
};
