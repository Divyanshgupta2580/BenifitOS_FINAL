import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useScheme } from '../../hooks/useScheme';

interface Props {
  schemeId: string;
  onBack: () => void;
  onSimulateEligibility: (schemeId: string) => void;
}

export const SchemeDetailScreen: React.FC<Props> = ({ schemeId, onBack, onSimulateEligibility }) => {
  const { scheme, isLoading, isError, refetch } = useScheme(schemeId);

  if (isLoading) {
    return <LoadingSpinner message="Loading Scheme Details..." />;
  }

  if (isError || !scheme) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-4">Could not load scheme details from server.</p>
          <Button title="Retry" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back to Catalog" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Catalog
          </button>
          <span className="text-xs font-mono font-bold text-amber-700">{scheme.code}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Scheme Header Card */}
        <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-md border border-blue-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono font-bold text-amber-400">{scheme.code}</span>
            <Badge label={scheme.category} variant="primary" />
          </div>
          <h1 className="text-2xl font-extrabold mb-1">{scheme.title}</h1>
          <p className="text-xs text-blue-100 mb-6 font-medium">{scheme.department}</p>

          <div className="bg-blue-950/60 border border-blue-700/60 p-4 rounded-xl flex justify-between items-center">
            <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Financial Benefit</span>
            <span className="text-lg font-black text-amber-400">
              ₹{scheme.financialBenefit.toLocaleString('en-IN')} / Year
            </span>
          </div>
        </div>

        {/* Overview Card */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-2">Overview & Purpose</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{scheme.description}</p>
        </Card>

        {/* Eligibility Rules Card */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-3">Eligibility Rules & Criteria</h2>
          {scheme.eligibilityRules && scheme.eligibilityRules.length > 0 ? (
            <div className="space-y-3">
              {scheme.eligibilityRules.map((rule) => (
                <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="text-blue-900 font-bold text-sm mt-0.5">•</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{rule.description}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {rule.attributeKey} {rule.operator} {rule.targetValue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Standard welfare guidelines apply.</p>
          )}
        </Card>

        {/* Required Documents Card */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-3">Required Documents</h2>
          {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheme.requiredDocuments.map((doc) => (
                <div key={doc.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center gap-3">
                  <Badge label={doc.documentType} variant="warning" />
                  <span className="text-xs font-semibold text-slate-800">{doc.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No special document requirements specified.</p>
          )}
        </Card>

        {/* Simulate Action Button */}
        <Button
          title="Simulate My Eligibility Match →"
          variant="secondary"
          onClick={() => onSimulateEligibility(scheme.id)}
          className="w-full py-3.5 text-base font-bold shadow-md"
        />
      </main>
    </div>
  );
};
