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
  citizenName = 'Priya Sharma',
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#1C3127]/80 shadow-2xl bg-forest-950 min-h-[200px] flex flex-col justify-between"
      role="region"
      aria-label="Citizen Welcome Hero"
    >
      {/* High-res Panoramic Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/images/hero_rashtrapati_bhavan.jpg')" }}
      />

      {/* Dark Botanical Gradient Overlay for Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#06120D]/95 via-[#0A1A14]/85 to-[#06120D]/50 z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080C0A] via-transparent to-transparent z-0 opacity-60" />

      {/* Hero Content Area */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Salutation + Name + Mission Statement + Action CTAs */}
        <div className="space-y-4 max-w-xl">
          <div>
            <p className="text-xs font-medium text-mint-300 tracking-wider">
              Good morning,
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-heading tracking-tight leading-tight mt-0.5">
              {citizenName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed mt-1.5">
              Let's find and access the government benefits you're eligible for.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Find Schemes for Me Button */}
            <button
              type="button"
              onClick={onFindSchemes || onLaunchCopilot}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-mint-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <SearchIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Find Schemes for Me</span>
              <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Ask AI Copilot Button */}
            <button
              type="button"
              onClick={onLaunchCopilot}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#11241C]/80 hover:bg-[#163026] text-white font-semibold text-xs sm:text-sm border border-mint-500/30 backdrop-blur-md transition-all hover:border-mint-400/50"
            >
              <SparklesIcon className="w-4 h-4 text-mint-400" />
              <span>Ask AI Copilot</span>
              <ArrowRightIcon className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Right: Inspirational National Quote Pill */}
        <div className="self-start md:self-center hidden sm:block">
          <div className="p-4 rounded-xl bg-forest-950/70 backdrop-blur-md border border-mint-500/20 max-w-xs shadow-lg">
            <p className="text-xs text-slate-200/90 italic font-medium leading-snug">
              &ldquo;A more inclusive India, for a brighter tomorrow.&rdquo;
            </p>
            <div className="w-8 h-0.5 bg-mint-400 rounded-full mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
