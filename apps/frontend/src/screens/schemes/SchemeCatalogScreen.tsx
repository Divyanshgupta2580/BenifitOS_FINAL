import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSchemes } from '../../hooks/useSchemes';
import { WelfareSchemeDetail } from '../../services/welfare.service';

const CATEGORIES = [
  { id: 'ALL', label: 'All Schemes' },
  { id: 'AGRICULTURE', label: '🌾 Agriculture' },
  { id: 'HOUSING', label: '🏠 Housing' },
  { id: 'HEALTHCARE', label: '🏥 Healthcare' },
  { id: 'EDUCATION', label: '🎓 Education' },
  { id: 'FINANCIAL_INCLUSION', label: '💳 Financial' },
  { id: 'WOMEN_CHILD_DEVELOPMENT', label: '👩 Women & Child' },
];

interface Props {
  onSelectScheme: (schemeId: string) => void;
  onBack?: () => void;
}

export const SchemeCatalogScreen: React.FC<Props> = ({ onSelectScheme, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
  const { schemes, isLoading, isError, refetch } = useSchemes({
    category: categoryFilter,
    search: search || undefined,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderSchemeItem = ({ item }: { item: WelfareSchemeDetail }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onSelectScheme(item.id)}>
      <Card style={styles.schemeCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.codeText}>{item.code}</Text>
          <Badge label={item.category} variant="primary" />
        </View>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.deptText}>{item.department}</Text>
          <Text style={styles.benefitText}>₹{item.financialBenefit.toLocaleString('en-IN')}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.screenTitle}>Welfare Scheme Catalog</Text>
        <Text style={styles.screenSubtitle}>Browse central and state government benefits.</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by scheme name or code (e.g. PM-KISAN)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Chips Horizontal Scroll */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Virtualized List */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <Skeleton height={110} borderRadius={12} style={styles.skel} />
          <Skeleton height={110} borderRadius={12} style={styles.skel} />
          <Skeleton height={110} borderRadius={12} style={styles.skel} />
        </View>
      ) : isError ? (
        <View style={styles.errorWrapper}>
          <Text style={styles.errorText}>Unable to load scheme catalog.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : schemes.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>No welfare schemes found matching your search.</Text>
        </View>
      ) : (
        <FlatList
          data={schemes}
          keyExtractor={(item) => item.id}
          renderItem={renderSchemeItem}
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
  topHeader: { paddingHorizontal: theme.spacing.lg, paddingTop: 50, paddingBottom: theme.spacing.sm },
  backBtn: { marginBottom: 6 },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  screenTitle: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  screenSubtitle: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary, marginTop: 2 },
  searchContainer: { paddingHorizontal: theme.spacing.lg },
  chipsWrapper: { marginBottom: theme.spacing.sm },
  chipsContainer: { paddingHorizontal: theme.spacing.lg },
  chip: { backgroundColor: theme.colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.spacing.borderRadius.full, marginRight: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  chipTextActive: { color: theme.colors.surface, fontWeight: theme.typography.weights.bold },
  listContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  schemeCard: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  codeText: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  titleText: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 4 },
  descText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.spacing.xs, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  deptText: { fontSize: 10, color: theme.colors.textMuted },
  benefitText: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.success },
  loadingWrapper: { paddingHorizontal: theme.spacing.lg },
  skel: { marginBottom: theme.spacing.md },
  errorWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.danger, marginBottom: theme.spacing.md },
  retryBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: theme.spacing.borderRadius.md },
  retryText: { color: theme.colors.surface, fontWeight: theme.typography.weights.bold },
  emptyWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: theme.typography.sizes.md, color: theme.colors.textMuted, fontStyle: 'italic' },
});
