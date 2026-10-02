import React, { useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { FolderIcon, PlusIcon, TrashIcon, CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { useDocuments } from '../../hooks/useDocuments';
import { useDeleteDocument } from '../../hooks/useDeleteDocument';
import { DocumentItem } from '../../services/document.service';
import { AppLayout } from '../../components/layout/AppLayout';

const DOC_TYPES = [
  { id: 'ALL', label: 'All Vault Docs' },
  { id: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
  { id: 'EDUCATIONAL_CERTIFICATE', label: 'Educational Certificate' },
  { id: 'DISABILITY_CERTIFICATE', label: 'Disability Certificate' },
  { id: 'CASTE_CERTIFICATE', label: 'Caste Certificate' },
  { id: 'AADHAAR', label: 'Aadhaar Card' },
  { id: 'DRIVING_LICENSE', label: 'Driving Licence' },
  { id: 'VOTER_ID', label: 'Voter ID' },
];

interface Props {
  onNavigateToUpload: () => void;
  onPreviewDocument: (id: string) => void;
  onBack?: () => void;
}

export const DocumentVaultScreen: React.FC<Props> = ({
  onNavigateToUpload,
  onPreviewDocument,
  onBack,
}) => {
  const { documents, isLoading, isError, refetch } = useDocuments();
  const { deleteDocument } = useDeleteDocument();
  const [selectedType, setSelectedType] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    if (selectedType === 'ALL') return true;
    return doc.documentType === selectedType;
  });

  const handleDeleteConfirmed = async (docId: string) => {
    try {
      await deleteDocument(docId);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Could not delete document.');
    }
  };

  return (
    <AppLayout activeTab="vault">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C3127]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-xs font-semibold text-mint-400 hover:underline mr-2"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                Document Vault
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Your important government documents are encrypted, organized, and securely stored.
            </p>
          </div>

          <button
            onClick={onNavigateToUpload}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Category Chips Bar */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-4 shadow-lg flex gap-2 overflow-x-auto custom-scrollbar">
          {DOC_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#0B3B2B] border-mint-500/50 text-mint-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white hover:border-forest-700'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Document Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={140} className="rounded-2xl" />
            <Skeleton height={140} className="rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-[#160D10] border border-rose-900/60 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-300">Unable to load document vault.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Retry Vault Sync
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-10 text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-950 border border-[#1C3127] flex items-center justify-center text-amber-400">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No documents found in vault</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your ID proofs, land records, or certificates to unlock automatic scheme eligibility.
              </p>
            </div>
            <button
              onClick={onNavigateToUpload}
              className="px-4 py-2 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 text-xs font-bold transition-colors"
            >
              Upload First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredDocs.map((item: DocumentItem) => {
              const isVerified = item.verificationStatus === 'VERIFIED';
              const isRejected = item.verificationStatus === 'REJECTED';

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 p-5 shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950 border border-[#1C3127] text-slate-300">
                        {item.documentType.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isVerified
                            ? 'bg-emerald-950/80 border border-emerald-500/40 text-mint-300'
                            : isRejected
                            ? 'bg-rose-950/80 border border-rose-900/60 text-rose-300'
                            : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {isVerified && <CheckCircle2Icon className="w-3 h-3 text-mint-400" />}
                        {isRejected && <AlertTriangleIcon className="w-3 h-3 text-rose-400" />}
                        <span>{item.verificationStatus}</span>
                      </span>
                    </div>

                    <h3
                      onClick={() => onPreviewDocument(item.id)}
                      className="text-base font-bold text-white hover:text-mint-300 cursor-pointer transition-colors font-heading leading-snug"
                    >
                      {item.fileName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {(item.fileSize / 1024).toFixed(1)} KB • {item.mimeType} • Uploaded{' '}
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {deleteConfirmId === item.id ? (
                    <div className="pt-3 border-t border-[#1C3127]/60 flex items-center justify-between bg-rose-950/40 p-3 rounded-xl border border-rose-900/60">
                      <span className="text-xs font-bold text-rose-300">Confirm deletion?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteConfirmed(item.id)}
                          className="px-3 py-1 bg-rose-700 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 bg-forest-900 text-slate-300 rounded-lg text-xs font-bold hover:bg-forest-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-[#1C3127]/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onPreviewDocument(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-950 border border-[#1C3127] text-xs font-semibold text-slate-200 hover:text-white hover:border-mint-500/40 transition-all"
                      >
                        <span>Preview Document</span>
                        <ArrowRightIcon className="w-3 h-3 text-mint-400" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete document"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
