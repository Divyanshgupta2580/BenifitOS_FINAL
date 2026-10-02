import React, { useState } from 'react';
import { DocumentTextIcon, CheckCircle2Icon, AlertTriangleIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { useUploadDocument } from '../../hooks/useUploadDocument';
import { AppLayout } from '../../components/layout/AppLayout';

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
      setStatusMessage({ type: 'error', text: 'Please select a document file to upload.' });
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
        text: 'Document verified & uploaded',
        uploadedName: selectedTypeLabel,
        detectedName: detectedLabel,
        status: 'Verified',
      });
      setTimeout(onBack, 1500);
    } catch (err: any) {
      const selectedTypeLabel = TYPES.find((t) => t.id === docType)?.label || docType;
      let errMsg = err.message || `Incorrect document format. Please upload a valid ${selectedTypeLabel}.`;
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
    <AppLayout activeTab="vault">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-[#1C3127]/60 pb-4">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-semibold text-mint-400 hover:underline mb-1 block"
            >
              ← Back to Vault
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Upload Citizen Document
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely upload identity or eligibility certificates for automated OCR verification.
            </p>
          </div>
        </div>

        {/* Upload Form Card */}
        <form
          onSubmit={handleUpload}
          className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-5"
        >
          {/* Document Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#080C0A] text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Drag and Drop / File Input Zone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Document File (PDF, PNG, JPG up to 10 MB)
            </label>
            <label className="border-2 border-dashed border-[#1C3127] hover:border-mint-500/50 bg-[#080C0A] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-forest-950 border border-[#1C3127] flex items-center justify-center text-mint-400 group-hover:scale-105 transition-transform">
                <DocumentTextIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white group-hover:text-mint-300 transition-colors">
                  {selectedFile ? selectedFile.name : 'Click or drag document to upload'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : 'Supported: PDF, JPEG, PNG (Max 10 MB)'}
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-mint-300'
                  : 'bg-rose-950/80 border border-rose-900/60 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2Icon className="w-4 h-4 text-mint-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{statusMessage.text}</p>
                {statusMessage.uploadedName && (
                  <p className="mt-1 text-[11px] text-slate-300">
                    Target: {statusMessage.uploadedName} • OCR Result: {statusMessage.detectedName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-mint-400 hover:bg-mint-300 disabled:opacity-50 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <span>{isUploading ? 'Uploading & Processing OCR...' : 'Upload & Verify Document'}</span>
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
};
