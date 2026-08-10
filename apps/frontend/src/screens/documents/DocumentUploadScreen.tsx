import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUploadDocument } from '../../hooks/useUploadDocument';

const TYPES = [
  'AADHAAR',
  'INCOME_CERTIFICATE',
  'RATION_CARD',
  'CASTE_CERTIFICATE',
  'DISABILITY_CERTIFICATE',
  'LAND_RECORD',
  'BANK_PASSBOOK',
  'VOTER_ID',
  'PAN_CARD',
  'OTHER',
];

interface Props {
  onBack: () => void;
}

export const DocumentUploadScreen: React.FC<Props> = ({ onBack }) => {
  const { uploadDocument, isUploading } = useUploadDocument();
  const [docType, setDocType] = useState('AADHAAR');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

      await uploadDocument(formData);
      setStatusMessage({ type: 'success', text: `${selectedFile.name} uploaded successfully!` });
      setTimeout(onBack, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not upload document.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Vault
          </button>
          <h1 className="text-lg font-bold text-blue-900">Upload Document</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          {statusMessage && (
            <div
              className={`mb-6 p-3.5 rounded-xl border text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Select Document Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPES.map((t) => {
                  const isSelected = docType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDocType(t)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50/70 text-blue-900 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Web File Input Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                2. Choose File (PDF, JPEG, PNG • Max 10MB)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpeg,.png,.jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📄</span>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-blue-900">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Click to browse or drag file here</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Supports .pdf, .jpg, .jpeg, .png</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" title="Upload Document to Vault" isLoading={isUploading} className="flex-1 py-3 font-bold" />
              <Button type="button" title="Cancel" variant="outline" onClick={onBack} className="px-6" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
