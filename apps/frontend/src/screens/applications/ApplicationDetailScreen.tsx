import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { DocumentTextIcon } from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useApplication } from '../../hooks/useApplication';

interface Props {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetailScreen: React.FC<Props> = ({ applicationId, onBack }) => {
  const { application: app, isLoading, isError, refetch } = useApplication(applicationId);

  if (isLoading) {
    return <LoadingSpinner message="Fetching Application Review & Metadata..." />;
  }

  if (isError || !app) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center transition-colors">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-xs">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-4">Could not load application details from server.</p>
          <Button title="Retry" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
            ← Back to Timeline
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">{app.applicationNumber || `APP-${app.id.slice(0, 8)}`}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Main Metadata Card */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">{app.applicationNumber || `APP-${app.id.slice(0, 8)}`}</span>
            <Badge
              label={app.status}
              variant={app.status === 'APPROVED' || app.status === 'DISBURSED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}
            />
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold block text-slate-700 dark:text-slate-300">Department:</span>
              <span>{app.scheme?.department || 'Welfare Department'}</span>
            </div>
            <div>
              <span className="font-semibold block text-slate-700 dark:text-slate-300">Submitted Date:</span>
              <span>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Draft Mode'}</span>
            </div>
            <div>
              <span className="font-semibold block text-slate-700 dark:text-slate-300">Last Updated:</span>
              <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        {/* Attached Vault Documents */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-3">
            Attached Vault Documents ({app.attachedDocumentIds?.length || 0})
          </h2>
          {app.attachedDocumentIds && app.attachedDocumentIds.length > 0 ? (
            <div className="space-y-2">
              {app.attachedDocumentIds.map((docId) => (
                <div key={docId} className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <DocumentTextIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Linked Vault Document #{docId.slice(0, 8)}</span>
                  </span>
                  <Badge label="LINKED" variant="primary" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No vault documents attached to this application.</p>
          )}
        </Card>

        {/* Verification Officer Remarks */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-2">Verification Officer Remarks</h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {app.officerRemarks || 'No officer remarks entered. Application is pending verification by the nodal officer.'}
          </p>
        </Card>

        {/* Disbursement Info */}
        {app.disbursementDetails && (
          <div className="bg-blue-950 text-white rounded-2xl p-6 shadow-md border border-blue-800 space-y-2">
            <h2 className="text-sm font-bold text-amber-400">Direct Benefit Transfer (DBT) Disbursement Details</h2>
            <p className="text-sm font-extrabold text-white">Amount: ₹{app.disbursementDetails.disbursedAmountINR.toLocaleString('en-IN')}</p>
            <p className="text-xs text-blue-200">Account: {app.disbursementDetails.accountNumberMasked} ({app.disbursementDetails.ifscCode})</p>
            <p className="text-xs text-blue-200">Ref Txn: {app.disbursementDetails.transactionReference}</p>
          </div>
        )}

        {/* Action CTAs */}
        <div className="space-y-3">
          <Button title="Download Official Application Receipt" onClick={handleDownloadReceipt} variant="secondary" className="w-full py-3 font-bold" />
          <Button title="Download Digitally Signed Acknowledgement Slip" onClick={handleDownloadAck} variant="outline" className="w-full py-2.5" />
          <Button title="Back to Timeline" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    </div>
  );
};
