import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DocumentTextIcon } from '../../components/ui/Icons';
import { useDocument } from '../../hooks/useDocument';

interface Props {
  documentId: string;
  onBack: () => void;
  onRunOcr?: (documentId: string) => void;
}

export const DocumentViewerModal: React.FC<Props> = ({ documentId, onBack, onRunOcr }) => {
  const { document: doc, isLoading, isError, refetch } = useDocument(documentId);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving Secure Presigned Document Metadata..." />;
  }

  if (isError || !doc) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-4">Could not load document preview from server.</p>
          <Button title="Retry" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  const handleDownload = () => {
    if (doc.storagePath && doc.storagePath.startsWith('http')) {
      window.open(doc.storagePath, '_blank');
    } else {
      alert(`Initiating download for ${doc.fileName}...`);
    }
  };

  const isImage = doc.mimeType?.startsWith('image/') || doc.fileName?.match(/\.(jpeg|jpg|png)$/i);
  const isPdf = doc.mimeType === 'application/pdf' || doc.fileName?.endsWith('.pdf');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Close Viewer
          </button>
          <span className="text-xs font-mono font-bold text-slate-500">{doc.fileName}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <Badge label={doc.documentType} variant="primary" />
            <Badge label={doc.verificationStatus} variant={doc.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1">{doc.fileName}</h2>
          <p className="text-xs text-slate-500 mb-6">
            {doc.mimeType} • {(doc.fileSize / 1024).toFixed(1)} KB • Path: {doc.storagePath}
          </p>

          {/* Web Preview Container */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 min-h-[320px] flex items-center justify-center mb-6 overflow-hidden">
            {isImage && doc.storagePath?.startsWith('http') ? (
              <img src={doc.storagePath} alt={doc.fileName} className="max-h-[500px] object-contain rounded-lg" />
            ) : isPdf && doc.storagePath?.startsWith('http') ? (
              <iframe src={doc.storagePath} title={doc.fileName} className="w-full h-[500px] rounded-lg border-0" />
            ) : (
              <div className="text-center p-8">
                <DocumentTextIcon className="w-12 h-12 text-slate-500 mb-3 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Secure Web Presigned Preview Ready</p>
                <p className="text-xs text-slate-500 mt-1">Ref: {doc.storagePath}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button title="Download File" onClick={handleDownload} variant="secondary" className="flex-1 py-2.5 font-bold" />
            {onRunOcr && (
              <Button
                title="Run AI Vision OCR Extraction"
                onClick={() => onRunOcr(doc.id)}
                variant="outline"
                className="flex-1 py-2.5 font-bold"
              />
            )}
          </div>
        </Card>

        <Button title="Close Viewer" variant="outline" onClick={onBack} className="w-full py-2.5" />
      </main>
    </div>
  );
};
