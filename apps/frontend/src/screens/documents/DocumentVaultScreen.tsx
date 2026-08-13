import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { FolderIcon } from '../../components/ui/Icons';
import { useDocuments } from '../../hooks/useDocuments';
import { useDeleteDocument } from '../../hooks/useDeleteDocument';
import { DocumentItem } from '../../services/document.service';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
                ← Back
              </button>
            )}
            <h1 className="text-lg font-bold text-blue-900">Document Vault</h1>
          </div>
          <Button title="+ Upload Document" onClick={onNavigateToUpload} size="sm" variant="secondary" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Category Chips Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex gap-2 overflow-x-auto scrollbar-none">
          {DOC_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
            <Skeleton height={140} className="rounded-xl" />
            <Skeleton height={140} className="rounded-xl" />
          </div>
        ) : isError ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-sm text-rose-600 font-semibold mb-4">Unable to load document vault.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              Retry Vault Sync
            </button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
            <FolderIcon className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500 italic mb-4">No documents found in vault for selected filter.</p>
            <Button title="Upload First Document" onClick={onNavigateToUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((item: DocumentItem) => {
              const isVerified = item.verificationStatus === 'VERIFIED';
              const isRejected = item.verificationStatus === 'REJECTED';
              const statusVariant = isVerified ? 'success' : isRejected ? 'danger' : 'warning';

              return (
                <Card key={item.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <Badge label={item.documentType} variant="primary" />
                      <Badge label={item.verificationStatus} variant={statusVariant} />
                    </div>

                    <h3
                      onClick={() => onPreviewDocument(item.id)}
                      className="text-base font-bold text-slate-900 mb-1 hover:text-blue-900 cursor-pointer"
                    >
                      {item.fileName}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {(item.fileSize / 1024).toFixed(1)} KB • {item.mimeType} • Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {deleteConfirmId === item.id ? (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <span className="text-xs font-bold text-rose-800">Confirm deletion?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteConfirmed(item.id)}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded text-xs font-bold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                      <Button title="Preview Document" onClick={() => onPreviewDocument(item.id)} size="sm" variant="outline" />
                      <Button title="Delete" onClick={() => setDeleteConfirmId(item.id)} size="sm" variant="destructive" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
