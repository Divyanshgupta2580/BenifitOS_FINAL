import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useApplications } from '../../hooks/useApplications';
import { ApplicationItem } from '../../services/application.service';

interface Props {
  onStartNewApplication: () => void;
  onSelectApplication: (id: string) => void;
  onSelectApplicationTimeline?: (id: string) => void;
  onBack?: () => void;
}

export const ApplicationsListScreen: React.FC<Props> = ({
  onStartNewApplication,
  onSelectApplication,
  onSelectApplicationTimeline,
  onBack,
}) => {
  const { applications, isLoading, isError, refetch } = useApplications();
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'ACTIVE' | 'APPROVED'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredApps = applications.filter((app) => {
    if (filter === 'DRAFT') return app.status === 'DRAFT';
    if (filter === 'ACTIVE') return app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' || app.status === 'DOCUMENT_VERIFICATION';
    if (filter === 'APPROVED') return app.status === 'APPROVED' || app.status === 'DISBURSED';
    return true;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'DISBURSED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'DRAFT':
        return 'warning';
      default:
        return 'warning';
    }
  };

  const renderItem = ({ item }: { item: ApplicationItem }) => {
    const title = item.scheme?.title || `Application #${item.applicationNumber || item.id.slice(0, 8)}`;
    const category = item.scheme?.category || 'WELFARE';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.appNumber}>{item.applicationNumber || `APP-${item.id.slice(0, 6)}`}</Text>
          <Badge label={item.status} variant={getStatusVariant(item.status)} />
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => (onSelectApplicationTimeline ? onSelectApplicationTimeline(item.id) : onSelectApplication(item.id))}>
          <Text style={styles.schemeTitle}>{title}</Text>
          <View style={styles.metaRow}>
            <Badge label={category} variant="primary" />
            <Text style={styles.dateText}>Updated {new Date(item.updatedAt).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.cardFooter}>
          <Text style={styles.docsCount}>{item.attachedDocumentIds?.length || 0} Vault Documents Linked</Text>
          <Button title="Track Timeline →" onPress={() => (onSelectApplicationTimeline ? onSelectApplicationTimeline(item.id) : onSelectApplication(item.id))} size="sm" variant="outline" />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>My Applications</Text>
          <Button title="+ Apply New" onPress={onStartNewApplication} size="sm" variant="secondary" />
        </View>
        <Text style={styles.screenSubtitle}>Track status of submitted welfare schemes and continue saved drafts.</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>All ({applications.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'DRAFT' && styles.filterTabActive]}
          onPress={() => setFilter('DRAFT')}
        >
          <Text style={[styles.filterText, filter === 'DRAFT' && styles.filterTextActive]}>Drafts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'ACTIVE' && styles.filterTabActive]}
          onPress={() => setFilter('ACTIVE')}
        >
          <Text style={[styles.filterText, filter === 'ACTIVE' && styles.filterTextActive]}>Under Review</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'APPROVED' && styles.filterTabActive]}
          onPress={() => setFilter('APPROVED')}
        >
          <Text style={[styles.filterText, filter === 'APPROVED' && styles.filterTextActive]}>Approved</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <Skeleton height={120} borderRadius={12} style={styles.skel} />
          <Skeleton height={120} borderRadius={12} style={styles.skel} />
          <Skeleton height={120} borderRadius={12} style={styles.skel} />
        </View>
      ) : isError ? (
        <View style={styles.errorWrapper}>
          <Text style={styles.errorText}>Unable to load application records.</Text>
          <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        </View>
      ) : filteredApps.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>No welfare applications match the selected filter.</Text>
          <Button title="Start First Application" onPress={onStartNewApplication} style={styles.applyFirstBtn} />
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topHeader: { paddingHorizontal: theme.spacing.lg, paddingTop: 50, paddingBottom: theme.spacing.xs },
  backBtn: { marginBottom: 6 },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  screenSubtitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2, marginBottom: theme.spacing.xs },
  filterRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.spacing.borderRadius.full, backgroundColor: theme.colors.surface, marginRight: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border },
  filterTabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  filterTextActive: { color: theme.colors.surface, fontWeight: theme.typography.weights.bold },
  listContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  card: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  appNumber: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  schemeTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginVertical: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  dateText: { fontSize: 10, color: theme.colors.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.spacing.xs, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  docsCount: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  loadingWrapper: { paddingHorizontal: theme.spacing.lg },
  skel: { marginBottom: theme.spacing.md },
  errorWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.danger, marginBottom: theme.spacing.md },
  retryBtn: { marginTop: theme.spacing.xs },
  emptyWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: theme.spacing.md },
  applyFirstBtn: { marginTop: theme.spacing.xs },
});
