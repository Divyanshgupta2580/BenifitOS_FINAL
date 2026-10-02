import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DocumentTextIcon, ArrowLeftIcon, SparklesIcon, DownloadIcon, AlertTriangleIcon, CheckCircle2Icon } from '../../components/ui/Icons';
import { useDocument } from '../../hooks/useDocument';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  documentId: string;
  onBack: () => void;
  onRunOcr?: (documentId: string) => void;
}

export const DocumentViewerModal: React.FC<Props> = ({ documentId, onBack, onRunOcr }) => {
  const { document: doc, isLoading, isError, refetch } = useDocument(documentId);

  if (isLoading) {
    return (
      <AppLayout activeTab="vault">
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner message="Retrieving secure presigned document metadata..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || !doc) {
    return (
      <AppLayout activeTab="vault">
        <div className="w-full max-w-md mx-auto py-16 px-4">
          <div className="bg-[#0E1712] p-8 rounded-3xl border border-rose-900/40 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-rose-300 mb-6">
              Could not load document preview from the citizen vault.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-mint-500 hover:bg-mint-400 text-forest-950 shadow-md transition-all"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-forest-950/80 hover:bg-forest-900 text-slate-300 border border-[#1C3127] transition-all"
              >
                Back to Vault
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleDownload = () => {
    if (doc.storagePath && doc.storagePath.startsWith('http')) {
      window.open(doc.storagePath, '_blank');
    } else {
      alert(`Initiating secure download for ${doc.fileName}...`);
    }
  };

  const isImage = doc.mimeType?.startsWith('image/') || doc.fileName?.match(/\.(jpeg|jpg|png)$/i);
  const isPdf = doc.mimeType === 'application/pdf' || doc.fileName?.endsWith('.pdf');

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
            <span>Back to Citizen Vault</span>
          </button>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-forest-950 border border-[#1C3127] text-slate-300">
            {doc.fileName}
          </span>
        </div>

        {/* Document Viewer Container */}
        <div className="rounded-3xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge label={doc.documentType} variant="primary" />
              <Badge
                label={doc.verificationStatus}
                variant={doc.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {(doc.fileSize / 1024).toFixed(1)} KB • {doc.mimeType || 'binary/octet'}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              {doc.fileName}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono break-all">
              Path: {doc.storagePath}
            </p>
          </div>

          {/* Secure Web Preview */}
          <div className="bg-[#080C0A] rounded-2xl p-4 border border-[#1C3127] min-h-[340px] flex items-center justify-center overflow-hidden">
            {isImage && doc.storagePath?.startsWith('http') ? (
              <img
                src={doc.storagePath}
                alt={doc.fileName}
                className="max-h-[500px] object-contain rounded-xl shadow-lg"
              />
            ) : isPdf && doc.storagePath?.startsWith('http') ? (
              <iframe
                src={doc.storagePath}
                title={doc.fileName}
                className="w-full h-[500px] rounded-xl border-0"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-forest-950/80 border border-[#1C3127] flex items-center justify-center mx-auto text-mint-400 shadow-inner">
                  <DocumentTextIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white font-heading">
                    Encrypted Presigned Preview Ready
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-mono text-[11px] truncate">
                    Ref: {doc.storagePath}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-forest-950/90 hover:bg-forest-900 text-slate-200 border border-[#1C3127] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <DownloadIcon className="w-4 h-4 text-slate-300" />
              <span>Download Encrypted File</span>
            </button>
            {onRunOcr && (
              <button
                type="button"
                onClick={() => onRunOcr(doc.id)}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-mint-500 to-emerald-400 hover:from-mint-400 hover:to-emerald-300 text-forest-950 shadow-lg shadow-mint-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <SparklesIcon className="w-4 h-4 text-forest-950" />
                <span>Run AI Vision OCR Extraction</span>
              </button>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 px-6 rounded-2xl font-bold text-xs bg-forest-950 hover:bg-forest-900 text-slate-300 border border-[#1C3127] transition-all cursor-pointer"
        >
          ← Close Document Viewer
        </button>
      </div>
    </AppLayout>
  );
};
