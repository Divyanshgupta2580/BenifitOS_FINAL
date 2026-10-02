import React from 'react';
import { SparklesIcon, ArrowRightIcon } from '../ui/Icons';

interface NeedGuidanceSectionProps {
  onAskCopilot: () => void;
}

export const NeedGuidanceSection: React.FC<NeedGuidanceSectionProps> = ({
  onAskCopilot,
}) => {
  return (
    <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Subtle background glow */}
      <div className="absolute right-0 bottom-0 w-64 h-64 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left: Text & CTA */}
      <div className="space-y-2.5 max-w-xl z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-black text-white font-heading tracking-tight">
            Need Guidance?
          </h3>
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-mint-500/20 text-mint-300 border border-mint-500/30">
            AI Assistant
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
          Get clear answers about schemes, eligibility rules, required documents, and step-by-step application procedures in English or Hindi.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onAskCopilot}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#11241C] hover:bg-[#163026] text-white font-semibold text-xs sm:text-sm border border-mint-500/40 hover:border-mint-400 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <SparklesIcon className="w-4 h-4 text-mint-400" />
            <span>Ask AI Copilot</span>
            <ArrowRightIcon className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Right: Glowing Mint Chat Bubble Graphic */}
      <div className="relative shrink-0 flex items-center justify-center self-center md:self-auto z-10">
        <div className="relative w-28 h-24 sm:w-32 sm:h-28 flex items-center justify-center">
          {/* Back small bubble */}
          <div className="absolute left-1 bottom-1 w-12 h-10 rounded-2xl bg-forest-900/90 border border-forest-700/60 shadow-lg -rotate-6" />

          {/* Front big glowing bubble */}
          <div className="absolute right-1 top-1 w-20 h-16 rounded-2xl bg-gradient-to-br from-mint-950 via-emerald-950 to-forest-950 border border-mint-500/50 shadow-xl shadow-mint-500/10 flex items-center justify-center gap-1.5 px-3">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse delay-100" />
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
