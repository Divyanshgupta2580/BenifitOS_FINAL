import React from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CheckCircle2Icon, AlertTriangleIcon, ClockIcon, ArrowRightIcon } from '../../components/ui/Icons';
import { useApplication } from '../../hooks/useApplication';
import { AppLayout } from '../../components/layout/AppLayout';
import { ErrorState } from '../../components/ui/ErrorState';

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
    return (
      <AppLayout activeTab="applications">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner message="Fetching Application Timeline Events..." />
        </div>
      </AppLayout>
    );
  }

  if (isError || !app) {
    return (
      <AppLayout activeTab="applications">
        <main className="flex flex-col justify-center items-center min-h-[60vh] p-6 text-center">
          <div className="max-w-md w-full">
            <ErrorState
              title="Timeline Unavailable"
              message="Could not load application timeline from the server. Please verify your connection."
              onRetry={() => refetch()}
              onSecondaryAction={onBack}
              secondaryActionLabel="Back to Applications"
            />
          </div>
        </main>
      </AppLayout>
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
    <AppLayout activeTab="applications">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-mint-400 hover:underline inline-flex items-center gap-1"
          >
            <span>← Back to Applications</span>
          </button>
          <span className="text-xs font-mono font-bold text-amber-400">
            {app.applicationNumber || `APP-${app.id.slice(0, 8)}`}
          </span>
        </div>

        {/* Header Banner */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 shadow-xl space-y-2">
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
          <p className="text-xs text-emerald-300/90 font-medium">
            {app.scheme?.department || 'Welfare Department'}
          </p>
        </div>

        {/* Timeline Events List */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-6 sm:p-7 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white font-heading">
            Application Status Lifecycle Timeline
          </h2>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#1C3127]">
            {statusSteps.map((stepItem) => {
              const state = getStepState(stepItem.key);

              return (
                <div key={stepItem.key} className="flex items-start gap-4 relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      state === 'COMPLETED'
                        ? 'bg-mint-400 text-forest-950 shadow-md shadow-mint-500/20'
                        : state === 'REJECTED'
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#080C0A] text-slate-500 border border-[#1C3127]'
                    }`}
                  >
                    {state === 'COMPLETED' ? (
                      <CheckCircle2Icon className="w-4 h-4" />
                    ) : state === 'REJECTED' ? (
                      <AlertTriangleIcon className="w-4 h-4" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h3
                      className={`text-sm font-bold ${
                        state === 'COMPLETED'
                          ? 'text-white'
                          : state === 'REJECTED'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {stepItem.label}
                    </h3>
                    <p className="text-xs text-slate-400">{stepItem.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(app.id)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-forest-900 border border-[#1C3127] text-slate-200 hover:text-white hover:border-mint-500/40 text-xs font-bold transition-all"
        >
          <span>View Detailed Application Submission Record</span>
          <ArrowRightIcon className="w-4 h-4 text-mint-400" />
        </button>
      </div>
    </AppLayout>
  );
};
