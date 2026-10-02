import React, { useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { ClipboardListIcon, PlusIcon, ArrowRightIcon, CheckCircle2Icon, ClockIcon, AlertTriangleIcon } from '../../components/ui/Icons';
import { useApplications } from '../../hooks/useApplications';
import { ApplicationItem } from '../../services/application.service';
import { AppLayout } from '../../components/layout/AppLayout';

interface Props {
  onStartNewApplication: () => void;
  onSelectApplication: (id: string) => void;
  onSelectApplicationTimeline?: (id: string) => void;
  onBack?: () => void;
}

export const ApplicationsListScreen: React.FC<Props> = ({
  onStartNewApplication,
  onSelectApplication,
  onSelectApplicationTimeline,
  onBack,
}) => {
  const { applications, isLoading, isError, refetch } = useApplications();
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'ACTIVE' | 'APPROVED'>('ALL');

  const filteredApps = applications.filter((app) => {
    if (filter === 'DRAFT') return app.status === 'DRAFT';
    if (filter === 'ACTIVE') return app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' || app.status === 'DOCUMENT_VERIFICATION';
    if (filter === 'APPROVED') return app.status === 'APPROVED' || app.status === 'DISBURSED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'DISBURSED':
        return {
          bg: 'bg-emerald-950/80 border-emerald-500/40 text-mint-300',
          icon: <CheckCircle2Icon className="w-3 h-3 text-mint-400" />,
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-950/80 border-rose-900/60 text-rose-300',
          icon: <AlertTriangleIcon className="w-3 h-3 text-rose-400" />,
        };
      case 'DRAFT':
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          icon: <ClockIcon className="w-3 h-3 text-slate-400" />,
        };
      default:
        return {
          bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          icon: <ClockIcon className="w-3 h-3 text-amber-400" />,
        };
    }
  };

  return (
    <AppLayout activeTab="applications">
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
                Applications Portal
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track real-time workflow status, verification stages, and disbursement timelines.
            </p>
          </div>

          <button
            onClick={onStartNewApplication}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Apply for Scheme</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-4 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-white font-heading">
              Submitted Benefit Applications
            </h2>
            <p className="text-[11px] text-slate-400">
              Filter by application verification stage
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar">
            {(['ALL', 'DRAFT', 'ACTIVE', 'APPROVED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  filter === tab
                    ? 'bg-[#0B3B2B] border-mint-500/50 text-mint-300 shadow-xs'
                    : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'ALL'
                  ? `All (${applications.length})`
                  : tab === 'DRAFT'
                  ? 'Drafts'
                  : tab === 'ACTIVE'
                  ? 'Under Review'
                  : 'Approved'}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={160} className="rounded-2xl" />
            <Skeleton height={160} className="rounded-2xl" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl bg-[#160D10] border border-rose-900/60 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-300">Unable to load application records.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-10 text-center flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-950 border border-[#1C3127] flex items-center justify-center text-purple-400">
              <ClipboardListIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No applications match selected filter</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Apply for eligible welfare schemes to track your approval process here.
              </p>
            </div>
            <button
              onClick={onStartNewApplication}
              className="px-4 py-2 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 text-xs font-bold transition-colors"
            >
              Start First Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredApps.map((item: ApplicationItem) => {
              const title = item.scheme?.title || `Application #${item.applicationNumber || item.id.slice(0, 8)}`;
              const category = item.scheme?.category || 'WELFARE';
              const badge = getStatusBadge(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 p-5 shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {item.applicationNumber || `APP-${item.id.slice(0, 6)}`}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}
                      >
                        {badge.icon}
                        <span>{item.status.replace(/_/g, ' ')}</span>
                      </span>
                    </div>

                    <h3
                      onClick={() =>
                        onSelectApplicationTimeline
                          ? onSelectApplicationTimeline(item.id)
                          : onSelectApplication(item.id)
                      }
                      className="text-base font-bold text-white hover:text-mint-300 cursor-pointer transition-colors font-heading leading-snug"
                    >
                      {title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Category: {category.replace(/_/g, ' ')} • Submitted on{' '}
                      {new Date(item.createdAt || item.submittedAt || item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1C3127]/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        onSelectApplicationTimeline
                          ? onSelectApplicationTimeline(item.id)
                          : onSelectApplication(item.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-950 border border-[#1C3127] text-xs font-semibold text-slate-200 hover:text-white hover:border-mint-500/40 transition-all"
                    >
                      <span>Track Timeline</span>
                      <ArrowRightIcon className="w-3 h-3 text-mint-400" />
                    </button>

                    {item.scheme?.financialBenefit && (
                      <span className="text-xs font-black text-mint-300">
                        ₹{item.scheme.financialBenefit.toLocaleString('en-IN')} / Yr
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
