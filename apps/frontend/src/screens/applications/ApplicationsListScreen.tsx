import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ClipboardListIcon } from '../../components/ui/Icons';
import { useApplications } from '../../hooks/useApplications';
import { ApplicationItem } from '../../services/application.service';

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'DISBURSED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'DRAFT':
        return 'warning';
      default:
        return 'warning';
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
            <h1 className="text-lg font-bold text-blue-900">Applications Portal</h1>
          </div>
          <Button title="+ Apply for Scheme" onClick={onStartNewApplication} size="sm" variant="secondary" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Header & Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-blue-900">Submitted Welfare Benefit Applications</h2>
            <p className="text-xs text-slate-500">Track real-time workflow status and lifecycle timeline.</p>
          </div>

          <div className="flex gap-2">
            {(['ALL', 'DRAFT', 'ACTIVE', 'APPROVED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  filter === tab
                    ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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

        {/* Applications List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={150} className="rounded-xl" />
            <Skeleton height={150} className="rounded-xl" />
          </div>
        ) : isError ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-sm text-rose-600 font-semibold mb-4">Unable to load application records.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
            <ClipboardListIcon className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500 italic mb-4">No welfare applications match the selected filter.</p>
            <Button title="Start First Application" onClick={onStartNewApplication} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((item: ApplicationItem) => {
              const title = item.scheme?.title || `Application #${item.applicationNumber || item.id.slice(0, 8)}`;
              const category = item.scheme?.category || 'WELFARE';

              return (
                <Card key={item.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono font-bold text-amber-700">
                        {item.applicationNumber || `APP-${item.id.slice(0, 6)}`}
                      </span>
                      <Badge label={item.status} variant={getStatusVariant(item.status)} />
                    </div>

                    <h3
                      onClick={() => (onSelectApplicationTimeline ? onSelectApplicationTimeline(item.id) : onSelectApplication(item.id))}
                      className="text-base font-bold text-slate-900 mb-2 hover:text-blue-900 cursor-pointer"
                    >
                      {title}
                    </h3>

                    <div className="flex justify-between items-center mb-4">
                      <Badge label={category} variant="primary" />
                      <span className="text-[11px] text-slate-500">Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{item.attachedDocumentIds?.length || 0} Vault Docs Linked</span>
                    <Button
                      title="Track Timeline →"
                      onClick={() => (onSelectApplicationTimeline ? onSelectApplicationTimeline(item.id) : onSelectApplication(item.id))}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
