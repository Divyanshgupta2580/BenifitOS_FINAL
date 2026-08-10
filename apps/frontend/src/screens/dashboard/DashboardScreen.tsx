import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuthStore } from '../../store/auth.store';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { useRecommendations } from '../../hooks/useRecommendations';
import { useDocuments } from '../../hooks/useDocuments';
import { useApplications } from '../../hooks/useApplications';
import { useNotifications } from '../../hooks/useNotifications';
import { wsService } from '../../services/websocket-client';

interface Props {
  onNavigateToProfile: () => void;
  onNavigateToSchemes?: () => void;
  onNavigateToRecommendations?: () => void;
  onNavigateToVault?: () => void;
  onNavigateToApplications?: () => void;
  onNavigateToAi?: () => void;
  onNavigateToGovernmentServices?: () => void;
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
  const { user, logout } = useAuthStore();
  const { profile, isLoading: isProfileLoading, refetch: refetchProfile } = useCitizenProfile();
  const { recommendations, isLoading: isRecsLoading, refetch: refetchRecs } = useRecommendations();
  const { documents, isLoading: isDocsLoading, refetch: refetchDocs } = useDocuments();
  const { applications, isLoading: isAppsLoading, refetch: refetchApps } = useApplications();
  const { notifications, isLoading: isNotifsLoading, refetch: refetchNotifs } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);

  useEffect(() => {
    wsService.connect().then((socket) => {
      setIsWsConnected(socket.connected);
      socket.on('connect', () => setIsWsConnected(true));
      socket.on('disconnect', () => setIsWsConnected(false));
    });

    return () => {
      wsService.disconnect();
    };
  }, []);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center text-xl font-bold shadow-xs">
              🏛️
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">National Welfare Gateway</span>
              <h1 className="text-lg font-bold text-blue-900 leading-tight">BenefitOS Web</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToProfile}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center font-bold">
                {profile?.firstName?.charAt(0) || 'C'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-blue-900 block leading-none">
                  {profile ? `${profile.firstName} ${profile.lastName}` : user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-blue-700">{completionPct}% Complete</span>
              </div>
            </button>

            <Button title="Sign Out" onClick={logout} variant="outline" size="sm" />
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Sync & Realtime Status Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-medium text-slate-600">
              {isWsConnected ? 'Realtime Gateway Operational (/ws)' : 'Connecting to Realtime Gateway...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="text-xs text-blue-900 hover:underline font-medium mr-2"
            >
              {refreshing ? 'Refreshing...' : '🔄 Refresh Data'}
            </button>
            <Badge label={isWsConnected ? 'LIVE SYNC' : 'OFFLINE'} variant={isWsConnected ? 'success' : 'warning'} />
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
                  <span className="text-xl">🤖</span>
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
                }}
              />
            </div>

            {/* Top Scheme Recommendation Card */}
            <Card onClick={onNavigateToRecommendations} className="cursor-pointer">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <h2 className="text-base font-bold text-blue-900">Top Recommended Scheme</h2>
                </div>
                <span className="text-xs font-bold text-amber-700 hover:underline">View All Matches →</span>
              </div>

              {topScheme ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{topScheme.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{topScheme.department}</p>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                      {topScheme.matchPercentage}% Match
                    </span>
                    <span className="text-base font-extrabold text-amber-700">
                      ₹{topScheme.estimatedBenefit.toLocaleString('en-IN')} / Year
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Complete your profile to generate scheme recommendations.</p>
              )}
            </Card>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={onNavigateToGovernmentServices}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-700 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🏛️</span>
                <span className="text-xs font-bold text-slate-800">Govt Hub</span>
              </button>

              <button
                onClick={onNavigateToVault}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-700 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📜</span>
                <span className="text-xs font-bold text-slate-800">Doc Vault</span>
              </button>

              <button
                onClick={onNavigateToSchemes}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-700 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
                <span className="text-xs font-bold text-slate-800">All Schemes</span>
              </button>

              <button
                onClick={onNavigateToApplications}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-700 transition-all text-center flex flex-col items-center gap-2 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                <span className="text-xs font-bold text-slate-800">Applications</span>
              </button>
            </div>

            {/* Summary Widgets Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card onClick={onNavigateToVault} className="cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Vault</span>
                    <p className="text-3xl font-extrabold text-blue-900 mt-1">{documents.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Uploaded & OCR Verified Files</p>
                  </div>
                  <span className="text-2xl">📂</span>
                </div>
              </Card>

              <Card onClick={onNavigateToApplications} className="cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</span>
                    <p className="text-3xl font-extrabold text-blue-900 mt-1">{applications.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Submitted Welfare Benefits</p>
                  </div>
                  <span className="text-2xl">📝</span>
                </div>
              </Card>
            </div>

            {/* Recent Notifications Widget */}
            <Card>
              <h2 className="text-base font-bold text-blue-900 mb-3">Recent Notifications & Alerts</h2>
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="py-2.5">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{notif.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No recent alerts or updates.</p>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
};
