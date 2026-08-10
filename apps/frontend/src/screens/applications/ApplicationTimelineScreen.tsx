import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApplication } from '../../hooks/useApplication';

interface Props {
  applicationId: string;
  onBack: () => void;
  onViewDetails: (id: string) => void;
}

export const ApplicationTimelineScreen: React.FC<Props> = ({
  applicationId,
  onBack,
  onViewDetails,
}) => {
  const { application: app, isLoading, isError, refetch } = useApplication(applicationId);

  if (isLoading) {
    return <LoadingSpinner message="Fetching Application Timeline Events..." />;
  }

  if (isError || !app) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-4">Could not load application timeline from server.</p>
          <Button title="Retry" onClick={() => refetch()} className="w-full mb-2 py-2.5" />
          <Button title="Back" variant="outline" onClick={onBack} className="w-full py-2.5" />
        </div>
      </main>
    );
  }

  const title = app.scheme?.title || `Application #${app.applicationNumber || app.id.slice(0, 8)}`;
  const statusSteps = [
    { key: 'SUBMITTED', label: 'Application Submitted', desc: 'Submitted to Department Portal' },
    { key: 'UNDER_REVIEW', label: 'Under Nodal Review', desc: 'Assigned to Verification Officer' },
    { key: 'DOCUMENT_VERIFICATION', label: 'Document Audit', desc: 'Cross-checking vault certificates' },
    { key: 'APPROVED', label: 'Sanction Approved', desc: 'Sanction order generated' },
    { key: 'DISBURSED', label: 'Direct Benefit Transfer', desc: 'DBT funds credited to bank account' },
  ];

  const getStepState = (stepKey: string) => {
    const statusOrder = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED', 'DISBURSED'];
    const currentIdx = statusOrder.indexOf(app.status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (app.status === 'REJECTED' && stepKey === 'APPROVED') {
      return 'REJECTED';
    }
    if (stepIdx <= currentIdx) return 'COMPLETED';
    return 'PENDING';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
            ← Back to Applications
          </button>
          <span className="text-xs font-mono font-bold text-amber-700">{app.applicationNumber || `APP-${app.id.slice(0, 8)}`}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Header Banner */}
        <Card>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono font-bold text-amber-700">{app.applicationNumber || `APP-${app.id.slice(0, 8)}`}</span>
            <Badge
              label={app.status}
              variant={app.status === 'APPROVED' || app.status === 'DISBURSED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500">{app.scheme?.department || 'Welfare Department'}</p>
        </Card>

        {/* Timeline */}
        <Card>
          <h2 className="text-base font-bold text-blue-900 mb-6">Status Lifecycle Timeline</h2>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {statusSteps.map((stepItem, idx) => {
              const state = getStepState(stepItem.key);

              return (
                <div key={stepItem.key} className="flex items-start gap-4 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      state === 'COMPLETED'
                        ? 'bg-emerald-600 text-white'
                        : state === 'REJECTED'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {state === 'COMPLETED' ? '✓' : state === 'REJECTED' ? '✕' : idx + 1}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{stepItem.label}</h3>
                    <p className="text-xs text-slate-500">{stepItem.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Button
          title="View Application Details & Remarks →"
          variant="secondary"
          onClick={() => onViewDetails(app.id)}
          className="w-full py-3 font-bold"
        />
      </main>
    </div>
  );
};
