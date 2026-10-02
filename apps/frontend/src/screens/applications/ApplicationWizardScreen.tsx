import React, { useState } from 'react';
import { useSchemes } from '../../hooks/useSchemes';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { useDocuments } from '../../hooks/useDocuments';
import { useCreateApplication } from '../../hooks/useCreateApplication';
import { AppLayout } from '../../components/layout/AppLayout';
import { CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon, DocumentTextIcon, LandmarkIcon } from '../../components/ui/Icons';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export const ApplicationWizardScreen: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [declarationChecked, setDeclarationChecked] = useState<boolean>(false);
  const [applicantNotes, setApplicantNotes] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { schemes } = useSchemes();
  const { profile } = useCitizenProfile();
  const { documents } = useDocuments();
  const { createApplication, isCreating } = useCreateApplication();

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);

  const toggleDocSelection = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      setSelectedDocIds(selectedDocIds.filter((id) => id !== docId));
    } else {
      setSelectedDocIds([...selectedDocIds, docId]);
    }
  };

  const handleSaveDraft = async () => {
    setStatusMessage(null);
    if (!selectedSchemeId) {
      setStatusMessage({ type: 'error', text: 'Please select a welfare scheme for application draft.' });
      return;
    }

    try {
      await createApplication({
        schemeId: selectedSchemeId,
        formData: { applicantNotes, autoFilledDemographics: { firstName: profile?.firstName, lastName: profile?.lastName } },
        attachedDocumentIds: selectedDocIds,
      });
      setStatusMessage({ type: 'success', text: 'Welfare application draft saved successfully.' });
      setTimeout(onSuccess, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not save application draft.' });
    }
  };

  const handleSubmit = async () => {
    setStatusMessage(null);
    if (!selectedSchemeId) {
      setStatusMessage({ type: 'error', text: 'Please select a welfare scheme.' });
      return;
    }

    if (!declarationChecked) {
      setStatusMessage({ type: 'error', text: 'You must agree to the self-declaration terms.' });
      return;
    }

    try {
      await createApplication({
        schemeId: selectedSchemeId,
        formData: {
          applicantNotes,
          autoFilledDemographics: { firstName: profile?.firstName, lastName: profile?.lastName },
          submittedAt: new Date().toISOString(),
        },
        attachedDocumentIds: selectedDocIds,
      });
      setStatusMessage({ type: 'success', text: 'Your welfare application has been submitted for department review!' });
      setTimeout(onSuccess, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not submit welfare application.' });
    }
  };

  return (
    <AppLayout activeTab="applications">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-4">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-mint-400 hover:underline mb-1 block"
            >
              ← Back to Applications
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Welfare Benefit Application
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step submission for direct benefit transfer authorization.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-950 border border-[#1C3127] text-mint-300">
            Step {step} of 4
          </span>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-4 gap-2">
          {['1. Select Scheme', '2. Review Profile', '3. Attach Docs', '4. Declare & Submit'].map(
            (label, idx) => {
              const current = idx + 1;
              const isActive = step === current;
              const isPast = step > current;
              return (
                <div
                  key={label}
                  className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-[#0B3B2B] border-mint-500/50 text-mint-300 shadow-sm'
                      : isPast
                      ? 'bg-forest-950/80 border-[#1C3127] text-emerald-400'
                      : 'bg-[#0E1712] border-[#1C3127] text-slate-500'
                  }`}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{current}</span>
                </div>
              );
            }
          )}
        </div>

        {/* Wizard Steps Form */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white font-heading">
                1. Select Target Welfare Scheme
              </h2>
              <p className="text-xs text-slate-400">
                Choose the scheme you wish to apply for:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {schemes.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSchemeId(s.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedSchemeId === s.id
                        ? 'bg-[#0B3B2B] border-mint-500 text-white'
                        : 'bg-forest-950/70 border-[#1C3127] hover:border-forest-700 text-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">{s.code}</span>
                    <h3 className="text-sm font-bold text-white mt-1">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                    <p className="text-xs font-black text-mint-300 mt-2">
                      ₹{s.financialBenefit.toLocaleString('en-IN')} / Yr
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white font-heading">
                2. Auto-Filled Citizen Profile Information
              </h2>
              <div className="p-4 rounded-xl bg-forest-950/80 border border-[#1C3127] space-y-2 text-xs">
                <p>
                  <strong className="text-slate-400">Applicant Name:</strong>{' '}
                  <span className="text-white font-bold">{profile?.firstName} {profile?.lastName}</span>
                </p>
                <p>
                  <strong className="text-slate-400">Gender &amp; DOB:</strong>{' '}
                  <span className="text-white font-semibold">{profile?.gender || 'N/A'}, {profile?.dateOfBirth || 'N/A'}</span>
                </p>
                <p>
                  <strong className="text-slate-400">Annual Family Income:</strong>{' '}
                  <span className="text-mint-300 font-bold">₹{profile?.annualIncomeINR?.toLocaleString('en-IN') || 'N/A'}</span>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Applicant Notes / Specific Remarks (Optional)
                </label>
                <textarea
                  value={applicantNotes}
                  onChange={(e) => setApplicantNotes(e.target.value)}
                  placeholder="Enter any additional context or details for the review officer..."
                  className="w-full p-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white font-heading">
                3. Attach Documents from Vault
              </h2>
              <p className="text-xs text-slate-400">
                Select documents from your Vault to attach to this application:
              </p>
              <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                {documents.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-[#0B3B2B] border-mint-500/60 text-white'
                          : 'bg-forest-950/70 border-[#1C3127] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-5 h-5 text-mint-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-400">{doc.documentType}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-mint-400">
                        {isChecked ? '✓ Attached' : '+ Attach'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white font-heading">
                4. Self-Declaration &amp; Final Submission
              </h2>
              <div className="p-4 rounded-xl bg-forest-950/80 border border-[#1C3127] text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white">Summary for Submission:</p>
                <p>Scheme: <span className="text-mint-300 font-bold">{selectedScheme?.title}</span></p>
                <p>Attached Documents: <span className="text-white">{selectedDocIds.length} vault certificates attached</span></p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-mint-500 focus:ring-mint-500 accent-mint-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I hereby solemnly declare that the information provided above is true and authentic to the best of my knowledge. I understand that false statements will result in rejection and forfeiture of benefits.
                </span>
              </label>
            </div>
          )}

          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-mint-300'
                  : 'bg-rose-950/80 border border-rose-900/60 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2Icon className="w-4 h-4 text-mint-400 shrink-0" />
              ) : (
                <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1C3127]/60">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2.5 rounded-xl bg-forest-950 border border-[#1C3127] text-xs font-semibold text-slate-300 hover:text-white"
              >
                ← Previous Step
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl bg-forest-900 border border-[#1C3127] text-xs font-semibold text-slate-300 hover:text-white"
              >
                Save Draft
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 1 && !selectedSchemeId}
                  className="px-5 py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 disabled:opacity-50 text-forest-950 text-xs font-bold shadow-md"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCreating || !declarationChecked}
                  className="px-6 py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 disabled:opacity-50 text-forest-950 text-xs font-bold shadow-md"
                >
                  {isCreating ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
