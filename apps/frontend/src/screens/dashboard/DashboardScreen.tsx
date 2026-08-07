import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
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
}

export const DashboardScreen: React.FC<Props> = ({
  onNavigateToProfile,
  onNavigateToSchemes,
  onNavigateToRecommendations,
  onNavigateToVault,
  onNavigateToApplications,
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* 1. Citizen Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste,</Text>
          <Text style={styles.name}>
            {profile ? `${profile.firstName} ${profile.lastName}` : user?.email || 'Citizen'}
          </Text>
        </View>
        <TouchableOpacity onPress={onNavigateToProfile} accessibilityLabel="View Citizen Profile">
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{completionPct}%</Text>
            <Text style={styles.profileBadgeSub}>Profile</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. Connection & Sync Status Indicator Bar */}
      <View style={styles.syncBar}>
        <View style={styles.syncIndicator}>
          <View style={[styles.syncDot, { backgroundColor: isWsConnected ? theme.colors.success : theme.colors.warning }]} />
          <Text style={styles.syncText}>
            {isWsConnected ? 'Realtime Gateway Connected' : 'Connecting to Gateway...'}
          </Text>
        </View>
        <Badge label={isWsConnected ? 'SYNCED' : 'OFFLINE MODE'} variant={isWsConnected ? 'success' : 'warning'} />
      </View>

      {/* Loading Skeletons */}
      {isLoadingInitial ? (
        <View style={styles.skeletonSection}>
          <Skeleton height={120} borderRadius={12} style={styles.skeletonSpacing} />
          <Skeleton height={90} borderRadius={12} style={styles.skeletonSpacing} />
          <Skeleton height={90} borderRadius={12} style={styles.skeletonSpacing} />
        </View>
      ) : (
        <>
          {/* 3. Recommended Schemes Summary Card */}
          <TouchableOpacity activeOpacity={0.85} onPress={onNavigateToRecommendations}>
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recommended Scheme</Text>
                <Text style={styles.detailsLink}>View All →</Text>
              </View>
              {topScheme ? (
                <View style={styles.schemePreview}>
                  <Text style={styles.schemeTitle}>{topScheme.title}</Text>
                  <Text style={styles.schemeDept}>{topScheme.department}</Text>
                  <View style={styles.schemeStatsRow}>
                    <Text style={styles.matchScore}>{topScheme.matchPercentage}% Match</Text>
                    <Text style={styles.benefitAmount}>₹{topScheme.estimatedBenefit.toLocaleString('en-IN')} / Year</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyText}>Complete your profile to generate scheme recommendations.</Text>
              )}
            </Card>
          </TouchableOpacity>

          {/* 4. Quick Government Action Buttons */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={onNavigateToProfile} accessibilityLabel="Citizen Profile">
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onNavigateToVault} accessibilityLabel="Document Vault">
              <Text style={styles.actionIcon}>📜</Text>
              <Text style={styles.actionText}>Doc Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onNavigateToSchemes} accessibilityLabel="Explore Schemes">
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Schemes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onNavigateToApplications} accessibilityLabel="Applications">
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Applications</Text>
            </TouchableOpacity>
          </View>

          {/* 5. Documents & Applications Summary Widgets */}
          <View style={styles.widgetsRow}>
            <Card style={styles.halfWidget}>
              <Text style={styles.widgetTitle}>Document Vault</Text>
              <Text style={styles.widgetNumber}>{documents.length}</Text>
              <Text style={styles.widgetSub}>Uploaded Documents</Text>
            </Card>

            <Card style={styles.halfWidget}>
              <Text style={styles.widgetTitle}>Applications</Text>
              <Text style={styles.widgetNumber}>{applications.length}</Text>
              <Text style={styles.widgetSub}>Submitted Benefits</Text>
            </Card>
          </View>

          {/* 6. AI Assistant Quick Access Banner */}
          <Card style={styles.aiBanner}>
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>AI Welfare Assistant</Text>
              <Text style={styles.aiDesc}>
                Chat or speak in your regional language to find eligible government welfare programs.
              </Text>
            </View>
            <Badge label="24/7 ASSISTANT" variant="warning" />
          </Card>

          {/* 7. Notifications Preview */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Recent Alerts</Text>
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notif) => (
                <View key={notif.id} style={styles.notifItem}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifBody}>{notif.body}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent alerts or updates.</Text>
            )}
          </Card>
        </>
      )}

      {/* Logout Action */}
      <Button title="Sign Out" onPress={logout} variant="outline" style={styles.logoutBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  greeting: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary },
  name: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  profileBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.spacing.borderRadius.md, alignItems: 'center' },
  profileBadgeText: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.surface },
  profileBadgeSub: { fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' },
  syncBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.spacing.borderRadius.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  syncIndicator: { flexDirection: 'row', alignItems: 'center' },
  syncDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  syncText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  card: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  cardTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  schemePreview: { marginTop: 4 },
  schemeTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  schemeDept: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  schemeStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.spacing.xs, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  detailsLink: { fontSize: theme.typography.sizes.xs, color: theme.colors.saffron, fontWeight: theme.typography.weights.semibold },
  matchScore: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.success },
  benefitAmount: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  actionBtn: { width: '23%', backgroundColor: theme.colors.surface, borderRadius: theme.spacing.borderRadius.md, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary },
  actionBtnDisabled: { width: '23%', backgroundColor: theme.colors.surface, borderRadius: theme.spacing.borderRadius.md, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, opacity: 0.6 },
  actionIcon: { fontSize: 20, marginBottom: 4 },
  actionText: { fontSize: 10, fontWeight: theme.typography.weights.medium, color: theme.colors.textPrimary },
  widgetsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  halfWidget: { width: '48%' },
  widgetTitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  widgetNumber: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginVertical: 2 },
  widgetSub: { fontSize: 10, color: theme.colors.textMuted },
  aiBanner: { backgroundColor: theme.colors.primaryDark, marginBottom: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiContent: { flex: 1, marginRight: theme.spacing.sm },
  aiTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.surface },
  aiDesc: { fontSize: theme.typography.sizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  notifItem: { paddingTop: 6, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  notifTitle: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary },
  notifBody: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic' },
  skeletonSection: { marginBottom: theme.spacing.md },
  skeletonSpacing: { marginBottom: theme.spacing.md },
  logoutBtn: { marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
});
