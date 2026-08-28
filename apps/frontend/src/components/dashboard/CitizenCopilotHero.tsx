import React from 'react';
import { BotIcon, ArrowRightIcon } from '../ui/Icons';

interface CitizenCopilotHeroProps {
  onLaunchCopilot: () => void;
  copilotVersion?: string;
}

export const CitizenCopilotHero: React.FC<CitizenCopilotHeroProps> = ({
  onLaunchCopilot,
  copilotVersion = 'COPILOT v5.3',
}) => {
  return (
    <div
      onClick={onLaunchCopilot}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 border border-blue-800/80 p-5 sm:p-7 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-white"
      role="region"
      aria-label="AI Citizen Copilot Hero"
    >
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-36 h-36 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Avatar + Title + Description */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Glowing AI Avatar Circle */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-900/80 border border-blue-700 flex items-center justify-center text-cyan-300 shadow-inner group-hover:scale-105 transition-transform shrink-0">
            <BotIcon className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 drop-shadow-xs" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                AI Citizen Copilot
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-blue-600/40 text-blue-200 border border-blue-400/40">
                {copilotVersion}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your intelligent welfare journey advisor. Get context-aware guidance in English &amp; Hindi with vision document extraction.
            </p>
          </div>
        </div>

        {/* Right: Launch Button & Subtitle */}
        <div className="flex flex-col sm:items-end gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-blue-800/60">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLaunchCopilot();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all group-hover:scale-[1.02] active:scale-[0.98] border border-blue-400/40"
          >
            <span>Launch Copilot</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <span className="text-[11px] text-blue-300/90 font-medium">
            Explore schemes, eligibility, documents &amp; more
          </span>
        </div>
      </div>
    </div>
  );
};
