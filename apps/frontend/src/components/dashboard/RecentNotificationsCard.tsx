import React from 'react';
import { BellIcon, ArrowRightIcon, InfoIcon, CheckCircleIcon, AlertTriangleIcon } from '../ui/Icons';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  isRead?: boolean;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | string;
}

interface RecentNotificationsCardProps {
  notifications: NotificationItem[];
  onNavigateToNotifications?: () => void;
}

export const RecentNotificationsCard: React.FC<RecentNotificationsCardProps> = ({
  notifications,
  onNavigateToNotifications,
}) => {
  const getNotificationIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'WARNING':
      case 'ERROR':
        return <AlertTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <InfoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
            Recent Notifications &amp; Alerts
          </h2>
        </div>

        {onNavigateToNotifications && (
          <button
            type="button"
            onClick={onNavigateToNotifications}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Body */}
      {notifications.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.slice(0, 4).map((notif) => (
            <div key={notif.id} className="py-3 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {getNotificationIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {notif.title}
                  </h3>
                  {notif.createdAt && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {notif.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            No new notifications or alerts at this time.
          </p>
        </div>
      )}
    </div>
  );
};
