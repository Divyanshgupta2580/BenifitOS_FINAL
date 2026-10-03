import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem, NotificationType } from '../../services/notification.service';
import {
  BellIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  InfoIcon,
  SparklesIcon,
  FolderIcon,
  ClipboardListIcon,
  UserIcon,
  Trash2Icon,
  ExternalLinkIcon,
  LandmarkIcon,
  CheckIcon,
} from '../../components/ui/Icons';

type NotificationFilterTab = 'ALL' | 'UNREAD' | 'SCHEMES' | 'DOCUMENTS' | 'APPLICATIONS';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Recently';
  }
}

function getNotificationIcon(type: NotificationType, severity: string) {
  switch (type) {
    case 'SCHEME_ELIGIBILITY':
      return <SparklesIcon className="w-5 h-5 text-emerald-400" />;
    case 'DOCUMENT_REQUIRED':
      return <AlertTriangleIcon className="w-5 h-5 text-amber-400" />;
    case 'DOCUMENT_VERIFIED':
      return <CheckCircle2Icon className="w-5 h-5 text-emerald-400" />;
    case 'DOCUMENT_REJECTED':
      return <AlertTriangleIcon className="w-5 h-5 text-rose-400" />;
    case 'APPLICATION_SUBMITTED':
    case 'APPLICATION_STATUS_CHANGED':
      return <ClipboardListIcon className="w-5 h-5 text-mint-400" />;
    case 'PROFILE_INCOMPLETE':
      return <UserIcon className="w-5 h-5 text-teal-400" />;
    case 'AI_GUIDANCE':
      return <SparklesIcon className="w-5 h-5 text-indigo-400" />;
    default:
      if (severity === 'SUCCESS') return <CheckCircle2Icon className="w-5 h-5 text-emerald-400" />;
      if (severity === 'WARNING') return <AlertTriangleIcon className="w-5 h-5 text-amber-400" />;
      if (severity === 'ERROR') return <AlertTriangleIcon className="w-5 h-5 text-rose-400" />;
      return <BellIcon className="w-5 h-5 text-mint-400" />;
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'SUCCESS':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
          Success
        </span>
      );
    case 'WARNING':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
          Action Needed
        </span>
      );
    case 'ERROR':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/60">
          Urgent
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#16241D] text-mint-300 border border-[#264234]">
          Info
        </span>
      );
  }
}

