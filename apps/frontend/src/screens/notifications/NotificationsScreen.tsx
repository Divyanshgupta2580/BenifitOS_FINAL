import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem, NotificationType } from '../../services/notification.service';
import { AppLayout } from '../../components/layout/AppLayout';

// Lightweight SVGs replacing external lucide-react dependency
const BellIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CheckCheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Trash2Icon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RefreshCwIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const FileTextIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AlertTriangleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckCircle2Icon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldCheckIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const InboxIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const AlertCircleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

type FilterTab = 'ALL' | 'UNREAD' | 'SCHEMES' | 'DOCUMENTS' | 'APPLICATIONS';

export const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [isClearingConfirm, setIsClearingConfirm] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
    isMarkingRead,
    markAllAsRead,
    isMarkingAllRead,
    clearAllNotifications,
    isClearingAll,
    deleteNotification,
    isDeleting,
  } = useNotifications();

  // Categorization helpers
  const isSchemeNotification = (type: NotificationType) =>
    [
      'SCHEME_ELIGIBILITY',
      'NEW_SCHEME_ELIGIBLE',
      'BECAME_ELIGIBLE',
      'AGE_ELIGIBILITY_REACHED',
      'AI_GUIDANCE',
    ].includes(type);

  const isDocumentNotification = (type: NotificationType) =>
    ['DOCUMENT_REQUIRED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED'].includes(type);

  const isApplicationNotification = (type: NotificationType) =>
    ['APPLICATION_READY', 'APPLICATION_SUBMITTED', 'APPLICATION_STATUS_CHANGED'].includes(type);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'UNREAD':
        return notifications.filter((n) => !n.isRead);
      case 'SCHEMES':
        return notifications.filter((n) => isSchemeNotification(n.type));
      case 'DOCUMENTS':
        return notifications.filter((n) => isDocumentNotification(n.type));
      case 'APPLICATIONS':
        return notifications.filter((n) => isApplicationNotification(n.type));
      case 'ALL':
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const schemeCount = useMemo(
    () => notifications.filter((n) => isSchemeNotification(n.type)).length,
    [notifications],
  );
  const docCount = useMemo(
    () => notifications.filter((n) => isDocumentNotification(n.type)).length,
    [notifications],
  );
  const appCount = useMemo(
    () => notifications.filter((n) => isApplicationNotification(n.type)).length,
    [notifications],
  );

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif.id);
      } catch (err) {
        console.warn('Failed to mark notification as read:', err);
      }
    }

    // Destination handling
    const dest = notif.metadata?.destination;
    if (dest) {
      navigate(dest);
      return;
    }

    if (notif.metadata?.schemeId) {
      navigate(`/schemes/${notif.metadata.schemeId}`);
      return;
    }

    if (isDocumentNotification(notif.type)) {
      navigate('/documents');
      return;
    }

    if (isApplicationNotification(notif.type)) {
      navigate('/applications');
      return;
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setIsClearingConfirm(false);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: NotificationType, severity: string) => {
    switch (type) {
      case 'NEW_SCHEME_ELIGIBLE':
      case 'BECAME_ELIGIBLE':
      case 'AGE_ELIGIBILITY_REACHED':
      case 'SCHEME_ELIGIBILITY':
        return <SparklesIcon className="w-5 h-5 text-emerald-400" />;
      case 'DOCUMENT_REQUIRED':
        return <AlertTriangleIcon className="w-5 h-5 text-amber-400" />;
      case 'DOCUMENT_VERIFIED':
        return <CheckCircle2Icon className="w-5 h-5 text-emerald-400" />;
      case 'DOCUMENT_REJECTED':
        return <AlertCircleIcon className="w-5 h-5 text-rose-400" />;
      case 'APPLICATION_READY':
        return <ShieldCheckIcon className="w-5 h-5 text-sky-400" />;
      case 'APPLICATION_SUBMITTED':
      case 'APPLICATION_STATUS_CHANGED':
        return <FileTextIcon className="w-5 h-5 text-indigo-400" />;
      case 'AI_GUIDANCE':
        return <SparklesIcon className="w-5 h-5 text-purple-400" />;
      default:
        if (severity === 'SUCCESS') return <CheckCircle2Icon className="w-5 h-5 text-emerald-400" />;
        if (severity === 'WARNING') return <AlertTriangleIcon className="w-5 h-5 text-amber-400" />;
        if (severity === 'ERROR') return <AlertCircleIcon className="w-5 h-5 text-rose-400" />;
        return <InfoIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'SUCCESS':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'WARNING':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'ERROR':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <AppLayout activeTab="notifications">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
                  <BellIcon className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                    Notifications & Alerts
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                        {unreadCount} Unread
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-slate-400">
                    Real-time eligibility notices, statutory updates, and required action items.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                title="Refresh notifications"
              >
                <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead || unreadCount === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCheckIcon className="w-3.5 h-3.5" />
                {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
              </button>

              <button
                type="button"
                onClick={() => setIsClearingConfirm(true)}
                disabled={isClearingAll || notifications.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2Icon className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
              <span className="text-xs text-slate-400 block font-medium">Total Alerts</span>
              <span className="text-xl font-bold text-white mt-0.5 block">{notifications.length}</span>
            </div>
            <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
              <span className="text-xs text-slate-400 block font-medium">Unread</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{unreadCount}</span>
            </div>
            <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
              <span className="text-xs text-slate-400 block font-medium">Scheme Notices</span>
              <span className="text-xl font-bold text-sky-400 mt-0.5 block">{schemeCount}</span>
            </div>
            <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
              <span className="text-xs text-slate-400 block font-medium">Document Actions</span>
              <span className="text-xl font-bold text-amber-400 mt-0.5 block">{docCount}</span>
            </div>
          </div>
        </div>

        {/* Clear All Confirmation Modal */}
        {isClearingConfirm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <AlertTriangleIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Clear All Notifications?</h3>
              </div>
              <p className="text-sm text-slate-300">
                Are you sure you want to dismiss and clear all {notifications.length} notifications? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearingConfirm(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isClearingAll}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  {isClearingAll ? 'Clearing...' : 'Yes, Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            All
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700/60 text-slate-300">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('UNREAD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'UNREAD'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SCHEMES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'SCHEMES'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Scheme Alerts
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700/60 text-slate-300">
              {schemeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'DOCUMENTS'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Documents
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700/60 text-slate-300">
              {docCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'APPLICATIONS'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Applications
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700/60 text-slate-300">
              {appCount}
            </span>
          </button>
        </div>

        {/* Main Content Area */}
        {isLoading && notifications.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 animate-pulse flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-800/60 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-8 text-center space-y-3">
            <AlertCircleIcon className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Failed to Load Notifications</h3>
            <p className="text-xs text-rose-300/80 max-w-md mx-auto">
              {(error as any)?.message || 'An error occurred while fetching your notifications.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto text-slate-500 border border-slate-700/40">
              <InboxIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">No Notifications</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === 'UNREAD'
                ? "You're all caught up! There are no unread notifications."
                : activeTab === 'SCHEMES'
                ? 'No scheme eligibility alerts yet.'
                : activeTab === 'DOCUMENTS'
                ? 'No document notifications.'
                : activeTab === 'APPLICATIONS'
                ? 'No application updates.'
                : 'Your inbox is clear. When you qualify for schemes or receive updates, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.isRead;
              const hasDestination = Boolean(
                notif.metadata?.destination ||
                  notif.metadata?.schemeId ||
                  isDocumentNotification(notif.type) ||
                  isApplicationNotification(notif.type),
              );

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative rounded-xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
                    isUnread
                      ? 'bg-slate-900/90 border-slate-700/80 hover:border-slate-600 shadow-md shadow-black/20'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/60 hover:border-slate-700/50'
                  }`}
                >
                  {/* Left Unread Indicator Bar */}
                  {isUnread && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-full shadow-sm shadow-emerald-500/50" />
                  )}

                  <div className="flex items-start gap-3.5 sm:gap-4">
                    {/* Notification Type Icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      {getNotificationIcon(notif.type, notif.severity)}
                    </div>

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-semibold tracking-tight ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                            {notif.title}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getSeverityBadgeClass(
                              notif.severity,
                            )}`}
                          >
                            {notif.severity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatRelativeTime(notif.createdAt)}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {notif.body}
                      </p>

                      {/* Action Links & Footer */}
                      <div className="flex items-center justify-between gap-2 pt-2">
                        {hasDestination && (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                            <span>
                              {notif.metadata?.destination?.includes('/schemes') || notif.metadata?.schemeId
                                ? 'View Scheme Details'
                                : isDocumentNotification(notif.type)
                                ? 'Manage Documents'
                                : 'View Application'}
                            </span>
                            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        )}

                        <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notif.id)}
                              disabled={isMarkingRead}
                              className="text-[11px] font-medium text-slate-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-slate-800/80 transition-colors"
                              title="Mark as read"
                            >
                              Mark read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteNotification(notif.id)}
                            disabled={isDeleting}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
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

export default NotificationsScreen;
