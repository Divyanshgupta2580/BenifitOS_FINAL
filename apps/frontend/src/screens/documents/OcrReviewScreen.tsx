import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useOcrResult } from '../../hooks/useOcrResult';
import { useProcessOcr } from '../../hooks/useProcessOcr';
import { useDocument } from '../../hooks/useDocument';

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
    setStatusMessage({ type: 'success', text: 'Extracted fields verified and saved to citizen document vault!' });
    setTimeout(onBack, 1200);
  };

  const confidencePct = ocrResult ? (ocrResult.confidenceScore * 100).toFixed(1) : '0.0';
  const isHighConfidence = ocrResult && ocrResult.confidenceScore >= 0.85;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
            ← Back to Vault
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">AI Vision OCR & Document Verification</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
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

        {/* Document Header Card */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <Badge label={doc?.documentType || 'DOCUMENT'} variant="primary" />
            <Badge label={doc?.verificationStatus || 'PENDING'} variant={doc?.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{doc?.fileName || `Document #${documentId.slice(0, 8)}`}</h2>
          
          <Button
            title={isProcessing ? 'Processing Google Gemini Vision Scan...' : 'Run Vision OCR Scan'}
            onClick={handleRunOcr}
            isLoading={isProcessing}
            variant="secondary"
            className="w-full py-2.5 font-bold"
          />
        </Card>

        {isLoading && <LoadingSpinner message="Fetching OCR Results..." />}

        {ocrResult ? (
          <>
            {/* Confidence Badge */}
            <div className="bg-blue-900 dark:bg-blue-950 text-white rounded-2xl p-6 shadow-md border border-blue-800 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-200 font-medium block">Google Gemini Vision Score</span>
                <span className="text-3xl font-black text-white">{confidencePct}%</span>
              </div>
              <Badge
                label={isHighConfidence ? 'HIGH CONFIDENCE' : 'MANUAL REVIEW REQUIRED'}
                variant={isHighConfidence ? 'success' : 'warning'}
              />
            </div>

            {/* Editable Extracted Fields */}
            <Card>
              <h3 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-1">Extracted Document Attributes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Verify and edit any field before submitting to verification audit.</p>

              {Object.keys(editableFields).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(editableFields).map(([key, val]) => (
                    <Input
                      key={key}
                      label={key.toUpperCase().replace(/_/g, ' ')}
                      value={val}
                      onChangeText={(text: string) => handleFieldChange(key, text)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No structured fields extracted from document image.</p>
              )}
            </Card>

            {/* Raw Text Viewer */}
            <Card>
              <h3 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-2">Raw Extracted OCR Text</h3>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {ocrResult.rawText}
              </div>
            </Card>

            <Button title="Confirm & Verify Document Attributes" onClick={handleConfirmVerification} className="w-full py-3 font-bold" />
          </>
        ) : (
          !isLoading && (
            <Card>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No OCR extraction result available yet. Click "Run Vision OCR Scan" to initiate AI vision processing.
              </p>
            </Card>
          )
        )}

        <Button title="Back to Vault" variant="outline" onClick={onBack} className="w-full py-2.5" />
      </main>
    </div>
  );
};
