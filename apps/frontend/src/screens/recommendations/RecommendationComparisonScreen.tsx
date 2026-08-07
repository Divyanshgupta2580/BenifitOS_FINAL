import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useRecommendationComparison } from '../../hooks/useRecommendationComparison';

interface Props {
  recommendationIds: string[];
  onBack: () => void;
}

export const RecommendationComparisonScreen: React.FC<Props> = ({ recommendationIds, onBack }) => {
  const { comparedRecommendations, isLoading, isError, refetch } = useRecommendationComparison(recommendationIds);

  if (isLoading) {
    return <LoadingSpinner message="Building Scheme Comparison Matrix..." />;
  }

  if (isError || comparedRecommendations.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load comparison data.</Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Recommendations</Text>
      </TouchableOpacity>

      <Text style={styles.screenTitle}>Scheme Comparison Matrix</Text>
      <Text style={styles.screenSubtitle}>Side-by-side comparison of selected welfare benefits.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <View style={styles.matrixContainer}>
          {comparedRecommendations.map((rec) => {
            const title = rec.scheme?.title || rec.title || `Scheme #${rec.schemeId.slice(0, 8)}`;
            return (
              <Card key={rec.id} style={styles.colCard}>
                <Badge label={rec.isEligible ? 'ELIGIBLE' : 'ACTION NEEDED'} variant={rec.isEligible ? 'success' : 'warning'} />
                <Text style={styles.colTitle} numberOfLines={2}>{title}</Text>

                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Match Score</Text>
                  <Text style={styles.matchValue}>{rec.matchPercentage}%</Text>
                </View>

                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Annual Benefit</Text>
                  <Text style={styles.benefitValue}>₹{rec.estimatedBenefit.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Criteria Met</Text>
                  <Text style={styles.countValue}>{rec.criteriaMet?.length || 0} Rules</Text>
                </View>

                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Missing Docs</Text>
                  <Text style={styles.countValue}>{rec.missingDocuments?.length || 0} Docs</Text>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <Button title="Back to List" onPress={onBack} style={styles.backBtnMain} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  backLink: { marginBottom: theme.spacing.md },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  screenTitle: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  screenSubtitle: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary, marginTop: 2, marginBottom: theme.spacing.md },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.danger, marginBottom: theme.spacing.md },
  retryBtn: { marginBottom: theme.spacing.sm },
  backBtn: { marginTop: theme.spacing.xs },
  horizontalScroll: { marginBottom: theme.spacing.lg },
  matrixContainer: { flexDirection: 'row' },
  colCard: { width: 220, marginRight: theme.spacing.md },
  colTitle: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginTop: theme.spacing.xs, marginBottom: theme.spacing.md, height: 40 },
  metricBlock: { marginBottom: theme.spacing.sm, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  metricLabel: { fontSize: 10, color: theme.colors.textMuted },
  matchValue: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.success },
  benefitValue: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  countValue: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary },
  backBtnMain: { marginTop: theme.spacing.xs, marginBottom: 40 },
});
