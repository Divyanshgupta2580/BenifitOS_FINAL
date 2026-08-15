import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { citizenApiService } from '../../services/citizen.service';
import { recommendationApiService } from '../../services/recommendation.service';
import { documentApiService } from '../../services/document.service';
import { applicationApiService } from '../../services/application.service';
import { notificationApiService } from '../../services/notification.service';
import { wsService, WsConnectionStatus } from '../../services/websocket-client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BuildingIcon,
  DocumentTextIcon,
  TargetIcon,
  ClipboardListIcon,
  BotIcon,
  FolderIcon,
  RefreshIcon,
} from '../../components/ui/Icons';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

interface Props {
  onNavigateToProfile: () => void;
  onNavigateToSchemes: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToVault: () => void;
  onNavigateToApplications: () => void;
  onNavigateToAi: () => void;
  onNavigateToGovernmentServices: () => void;
  onNavigateToAiCopilot?: () => void;
}

export const DashboardScreen: React.FC<Props> = ({
  onNavigateToProfile,
  onNavigateToSchemes,
  onNavigateToRecommendations,
  onNavigateToVault,
  onNavigateToApplications,
  onNavigateToAi,
  onNavigateToGovernmentServices,
  onNavigateToAiCopilot,
}) => {
  const { user, accessToken, logout } = useAuthStore();
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('DISCONNECTED');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (accessToken) {
      wsService.connect();
      const unsub = wsService.subscribeStatus((status: WsConnectionStatus) => {
        setWsStatus(status);
      });
      return () => {
        unsub();
      };
    }
  }, [accessToken]);

  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['citizen-profile'],
    queryFn: () => citizenApiService.getProfile(),
  });

  const { data: recsData, isLoading: isRecsLoading, refetch: refetchRecs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationApiService.getRecommendations(),
  });

  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentApiService.getDocuments(),
  });

  const { data: appsData, refetch: refetchApps } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApiService.getApplications(),
  });

  const { data: notifsData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApiService.getNotifications(),
  });

  const profile = profileData?.profile;
  const recommendations = recsData?.recommendations || [];
  const documents = docsData?.documents || [];
  const applications = appsData?.applications || [];
  const notifications = notifsData?.notifications || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchProfile(),
      refetchRecs(),
      refetchDocs(),
      refetchApps(),
      refetchNotifs(),
    ]);
    setRefreshing(false);
  }, [refetchProfile, refetchRecs, refetchDocs, refetchApps, refetchNotifs]);

  const isLoadingInitial = isProfileLoading && isRecsLoading;
  const completionPct = profile?.completionPercentage || 0;
  const topScheme = recommendations[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 dark:bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <BuildingIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">National Welfare Gateway</span>
              <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400 leading-tight">BenefitOS Web</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onNavigateToProfile}
              className="flex items-center gap-2 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-750 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-900 dark:bg-blue-700 text-white text-xs flex items-center justify-center font-bold">
                {profile?.firstName?.charAt(0) || 'C'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block leading-none">
                  {profile ? `${profile.firstName} ${profile.lastName}` : user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400">{completionPct}% Complete</span>
              </div>
            </button>

            <Button title="Sign Out" onClick={logout} variant="outline" size="sm" />
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Sync & Realtime Status Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                wsStatus === 'CONNECTED'
                  ? 'bg-emerald-500 animate-pulse'
                  : wsStatus === 'CONNECTING'
                  ? 'bg-amber-500 animate-pulse'
                  : wsStatus === 'ERROR'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {wsStatus === 'CONNECTED'
                ? 'Realtime Gateway Operational (/ws)'
                : wsStatus === 'CONNECTING'
                ? 'Connecting to Realtime Gateway...'
                : wsStatus === 'ERROR'
                ? 'Realtime Gateway Unavailable'
                : 'Realtime Gateway Offline'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="text-xs text-blue-900 dark:text-blue-400 hover:underline font-medium mr-2 flex items-center gap-1"
            >
              <RefreshIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            <Badge
              label={
                wsStatus === 'CONNECTED'
                  ? 'LIVE SYNC'
                  : wsStatus === 'CONNECTING'
                  ? 'CONNECTING'
                  : 'OFFLINE'
              }
              variant={
                wsStatus === 'CONNECTED'
                  ? 'success'
                  : wsStatus === 'CONNECTING'
                  ? 'primary'
                  : 'warning'
              }
            />
          </div>
        </div>

        {isLoadingInitial ? (
          <div className="space-y-4">
            <Skeleton height={140} className="rounded-xl" />
            <Skeleton height={100} className="rounded-xl" />
            <Skeleton height={100} className="rounded-xl" />
          </div>
        ) : (
          <>
            {/* AI Citizen Copilot Banner */}
            <div
              onClick={onNavigateToAiCopilot || onNavigateToAi}
              className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md cursor-pointer hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-800"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BotIcon className="w-6 h-6 text-amber-400" />
                  <h2 className="text-xl font-bold tracking-tight">AI Citizen Copilot</h2>
                  <Badge label="COPILOT v5.3" variant="warning" className="ml-2" />
                </div>
                <p className="text-xs text-blue-100 max-w-2xl">
                  Your intelligent welfare journey advisor. Context-aware guidance in English & Hindi with vision document extraction.
                </p>
              </div>
              <Button
                title="Launch Copilot →"
                variant="secondary"
                size="md"
                onClick={(e) => {
                  e?.stopPropagation();
                  if (onNavigateToAiCopilot) onNavigateToAiCopilot();
                  else if (onNavigateToAi) onNavigateToAi();
                }}
              />
            </div>

            {/* Top Scheme Recommendation Card */}
            <Card onClick={onNavigateToRecommendations} className="cursor-pointer">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <h2 className="text-base font-bold text-blue-900 dark:text-blue-400">Top Recommended Scheme</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline">View All Matches →</span>
              </div>

              {topScheme ? (
                <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{topScheme.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{topScheme.department}</p>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg">
                      {topScheme.matchPercentage}% Match
                    </span>
                    <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">
                      ₹{topScheme.estimatedBenefit.toLocaleString('en-IN')} / Year
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">Complete your profile to generate scheme recommendations.</p>
              )}
            </Card>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={onNavigateToGovernmentServices}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-700 dark:hover:border-blue-500 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BuildingIcon className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Govt Hub</span>
              </button>

              <button
                onClick={onNavigateToVault}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-700 dark:hover:border-blue-500 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Doc Vault</span>
              </button>

              <button
                onClick={onNavigateToSchemes}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-700 dark:hover:border-blue-500 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TargetIcon className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">All Schemes</span>
              </button>

              <button
                onClick={onNavigateToApplications}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-700 dark:hover:border-blue-500 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardListIcon className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Applications</span>
              </button>
            </div>

            {/* Summary Widgets Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card onClick={onNavigateToVault} className="cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Vault</span>
                    <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 mt-1">{documents.length}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploaded & OCR Verified Files</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FolderIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </Card>

              <Card onClick={onNavigateToApplications} className="cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applications</span>
                    <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 mt-1">{applications.length}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submitted Welfare Benefits</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Notifications Widget */}
            <Card>
              <h2 className="text-base font-bold text-blue-900 dark:text-blue-400 mb-3">Recent Notifications & Alerts</h2>
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="py-2.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{notif.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{notif.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">No recent alerts or updates.</p>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
};
