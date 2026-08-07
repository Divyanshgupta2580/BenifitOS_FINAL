import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useRecommendations } from '../../hooks/useRecommendations';
import { SchemeRecommendationItem } from '../../services/recommendation.service';

interface Props {
  onSelectRecommendation: (id: string) => void;
  onCompareRecommendations: (ids: string[]) => void;
  onBack?: () => void;
}

export const RecommendationDashboardScreen: React.FC<Props> = ({
  onSelectRecommendation,
  onCompareRecommendations,
  onBack,
}) => {
  const { recommendations, isLoading, isError, refetch } = useRecommendations();
  const [filter, setFilter] = useState<'ALL' | 'ELIGIBLE' | 'ACTION_REQUIRED'>('ALL');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredRecs = recommendations.filter((r) => {
    if (filter === 'ELIGIBLE') return r.isEligible;
    if (filter === 'ACTION_REQUIRED') return !r.isEligible;
    return true;
  });

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const renderItem = ({ item }: { item: SchemeRecommendationItem }) => {
    const isSelected = selectedForCompare.includes(item.id);
    const title = item.scheme?.title || item.title || `Scheme #${item.schemeId.slice(0, 8)}`;
    const category = item.scheme?.category || item.category || 'WELFARE';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={() => toggleSelectForCompare(item.id)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.codeText}>{item.scheme?.code || item.code || 'SCHEME'}</Text>
          </TouchableOpacity>
          <Badge label={category} variant="primary" />
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => onSelectRecommendation(item.id)}>
          <Text style={styles.titleText}>{title}</Text>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Match Score</Text>
              <Text style={styles.matchText}>{item.matchPercentage}%</Text>
            </View>
            <View style={styles.rightStat}>
              <Text style={styles.statLabel}>Est. Financial Benefit</Text>
              <Text style={styles.benefitText}>₹{item.estimatedBenefit.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Badge
              label={item.isEligible ? 'ELIGIBLE' : 'ACTION REQUIRED'}
              variant={item.isEligible ? 'success' : 'warning'}
            />
            <Text style={styles.detailsLink}>View Reasoning →</Text>
          </View>
        </TouchableOpacity>
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
        <Text style={styles.screenTitle}>AI & Boolean Recommendations</Text>
        <Text style={styles.screenSubtitle}>
          Deterministic welfare scheme matches computed by backend rules engine.
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>All ({recommendations.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'ELIGIBLE' && styles.filterTabActive]}
          onPress={() => setFilter('ELIGIBLE')}
        >
          <Text style={[styles.filterText, filter === 'ELIGIBLE' && styles.filterTextActive]}>Eligible</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'ACTION_REQUIRED' && styles.filterTabActive]}
          onPress={() => setFilter('ACTION_REQUIRED')}
        >
          <Text style={[styles.filterText, filter === 'ACTION_REQUIRED' && styles.filterTextActive]}>Action Needed</Text>
        </TouchableOpacity>
      </View>

      {/* Compare Floating Trigger */}
      {selectedForCompare.length > 1 && (
        <View style={styles.compareBar}>
          <Text style={styles.compareCount}>{selectedForCompare.length} Schemes Selected</Text>
          <Button
            title="Compare Schemes"
            onPress={() => onCompareRecommendations(selectedForCompare)}
            size="sm"
            variant="secondary"
          />
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <Skeleton height={120} borderRadius={12} style={styles.skel} />
          <Skeleton height={120} borderRadius={12} style={styles.skel} />
          <Skeleton height={120} borderRadius={12} style={styles.skel} />
        </View>
      ) : isError ? (
        <View style={styles.errorWrapper}>
          <Text style={styles.errorText}>Unable to calculate recommendations.</Text>
          <Button title="Retry Evaluation" onPress={() => refetch()} style={styles.retryBtn} />
        </View>
      ) : filteredRecs.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>No scheme recommendations match the selected filter.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecs}
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
  screenTitle: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  screenSubtitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.spacing.borderRadius.full, backgroundColor: theme.colors.surface, marginRight: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border },
  filterTabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  filterTextActive: { color: theme.colors.surface, fontWeight: theme.typography.weights.bold },
  compareBar: { backgroundColor: theme.colors.primaryDark, paddingHorizontal: theme.spacing.lg, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compareCount: { fontSize: theme.typography.sizes.sm, color: theme.colors.surface, fontWeight: theme.typography.weights.bold },
  listContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  card: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: theme.colors.primary, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.colors.primary },
  checkmark: { color: theme.colors.surface, fontSize: 12, fontWeight: 'bold' },
  codeText: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  titleText: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm, paddingVertical: 6, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.sm, borderRadius: theme.spacing.borderRadius.md },
  statLabel: { fontSize: 10, color: theme.colors.textMuted },
  matchText: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.success },
  rightStat: { alignItems: 'flex-end' },
  benefitText: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsLink: { fontSize: theme.typography.sizes.xs, color: theme.colors.primary, fontWeight: theme.typography.weights.semibold },
  loadingWrapper: { paddingHorizontal: theme.spacing.lg },
  skel: { marginBottom: theme.spacing.md },
  errorWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.danger, marginBottom: theme.spacing.md },
  retryBtn: { marginTop: theme.spacing.xs },
  emptyWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic' },
});
