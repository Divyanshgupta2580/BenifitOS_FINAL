import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { citizenApiService } from "../../services/citizen.service";
import { recommendationApiService } from "../../services/recommendation.service";
import { documentApiService } from "../../services/document.service";
import { applicationApiService } from "../../services/application.service";
import { notificationApiService } from "../../services/notification.service";
import { wsService, WsConnectionStatus } from "../../services/websocket-client";
import { Skeleton } from "../../components/ui/Skeleton";
import { GovernmentHeader } from "../../components/dashboard/GovernmentHeader";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";
import { GatewayStatusCard } from "../../components/dashboard/GatewayStatusCard";
import { CitizenCopilotHero } from "../../components/dashboard/CitizenCopilotHero";
import { TopRecommendedSchemeCard } from "../../components/dashboard/TopRecommendedSchemeCard";
import { QuickAccessGrid } from "../../components/dashboard/QuickAccessGrid";
import { DashboardStatsCards } from "../../components/dashboard/DashboardStatsCards";
import { RecentNotificationsCard } from "../../components/dashboard/RecentNotificationsCard";

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
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>("DISCONNECTED");
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("benefitos_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("benefitos_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isDesktop) {
      toggleSidebarCollapse();
      return;
    }
    setIsSidebarOpen((prev) => !prev);
  }, [isDesktop, toggleSidebarCollapse]);

  const isSidebarVisible = isDesktop ? !isSidebarCollapsed : isSidebarOpen;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setIsSidebarOpen(false);
      }
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Keyboard shortcut support: Alt+[ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "[") {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebarCollapse]);

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
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["citizen-profile", user?.id],
    queryFn: () => citizenApiService.getProfile(),
    enabled: !!user?.id,
  });

  const {
    data: recsData,
    isLoading: isRecsLoading,
    isError: isRecsError,
    refetch: refetchRecs,
  } = useQuery({
    queryKey: ["recommendations", user?.id],
    queryFn: () => recommendationApiService.getRecommendations(),
    enabled: !!user?.id,
  });

  const {
    data: docsData,
    isError: isDocsError,
    refetch: refetchDocs,
  } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: () => documentApiService.getDocuments(),
    enabled: !!user?.id,
  });

  const {
    data: appsData,
    isError: isAppsError,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ["applications", user?.id],
    queryFn: () => applicationApiService.getApplications(),
    enabled: !!user?.id,
  });

  const {
    data: notifsData,
    isError: isNotifsError,
    refetch: refetchNotifs,
  } = useQuery({
    queryKey: ["notifications", user?.id],
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

  const isLoadingInitial = isProfileLoading || isRecsLoading;
  const isPrimaryDataError =
    !isLoadingInitial && (isProfileError || isRecsError);
  const isSecondaryDataError = isDocsError || isAppsError || isNotifsError;
  const completionPct = profile?.completionPercentage || 0;
  const topScheme = recommendations[0];
  const unreadNotifsCount =
    notifications.filter((n) => !n.isRead).length ||
    (notifications.length > 0 ? notifications.length : 0);

  const citizenFullName =
    profile ?
      `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Government Portal Header */}
      <GovernmentHeader
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarVisible}
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
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
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
        <main
          className={`flex-1 min-w-0 ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"} flex flex-col transition-all duration-300`}
        >
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
            {/* 1. Realtime Gateway Operational Status */}
            <GatewayStatusCard
              wsStatus={wsStatus}
              isRefreshing={refreshing}
              onRefresh={onRefresh}
            />

            {isLoadingInitial ?
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
            : isPrimaryDataError ?
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
                <h2 className="text-base font-bold">
                  Dashboard data unavailable
                </h2>
                <p className="mt-1 text-sm text-rose-800 dark:text-rose-200">
                  We could not load the information needed for your dashboard.
                </p>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  className="mt-4 rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
                >
                  {refreshing ? "Retrying..." : "Retry"}
                </button>
              </div>
            : <>
                {isSecondaryDataError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
                    Some dashboard details are temporarily unavailable. Use
                    Refresh Data to try again.
                  </div>
                )}
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
                  onNavigateToGovernmentServices={
                    onNavigateToGovernmentServices
                  }
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
            }
          </div>
        </main>
      </div>
    </div>
  );
};
