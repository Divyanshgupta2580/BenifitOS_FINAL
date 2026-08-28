import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { citizenApiService } from '../../services/citizen.service';
import { recommendationApiService } from '../../services/recommendation.service';
import { documentApiService } from '../../services/document.service';
import { applicationApiService } from '../../services/application.service';
import { notificationApiService } from '../../services/notification.service';
import { wsService, WsConnectionStatus } from '../../services/websocket-client';
import { Skeleton } from '../../components/ui/Skeleton';
import { GovernmentHeader } from '../../components/dashboard/GovernmentHeader';
import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { GatewayStatusCard } from '../../components/dashboard/GatewayStatusCard';
import { CitizenCopilotHero } from '../../components/dashboard/CitizenCopilotHero';
import { TopRecommendedSchemeCard } from '../../components/dashboard/TopRecommendedSchemeCard';
import { QuickAccessGrid } from '../../components/dashboard/QuickAccessGrid';
import { DashboardStatsCards } from '../../components/dashboard/DashboardStatsCards';
import { RecentNotificationsCard } from '../../components/dashboard/RecentNotificationsCard';

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
  const { user, accessToken } = useAuthStore();
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>('DISCONNECTED');
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // WebSocket Subscription
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

  // Real Data Queries
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['citizen-profile', user?.id],
    queryFn: () => citizenApiService.getProfile(),
    enabled: !!user?.id,
  });

  const { data: recsData, isLoading: isRecsLoading, refetch: refetchRecs } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => recommendationApiService.getRecommendations(),
    enabled: !!user?.id,
  });

  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: () => documentApiService.getDocuments(),
    enabled: !!user?.id,
  });

  const { data: appsData, refetch: refetchApps } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: () => applicationApiService.getApplications(),
    enabled: !!user?.id,
  });

  const { data: notifsData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationApiService.getNotifications(),
    enabled: !!user?.id,
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
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length || (notifications.length > 0 ? notifications.length : 0);

  const citizenFullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Government Portal Header */}
      <GovernmentHeader
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToNotifications={onNavigateToProfile}
        unreadNotificationsCount={unreadNotifsCount}
        profileCompletionPercentage={completionPct}
        citizenName={citizenFullName}
      />

      {/* Main Layout Area: Sidebar + Scrollable Content */}
      <div className="flex-1 flex w-full relative">
        {/* Vertical Portal Sidebar */}
        <DashboardSidebar
          activeTab="dashboard"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigateToDashboard={() => {}}
          onNavigateToAiCopilot={onNavigateToAiCopilot || onNavigateToAi}
          onNavigateToSchemes={onNavigateToSchemes}
          onNavigateToApplications={onNavigateToApplications}
          onNavigateToVault={onNavigateToVault}
          onNavigateToGovernmentServices={onNavigateToGovernmentServices}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToNotifications={onNavigateToProfile}
          unreadNotificationsCount={unreadNotifsCount}
        />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 min-w-0 lg:pl-64 flex flex-col transition-all duration-200">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
            {/* 1. Realtime Gateway Operational Status */}
            <GatewayStatusCard
              wsStatus={wsStatus}
              isRefreshing={refreshing}
              onRefresh={onRefresh}
            />

            {isLoadingInitial ? (
              <div className="space-y-5 animate-pulse">
                <Skeleton height={140} className="rounded-2xl" />
                <Skeleton height={120} className="rounded-2xl" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Skeleton height={90} className="rounded-xl" />
                  <Skeleton height={90} className="rounded-xl" />
                  <Skeleton height={90} className="rounded-xl" />
                  <Skeleton height={90} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton height={130} className="rounded-2xl" />
                  <Skeleton height={130} className="rounded-2xl" />
                </div>
              </div>
            ) : (
              <>
                {/* 2. AI Citizen Copilot Hero */}
                <CitizenCopilotHero
                  onLaunchCopilot={onNavigateToAiCopilot || onNavigateToAi}
                  copilotVersion="COPILOT v5.3"
                />

                {/* 3. Top Recommended Scheme */}
                <TopRecommendedSchemeCard
                  topScheme={topScheme}
                  onNavigateToRecommendations={onNavigateToRecommendations}
                />

                {/* 4. Quick Access Grid (4 Cards) */}
                <QuickAccessGrid
                  onNavigateToGovernmentServices={onNavigateToGovernmentServices}
                  onNavigateToVault={onNavigateToVault}
                  onNavigateToSchemes={onNavigateToSchemes}
                  onNavigateToApplications={onNavigateToApplications}
                />

                {/* 5. Document Vault + Applications Statistics */}
                <DashboardStatsCards
                  documentsCount={documents.length}
                  applicationsCount={applications.length}
                  onNavigateToVault={onNavigateToVault}
                  onNavigateToApplications={onNavigateToApplications}
                />

                {/* 6. Recent Notifications & Alerts */}
                <RecentNotificationsCard
                  notifications={notifications}
                  onNavigateToNotifications={onNavigateToProfile}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
