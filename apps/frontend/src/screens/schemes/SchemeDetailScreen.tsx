import React from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useScheme } from '../../hooks/useScheme';
import { SchemeInstructionsSection } from '../../components/ui/SchemeInstructionsSection';
import { AppLayout } from '../../components/layout/AppLayout';
import { LandmarkIcon, CheckCircle2Icon, DocumentTextIcon, ArrowRightIcon } from '../../components/ui/Icons';

interface Props {
  schemeId: string;
  onBack: () => void;
  onSimulateEligibility: (schemeId: string) => void;
}

export const SchemeDetailScreen: React.FC<Props> = ({ schemeId, onBack, onSimulateEligibility }) => {
  const { scheme, isLoading, isError, refetch } = useScheme(schemeId);

  if (isLoading) {
    return (
      <AppLayout activeTab="schemes">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message="Loading Scheme Details..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || !scheme) {
    return (
      <AppLayout activeTab="schemes">
        <main className="flex flex-col justify-center items-center min-h-[60vh] p-6 text-center">
          <div className="bg-[#0E1712] p-8 rounded-2xl border border-[#1C3127]/80 max-w-md w-full shadow-lg space-y-4">
            <p className="text-sm font-semibold text-rose-300">Could not load scheme details from server.</p>
            <button
              onClick={() => refetch()}
              className="w-full py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={onBack}
              className="w-full py-2.5 rounded-xl bg-forest-900 border border-[#1C3127] text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab="schemes">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-mint-400 hover:underline inline-flex items-center gap-1"
          >
            <span>← Back to Catalog</span>
          </button>
          <span className="text-xs font-mono font-bold text-amber-400">{scheme.code}</span>
        </div>

        {/* Scheme Hero Header Card */}
        <div className="rounded-2xl bg-gradient-to-r from-forest-950 via-[#0A1D15] to-forest-950 border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-amber-400">{scheme.code}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-mint-300">
              {scheme.category.replace(/_/g, ' ')}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
              {scheme.title}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-300/90 font-medium mt-1">
              {scheme.department}
            </p>
          </div>

          <div className="bg-[#080C0A]/80 border border-[#1C3127] p-4 rounded-xl flex items-center justify-between gap-4">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              Financial Benefit
            </span>
            <span className="text-lg sm:text-xl font-black text-mint-400">
              ₹{scheme.financialBenefit.toLocaleString('en-IN')} / Year
            </span>
          </div>
        </div>

        {/* Overview Card */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-lg space-y-2">
          <h2 className="text-base font-bold text-white font-heading">Overview &amp; Purpose</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{scheme.description}</p>
        </div>

        {/* Eligibility Rules Card */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-lg space-y-3">
          <h2 className="text-base font-bold text-white font-heading">Eligibility Rules &amp; Criteria</h2>
          {scheme.eligibilityRules && scheme.eligibilityRules.length > 0 ? (
            <div className="space-y-2.5">
              {scheme.eligibilityRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 bg-forest-950/70 rounded-xl border border-[#1C3127] flex items-start gap-3"
                >
                  <CheckCircle2Icon className="w-4 h-4 text-mint-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">{rule.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {rule.attributeKey} {rule.operator} {rule.targetValue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Standard national welfare guidelines apply.</p>
          )}
        </div>

        {/* Required Documents Card */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-lg space-y-3">
          <h2 className="text-base font-bold text-white font-heading">Required Documents</h2>
          {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheme.requiredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-forest-950/70 rounded-xl border border-[#1C3127] flex items-center gap-3"
                >
                  <DocumentTextIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">{doc.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No special document requirements specified.</p>
          )}
        </div>

        {/* Simulate Action Button */}
        <button
          type="button"
          onClick={() => onSimulateEligibility(scheme.id)}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 text-sm font-bold shadow-lg shadow-mint-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Simulate My Eligibility Match</span>
          <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Complete AI Step-by-Step Instructions & Official Apply Link Button */}
        <SchemeInstructionsSection schemeTitle={scheme.title} schemeId={scheme.id} />
      </div>
    </AppLayout>
  );
};
