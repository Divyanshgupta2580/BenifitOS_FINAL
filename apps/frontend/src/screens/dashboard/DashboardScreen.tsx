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
import { AppLayout } from "../../components/layout/AppLayout";
import { CitizenCopilotHero } from "../../components/dashboard/CitizenCopilotHero";
import { QuickAccessGrid } from "../../components/dashboard/QuickAccessGrid";
import { EligibleSchemesSection } from "../../components/dashboard/EligibleSchemesSection";
import { ActionsForYouSection } from "../../components/dashboard/ActionsForYouSection";
import { NeedGuidanceSection } from "../../components/dashboard/NeedGuidanceSection";
import { GatewayStatusCard } from "../../components/dashboard/GatewayStatusCard";
import { DashboardStatsCards } from "../../components/dashboard/DashboardStatsCards";
import { RecentNotificationsCard } from "../../components/dashboard/RecentNotificationsCard";
import { ErrorState } from "../../components/ui/ErrorState";

interface Props {
  onNavigateToProfile: () => void;
  onNavigateToSchemes: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToVault: () => void;
  onNavigateToApplications: () => void;
  onNavigateToAi: () => void;
  onNavigateToGovernmentServices: () => void;
  onNavigateToAiCopilot?: () => void;
  onNavigateToNotifications?: () => void;
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
  onNavigateToNotifications,
}) => {
  const { user, accessToken } = useAuthStore();
  const [wsStatus, setWsStatus] = useState<WsConnectionStatus>("DISCONNECTED");
  const [refreshing, setRefreshing] = useState(false);

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
  const completionPct = profile?.completionPercentage ?? 0;

  const citizenFullName =
    profile && (profile.firstName || profile.lastName) ?
      `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : (user?.email ? user.email.split('@')[0] : "Citizen");

  return (
    <AppLayout activeTab="dashboard">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 sm:space-y-8">
        {isLoadingInitial ? (
          <div className="space-y-6 animate-pulse">
            <Skeleton height={200} className="rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton height={80} className="rounded-xl" />
              <Skeleton height={80} className="rounded-xl" />
              <Skeleton height={80} className="rounded-xl" />
              <Skeleton height={80} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton height={320} className="rounded-2xl" />
              <Skeleton height={320} className="rounded-2xl" />
            </div>
          </div>
        ) : isPrimaryDataError ? (
          <ErrorState
            title="Dashboard Temporarily Unavailable"
            message="We could not load the information needed for your citizen dashboard. Please verify your connection or retry."
            onRetry={onRefresh}
            isRetrying={refreshing}
            retryLabel="Retry Connection"
          />
        ) : (
          <>
            {isSecondaryDataError && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-3 text-xs text-amber-200">
                Some secondary dashboard details are temporarily syncing.
              </div>
            )}

            {/* 1. Hero Panoramic Header */}
            <CitizenCopilotHero
              citizenName={citizenFullName}
              onLaunchCopilot={onNavigateToAiCopilot || onNavigateToAi}
              onFindSchemes={onNavigateToSchemes}
            />

            {/* 2. Quick Access Cards Grid */}
            <QuickAccessGrid
              onNavigateToProfile={onNavigateToProfile}
              onNavigateToSchemes={onNavigateToSchemes}
              onNavigateToApplications={onNavigateToApplications}
              onNavigateToVault={onNavigateToVault}
            />

            {/* 3. Schemes You Are Eligible For Section */}
            <EligibleSchemesSection
              recommendations={recommendations}
              onNavigateToSchemes={onNavigateToSchemes}
              onSelectScheme={(id) => onNavigateToSchemes()}
            />

            {/* 4. Actions for You Section (CRITICAL: Positioned BELOW Schemes, requiring scroll) */}
            <ActionsForYouSection
              onCompleteProfile={onNavigateToProfile}
              onUploadDocuments={onNavigateToVault}
              onCheckApplications={onNavigateToApplications}
              onExploreSchemes={onNavigateToSchemes}
              profileCompletionPercentage={completionPct}
              pendingDocumentsCount={documents.length === 0 ? 1 : 0}
            />

            {/* 5. Need Guidance? AI Assistance Section */}
            <NeedGuidanceSection
              onAskCopilot={onNavigateToAiCopilot || onNavigateToAi}
            />

            {/* 6. Realtime Gateway Operational Status & Statistics */}
            <div className="pt-2 space-y-6">
              <GatewayStatusCard
                wsStatus={wsStatus}
                isRefreshing={refreshing}
                onRefresh={onRefresh}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DashboardStatsCards
                  documentsCount={documents.length}
                  applicationsCount={applications.length}
                  onNavigateToVault={onNavigateToVault}
                  onNavigateToApplications={onNavigateToApplications}
                />
                <RecentNotificationsCard
                  notifications={notifications}
                  onNavigateToNotifications={onNavigateToNotifications || onNavigateToProfile}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};
