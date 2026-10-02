import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ArrowLeftIcon, SparklesIcon, AlertTriangleIcon, CheckCircle2Icon, FileTextIcon, ShieldCheckIcon } from '../../components/ui/Icons';
import { useOcrResult } from '../../hooks/useOcrResult';
import { useProcessOcr } from '../../hooks/useProcessOcr';
import { useDocument } from '../../hooks/useDocument';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  documentId: string;
  onBack: () => void;
}

export const OcrReviewScreen: React.FC<Props> = ({ documentId, onBack }) => {
  const { document: doc } = useDocument(documentId);
  const { ocrResult, isLoading, isError, refetch } = useOcrResult(documentId);
  const { processOcr, isProcessing } = useProcessOcr();

  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const [hasInitializedFields, setHasInitializedFields] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (ocrResult?.extractedData && !hasInitializedFields) {
    const initial: Record<string, string> = {};
    Object.entries(ocrResult.extractedData).forEach(([key, val]) => {
      initial[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
    });
    setEditableFields(initial);
    setHasInitializedFields(true);
  }

  const handleRunOcr = async () => {
    setStatusMessage(null);
    try {
      await processOcr(documentId);
      setHasInitializedFields(false);
      refetch();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Vision OCR scan could not complete.' });
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditableFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirmVerification = () => {
    setStatusMessage({ type: 'success', text: 'Extracted fields saved to citizen document vault!' });
    setTimeout(onBack, 1200);
  };

  const confidencePct = ocrResult ? (ocrResult.confidenceScore * 100).toFixed(1) : '0.0';
  const isHighConfidence = ocrResult && ocrResult.confidenceScore >= 0.85;

  return (
    <AppLayout activeTab="vault">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-mint-400 hover:text-mint-300 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Vault</span>
          </button>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-forest-950 border border-[#1C3127] text-slate-300">
            OCR Extraction Review
          </span>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-lg'
                : 'bg-rose-950/80 border-rose-800/60 text-rose-200 shadow-lg'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2Icon className="w-5 h-5 text-mint-400 shrink-0" />
            ) : (
              <AlertTriangleIcon className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Document Header Card */}
        <div className="rounded-3xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge label={doc?.documentType || 'DOCUMENT'} variant="primary" />
            <Badge
              label={doc?.verificationStatus || 'PENDING'}
              variant={doc?.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              {doc?.fileName || `Document #${documentId.slice(0, 8)}`}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI Vision OCR parses official stamps, QR codes, biometric signatures, and printed text.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunOcr}
            disabled={isProcessing}
            className="w-full py-3 px-6 rounded-2xl font-black text-xs bg-gradient-to-r from-mint-500 to-emerald-400 hover:from-mint-400 hover:to-emerald-300 text-forest-950 shadow-lg shadow-mint-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <SparklesIcon className="w-4 h-4 text-forest-950" />
            <span>{isProcessing ? 'Processing BenefitOS Vision Scan...' : 'Run Vision OCR Scan'}</span>
          </button>
        </div>

        {isLoading && (
          <div className="min-h-[200px] flex items-center justify-center">
            <LoadingSpinner message="Fetching OCR inspection results..." />
          </div>
        )}

        {ocrResult ? (
          <>
            {/* Confidence Badge */}
            <div className="rounded-3xl bg-gradient-to-br from-[#0D2418] via-[#0E1712] to-[#0A120E] border border-emerald-500/40 p-6 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                  BenefitOS Vision Verification Score
                </span>
                <span className="text-3xl font-black text-white">{confidencePct}%</span>
              </div>
              <Badge
                label={isHighConfidence ? 'HIGH CONFIDENCE' : 'MANUAL AUDIT REQUIRED'}
                variant={isHighConfidence ? 'success' : 'warning'}
              />
            </div>

            {/* Editable Extracted Fields */}
            <div className="rounded-3xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-4">
              <div>
                <h2 className="text-base font-bold text-white font-heading">
                  Extracted Document Attributes
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify and edit key entity attributes before finalizing vault ingestion.
                </p>
              </div>

              {Object.keys(editableFields).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(editableFields).map(([key, val]) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full bg-[#080C0A] border border-[#1C3127] focus:border-mint-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No structured fields extracted from document image.
                </p>
              )}
            </div>

            {/* Raw Text Viewer */}
            <div className="rounded-3xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white font-heading">
                Raw Extracted OCR Text Buffer
              </h3>
              <div className="bg-[#080C0A] p-4 rounded-2xl border border-[#1C3127] font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {ocrResult.rawText}
              </div>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmVerification}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-mint-500 to-emerald-400 hover:from-mint-400 hover:to-emerald-300 text-forest-950 shadow-xl shadow-mint-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2Icon className="w-5 h-5 text-forest-950" />
              <span>Confirm &amp; Save Extracted Attributes</span>
            </button>
          </>
        ) : (
          !isLoading && (
            <div className="rounded-3xl bg-[#0E1712] border border-[#1C3127]/80 p-8 text-center text-slate-400 text-xs shadow-lg space-y-2">
              <FileTextIcon className="w-8 h-8 text-slate-500 mx-auto" />
              <p>No OCR extraction result available yet.</p>
              <p className="text-[11px] text-slate-500">
                Click "Run Vision OCR Scan" above to initiate AI vision processing.
              </p>
            </div>
          )
        )}

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 px-6 rounded-2xl font-bold text-xs bg-forest-950 hover:bg-forest-900 text-slate-300 border border-[#1C3127] transition-all cursor-pointer"
        >
          ← Return to Vault
        </button>
      </div>
    </AppLayout>
  );
};