export const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('ALL');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'UNREAD') return !n.isRead;
      if (activeTab === 'SCHEMES') return n.type === 'SCHEME_ELIGIBILITY' || !!n.metadata?.schemeId;
      if (activeTab === 'DOCUMENTS')
        return (
          n.type === 'DOCUMENT_REQUIRED' ||
          n.type === 'DOCUMENT_VERIFIED' ||
          n.type === 'DOCUMENT_REJECTED' ||
          !!n.metadata?.documentId
        );
      if (activeTab === 'APPLICATIONS')
        return (
          n.type === 'APPLICATION_SUBMITTED' ||
          n.type === 'APPLICATION_STATUS_CHANGED' ||
          !!n.metadata?.applicationId
        );
      return true;
    });
  }, [notifications, activeTab]);

  const handleActionClick = (n: NotificationItem) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }

    if (n.metadata?.schemeId) {
      navigate(`/schemes/${n.metadata.schemeId}`);
    } else if (n.metadata?.documentId) {
      navigate(`/documents/${n.metadata.documentId}`);
    } else if (n.metadata?.applicationId) {
      navigate(`/applications/${n.metadata.applicationId}/timeline`);
    } else if (n.type === 'PROFILE_INCOMPLETE') {
      navigate('/profile');
    } else if (n.type === 'SCHEME_ELIGIBILITY') {
      navigate('/schemes');
    }
  };

  return (
    <AppLayout activeTab="notifications">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1C3127]">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-mint-500/20 to-emerald-600/10 border border-mint-500/30 text-mint-400 shadow-sm">
                <BellIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span>Citizen Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/90 text-white shadow-sm animate-pulse">
                      {unreadCount} new
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Real-time welfare updates, statutory claim alerts, document reviews, and application tracking
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111C16] hover:bg-[#16241D] text-mint-300 hover:text-white border border-[#1C3127] hover:border-mint-500/40 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-mint-500/40 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4 text-mint-400" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#1C3127]/60">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'ALL'
                ? 'bg-[#0B3B2B] text-white border border-mint-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C16]'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('UNREAD')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'UNREAD'
                ? 'bg-[#0B3B2B] text-white border border-mint-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C16]'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SCHEMES')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'SCHEMES'
                ? 'bg-[#0B3B2B] text-white border border-mint-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C16]'
            }`}
          >
            <LandmarkIcon className="w-3.5 h-3.5" />
            <span>Schemes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'DOCUMENTS'
                ? 'bg-[#0B3B2B] text-white border border-mint-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C16]'
            }`}
          >
            <FolderIcon className="w-3.5 h-3.5" />
            <span>Documents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'APPLICATIONS'
                ? 'bg-[#0B3B2B] text-white border border-mint-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C16]'
            }`}
          >
            <ClipboardListIcon className="w-3.5 h-3.5" />
            <span>Applications</span>
          </button>
        </div>

        {/* Notifications List Container */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-[#0F1A14] border border-[#1C3127] rounded-2xl p-4 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#16241D] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#16241D] rounded w-1/3" />
                  <div className="h-3 bg-[#16241D] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-[#111C16] border border-rose-900/40 rounded-2xl space-y-3">
            <AlertTriangleIcon className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Failed to load notifications</h3>
            <p className="text-xs text-slate-400">
              Unable to reach notification gateway. Please verify your connection.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0A120E] border border-[#1C3127] rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#111C16] border border-[#1C3127] flex items-center justify-center text-slate-500 mx-auto">
              <CheckCircle2Icon className="w-6 h-6 text-mint-400/80" />
            </div>
            <h3 className="text-base font-semibold text-white">You're all caught up!</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              {activeTab === 'UNREAD'
                ? 'No unread notifications at this time.'
                : 'No notification records match the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const isUnread = !notification.isRead;
              const hasAction =
                !!notification.metadata?.schemeId ||
                !!notification.metadata?.documentId ||
                !!notification.metadata?.applicationId ||
                notification.type === 'PROFILE_INCOMPLETE' ||
                notification.type === 'SCHEME_ELIGIBILITY';

              let actionLabel = 'View details';
              if (notification.metadata?.schemeId || notification.type === 'SCHEME_ELIGIBILITY') {
                actionLabel = 'View Scheme';
              } else if (notification.metadata?.documentId) {
                actionLabel = 'View Document';
              } else if (notification.metadata?.applicationId) {
                actionLabel = 'Track Application';
              } else if (notification.type === 'PROFILE_INCOMPLETE') {
                actionLabel = 'Complete Profile';
              }

              return (
                <div
                  key={notification.id}
                  className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isUnread
                      ? 'bg-[#0E1A14] border-mint-500/40 shadow-sm hover:border-mint-500/60'
                      : 'bg-[#0A120E] border-[#1C3127] hover:border-[#264234] hover:bg-[#0D1611]'
                  }`}
                >
                  {/* Left: Indicator + Icon + Content */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Unread Glowing Dot */}
                    <div className="mt-1.5 shrink-0 flex items-center justify-center w-2 h-2">
                      {isUnread ? (
                        <span className="w-2 h-2 rounded-full bg-mint-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>

                    {/* Icon Container */}
                    <div className="p-2.5 rounded-xl bg-[#111C16] border border-[#1C3127] shrink-0">
                      {getNotificationIcon(notification.type, notification.severity)}
                    </div>

                    {/* Notification Body */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm tracking-tight ${
                            isUnread ? 'font-bold text-white' : 'font-semibold text-slate-200'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {getSeverityBadge(notification.severity)}
                        <span className="text-[11px] text-slate-500 font-medium">
                          • {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300/90 leading-relaxed break-words">
                        {notification.body}
                      </p>

                      {/* Required Documents / Metadata preview if present */}
                      {notification.metadata?.requiredDocuments &&
                        Array.isArray(notification.metadata.requiredDocuments) && (
                          <div className="mt-2 pt-2 border-t border-[#1C3127]/60 flex flex-wrap gap-1.5">
                            <span className="text-[10px] text-slate-400 font-medium self-center">
                              Documents:
                            </span>
                            {notification.metadata.requiredDocuments.map((docName: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#16241D] text-slate-300 border border-[#264234]"
                              >
                                {docName}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pl-7 sm:pl-0">
                    {hasAction && (
                      <button
                        type="button"
                        onClick={() => handleActionClick(notification)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111C16] hover:bg-mint-600/20 text-mint-300 hover:text-white border border-[#1C3127] hover:border-mint-500/50 transition-colors shadow-xs"
                      >
                        <span>{actionLabel}</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                        aria-label="Mark notification as read"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#16241D] border border-transparent hover:border-[#1C3127] transition-colors"
                      >
                        <CheckIcon className="w-4 h-4 text-slate-400 hover:text-mint-400" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                      aria-label="Delete notification"
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
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
