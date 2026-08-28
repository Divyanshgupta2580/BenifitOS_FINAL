import React, { useState, useEffect } from 'react';
import { WsConnectionStatus } from '../../services/websocket-client';
import { RefreshIcon, CalendarIcon, ClockIcon } from '../ui/Icons';

interface GatewayStatusCardProps {
  wsStatus: WsConnectionStatus;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const GatewayStatusCard: React.FC<GatewayStatusCardProps> = ({
  wsStatus,
  isRefreshing,
  onRefresh,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = currentDateTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Status mapping
  const isConnected = wsStatus === 'CONNECTED';
  const isConnecting = wsStatus === 'CONNECTING';
  const isError = wsStatus === 'ERROR';

  const statusTitle = isConnected
    ? 'Gateway Status: Operational'
    : isConnecting
    ? 'Gateway Status: Connecting...'
    : isError
    ? 'Gateway Status: Unavailable'
    : 'Gateway Status: Offline';

  const statusSubtitle = isConnected
    ? 'All systems are running normally'
    : isConnecting
    ? 'Establishing encrypted websocket handshake...'
    : isError
    ? 'Realtime gateway service encountered an issue'
    : 'Running in standard polling mode';

  const statusDotColor = isConnected
    ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse'
    : isConnecting
    ? 'bg-amber-500 shadow-xs shadow-amber-500/50 animate-pulse'
    : isError
    ? 'bg-rose-500 shadow-xs shadow-rose-500/50'
    : 'bg-slate-400';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors">
      {/* Left: Operational Status Indicator */}
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full shrink-0 ${statusDotColor}`} />
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>{statusTitle}</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {statusSubtitle}
          </p>
        </div>
      </div>

      {/* Right: Date + Time + Refresh + Live Sync Badge */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Date Display */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="hidden sm:inline">{formattedDate}</span>
          <span className="sm:hidden">{currentDateTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <ClockIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>{formattedTime}</span>
        </div>

        {/* Manual Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>

        {/* Live Sync Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide border ${
            isConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
              : isConnecting
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
          <span>{isConnected ? 'LIVE SYNC ((•))' : isConnecting ? 'CONNECTING...' : 'OFFLINE'}</span>
        </div>
      </div>
    </div>
  );
};
