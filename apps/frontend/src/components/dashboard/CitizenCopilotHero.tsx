import React from 'react';
import { SparklesIcon, ArrowRightIcon, SearchIcon } from '../ui/Icons';

interface CitizenCopilotHeroProps {
  onLaunchCopilot: () => void;
  onFindSchemes?: () => void;
  citizenName?: string;
}

export const CitizenCopilotHero: React.FC<CitizenCopilotHeroProps> = ({
  onLaunchCopilot,
  onFindSchemes,
  citizenName = 'Divyansh Gupta',
}) => {
  // Determine appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#1C3127]/80 shadow-2xl bg-[#0A120E] min-h-[175px] sm:min-h-[185px] flex flex-col justify-center"
      role="region"
      aria-label="Citizen Welcome Hero"
    >
      {/* High-res Panoramic Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-right sm:bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/images/hero_rashtrapati_bhavan.jpg')" }}
      />

      {/* Restrained Dark Gradient Overlay for Maximum Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080C0A] via-[#080C0A]/90 to-[#080C0A]/40 z-0" />

      {/* Hero Content Area */}
      <div className="relative z-10 p-5 sm:p-7 max-w-2xl">
        {/* Eyebrow */}
        <p className="text-[11px] font-bold tracking-widest text-mint-400 uppercase font-mono">
          {getGreeting()}
        </p>

        {/* Large Heading: User's Name */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-heading tracking-tight leading-tight mt-1 mb-1.5">
          {citizenName}
        </h1>

        {/* Supporting Line */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mb-5">
          Find the government benefits and services available to you.
        </p>

        {/* Primary Actions Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Find Schemes for Me Button */}
          <button
            type="button"
            onClick={onFindSchemes || onLaunchCopilot}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <SearchIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Find Schemes for Me</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Ask AI Copilot Button */}
          <button
            type="button"
            onClick={onLaunchCopilot}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0E1712]/90 hover:bg-[#16241D] text-white font-semibold text-xs sm:text-sm border border-[#1C3127] hover:border-mint-500/40 transition-all cursor-pointer"
          >
            <SparklesIcon className="w-4 h-4 text-mint-400" />
            <span>Ask AI Copilot</span>
            <ArrowRightIcon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
