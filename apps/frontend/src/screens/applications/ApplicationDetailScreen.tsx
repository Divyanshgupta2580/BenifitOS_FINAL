import React from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DocumentTextIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { useApplication } from '../../hooks/useApplication';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetailScreen: React.FC<Props> = ({ applicationId, onBack }) => {
  const { application: app, isLoading, isError, refetch } = useApplication(applicationId);

  if (isLoading) {
    return (
      <AppLayout activeTab="applications">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message="Fetching Application Review & Metadata..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || !app) {
    return (
      <AppLayout activeTab="applications">
        <main className="flex flex-col justify-center items-center min-h-[60vh] p-6 text-center">
          <div className="bg-[#0E1712] p-8 rounded-2xl border border-[#1C3127]/80 max-w-md w-full shadow-lg space-y-4">
            <p className="text-sm font-semibold text-rose-300">Could not load application details from server.</p>
            <button
              onClick={() => refetch()}
              className="w-full py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className="w-full py-2.5 rounded-xl bg-forest-900 border border-[#1C3127] text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Back to Applications
            </button>
          </div>
        </main>
      </AppLayout>
    );
  }

  const handleDownloadReceipt = () => {
    alert(`Downloading official application receipt for ${app.applicationNumber || app.id}...`);
  };

  const handleDownloadAck = () => {
    alert(`Downloading digitally signed acknowledgement slip...`);
  };

  const title = app.scheme?.title || `Application #${app.applicationNumber || app.id.slice(0, 8)}`;

  return (
    <AppLayout activeTab="applications">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-mint-400 hover:underline inline-flex items-center gap-1"
          >
            <span>← Back to Timeline</span>
          </button>
          <span className="text-xs font-mono font-bold text-amber-400">
            {app.applicationNumber || `APP-${app.id.slice(0, 8)}`}
          </span>
        </div>

        {/* Main Metadata Card */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400">
              {app.applicationNumber || `APP-${app.id.slice(0, 8)}`}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-mint-300">
              {app.status.replace(/_/g, ' ')}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            {title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-[#1C3127]/60">
            <div>
              <span className="font-semibold block text-slate-400">Department:</span>
              <span className="text-white font-bold">{app.scheme?.department || 'Welfare Department'}</span>
            </div>
            <div>
              <span className="font-semibold block text-slate-400">Submitted Date:</span>
              <span className="text-white font-bold">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Draft Mode'}</span>
            </div>
            <div>
              <span className="font-semibold block text-slate-400">Last Updated:</span>
              <span className="text-white font-bold">{new Date(app.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Attached Vault Documents */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white font-heading">
            Attached Vault Documents ({app.attachedDocumentIds?.length || 0})
          </h2>
          {app.attachedDocumentIds && app.attachedDocumentIds.length > 0 ? (
            <div className="space-y-2">
              {app.attachedDocumentIds.map((docId) => (
                <div
                  key={docId}
                  className="p-3.5 bg-forest-950/70 rounded-xl border border-[#1C3127] flex justify-between items-center text-xs"
                >
                  <span className="font-semibold text-slate-200 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-mint-400" />
                    <span>Linked Vault Document #{docId.slice(0, 8)}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/30 text-mint-300">
                    VERIFIED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No documents attached.</p>
          )}
        </div>

        {/* Official Downloads & Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="flex-1 py-3 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs shadow-md transition-all text-center"
          >
            Download Official Application Receipt
          </button>
          <button
            type="button"
            onClick={handleDownloadAck}
            className="flex-1 py-3 rounded-xl bg-forest-900 border border-[#1C3127] text-slate-200 hover:text-white hover:border-mint-500/40 text-xs font-semibold transition-all text-center"
          >
            Download Signed Acknowledgement Slip
          </button>
        </div>
      </div>
    </AppLayout>
  );
};
