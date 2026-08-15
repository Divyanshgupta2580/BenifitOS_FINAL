import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { DocumentTextIcon } from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useUploadDocument } from '../../hooks/useUploadDocument';

const TYPES = [
  { id: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
  { id: 'EDUCATIONAL_CERTIFICATE', label: 'Educational Certificate/Marksheet' },
  { id: 'DISABILITY_CERTIFICATE', label: 'Disability Certificate' },
  { id: 'CASTE_CERTIFICATE', label: 'Caste Certificate' },
  { id: 'AADHAAR', label: 'Aadhaar Card' },
  { id: 'DRIVING_LICENSE', label: 'Driving Licence' },
  { id: 'VOTER_ID', label: 'Voter ID' },
];

interface Props {
  onBack: () => void;
}

export const DocumentUploadScreen: React.FC<Props> = ({ onBack }) => {
  const { uploadDocument, isUploading } = useUploadDocument();
  const [docType, setDocType] = useState('AADHAAR');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    uploadedName?: string;
    detectedName?: string;
    status?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxLimitInBytes = 10 * 1024 * 1024; // 10 MB
      if (file.size > maxLimitInBytes) {
        setStatusMessage({ type: 'error', text: 'File size exceeds maximum allowed limit of 10 MB.' });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!selectedFile) {
      setStatusMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('file', selectedFile);

      const res: any = await uploadDocument(formData);
      const selectedTypeLabel = TYPES.find((t) => t.id === docType)?.label || docType;
      const detectedLabel = res?.classification?.displayName || selectedTypeLabel;

      setStatusMessage({
        type: 'success',
        text: 'Document verified',
        uploadedName: selectedTypeLabel,
        detectedName: detectedLabel,
        status: 'Verified',
      });
      setTimeout(onBack, 1500);
    } catch (err: any) {
      const selectedTypeLabel = TYPES.find((t) => t.id === docType)?.label || docType;
      let errMsg = err.message || `Incorrect document. Please upload your ${selectedTypeLabel}.`;
      if (typeof err?.response?.data?.message === 'string') {
        errMsg = err.response.data.message;
      }
      setStatusMessage({
        type: 'error',
        text: errMsg,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
            ← Back to Vault
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">Upload Document</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-xl border text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              <p className="font-bold text-sm mb-1">{statusMessage.text}</p>
              {statusMessage.type === 'success' && (
                <div className="mt-2 space-y-0.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <p><span className="font-semibold">Uploaded:</span> {statusMessage.uploadedName}</p>
                  <p><span className="font-semibold">Detected:</span> {statusMessage.detectedName}</p>
                  <p><span className="font-semibold">Status:</span> {statusMessage.status}</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                1. Select Document Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPES.map((t) => {
                  const isSelected = docType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDocType(t.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        isSelected
                          ? 'border-blue-900 dark:border-blue-700 bg-blue-50/70 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Web File Input Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                2. Choose File (PDF, JPEG, PNG • Max 10MB)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpeg,.png,.jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <DocumentTextIcon className="w-10 h-10 text-blue-900 dark:text-blue-400" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-300">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Click to browse or drag file here</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Supports .pdf, .jpg, .jpeg, .png</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" title="Upload Document to Vault" isLoading={isUploading} className="flex-1 py-3 font-bold" />
              <Button type="button" title="Cancel" variant="outline" onClick={onBack} className="px-6" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
