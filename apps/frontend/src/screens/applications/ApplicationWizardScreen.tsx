import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useSchemes } from '../../hooks/useSchemes';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { useDocuments } from '../../hooks/useDocuments';
import { useCreateApplication } from '../../hooks/useCreateApplication';

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
        formData: { applicantNotes, autoFilledDemographics: { firstName: profile?.firstName, lastName: profile?.lastName }, submittedAt: new Date().toISOString() },
        attachedDocumentIds: selectedDocIds,
      });
      setStatusMessage({ type: 'success', text: 'Your welfare application has been submitted for department review!' });
      setTimeout(onSuccess, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not submit welfare application.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
            ← Back to Applications
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Step {step} of 4: Direct Benefit Transfer</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Step Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-900 dark:bg-blue-500 h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Step 1: Scheme Selection */}
        {step === 1 && (
          <Card>
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-1">Step 1: Select Target Scheme</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose the government scheme you wish to apply for.</p>

            <div className="space-y-3 mb-6">
              {schemes.map((s) => {
                const isSelected = selectedSchemeId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSchemeId(s.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-900 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/60 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400">{s.code}</span>
                      <Badge label={`₹${s.financialBenefit.toLocaleString('en-IN')}`} variant="success" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.department}</p>
                  </div>
                );
              })}
            </div>

            <Button
              title="Next: Review Profile Data →"
              onClick={() => {
                if (!selectedSchemeId) {
                  setStatusMessage({ type: 'error', text: 'Please select a scheme to proceed.' });
                  return;
                }
                setStatusMessage(null);
                setStep(2);
              }}
              className="w-full py-3 font-bold"
            />
          </Card>
        )}

        {/* Step 2: Profile Auto-Fill */}
        {step === 2 && (
          <Card>
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-1">Step 2: Citizen Profile Auto-Fill</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Review information auto-populated from your verified profile.</p>

            <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Applicant Name</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'Not Specified'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Gender & DOB</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {profile ? `${profile.gender} • ${new Date(profile.dateOfBirth).toLocaleDateString()}` : 'N/A'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">District & State Address</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {profile?.address ? `${profile.address.district}, ${profile.address.state} (${profile.address.pincode})` : 'N/A'}
                </span>
              </div>
            </div>

            <Input
              label="Additional Application Notes (Optional)"
              value={applicantNotes}
              onChangeText={setApplicantNotes}
              placeholder="e.g. Special circumstance or urgent processing request"
            />

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button title="← Previous" variant="outline" onClick={() => setStep(1)} className="px-6" />
              <Button title="Next: Attach Vault Docs →" onClick={() => setStep(3)} className="flex-1 py-3 font-bold" />
            </div>
          </Card>
        )}

        {/* Step 3: Attach Vault Documents */}
        {step === 3 && (
          <Card>
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-1">Step 3: Attach Vault Documents</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Select verified documents from your Document Vault to link to this application.</p>

            <div className="space-y-3 mb-6">
              {documents.length > 0 ? (
                documents.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                        isSelected
                          ? 'border-blue-900 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/60 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-900 dark:text-blue-500 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{doc.fileName}</span>
                      </div>
                      <Badge label={doc.documentType} variant="primary" />
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No documents in vault. You can still proceed and attach later.</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button title="← Previous" variant="outline" onClick={() => setStep(2)} className="px-6" />
              <Button title="Next: Final Declaration →" onClick={() => setStep(4)} className="flex-1 py-3 font-bold" />
            </div>
          </Card>
        )}

        {/* Step 4: Final Declaration */}
        {step === 4 && (
          <Card>
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-1">Step 4: Self-Declaration & Submission</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Review summary details before submitting to government welfare portal.</p>

            <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 space-y-2">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Selected Scheme</span>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-400">{selectedScheme?.title || 'Scheme Selected'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Documents Attached</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedDocIds.length} Vault Documents Linked</span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
                className="w-5 h-5 text-blue-900 dark:text-blue-500 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500 mt-0.5"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                I hereby declare that all details furnished in this application are true and correct to the best of my knowledge under official penalty of perjury.
              </span>
            </label>

            <div className="space-y-2">
              <Button title="Submit Application" onClick={handleSubmit} isLoading={isCreating} className="w-full py-3.5 font-bold" />
              <Button title="Save Application Draft" onClick={handleSaveDraft} variant="outline" className="w-full py-2.5" />
              <Button title="← Previous Step" variant="outline" onClick={() => setStep(3)} className="w-full py-2.5" />
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};
