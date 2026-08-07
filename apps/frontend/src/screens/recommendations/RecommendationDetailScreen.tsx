import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useRecommendation } from '../../hooks/useRecommendation';

interface Props {
  recommendationId: string;
  onBack: () => void;
  onViewExplanation: (id: string) => void;
}

export const RecommendationDetailScreen: React.FC<Props> = ({
  recommendationId,
  onBack,
  onViewExplanation,
}) => {
  const { recommendation, isLoading, isError, refetch } = useRecommendation(recommendationId);

  if (isLoading) {
    return <LoadingSpinner message="Fetching Scheme Recommendation Reasoning..." />;
  }

  if (isError || !recommendation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load recommendation detail.</Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  const title = recommendation.scheme?.title || recommendation.title || `Scheme #${recommendation.schemeId.slice(0, 8)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Recommendations</Text>
      </TouchableOpacity>

      {/* Hero Match Card */}
      <Card style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <Badge label={recommendation.isEligible ? 'ELIGIBLE' : 'ACTION REQUIRED'} variant={recommendation.isEligible ? 'success' : 'warning'} />
          <Text style={styles.matchScoreText}>{recommendation.matchPercentage}% Match</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.benefitAmount}>₹{recommendation.estimatedBenefit.toLocaleString('en-IN')} Estimated Annual Benefit</Text>
      </Card>

      {/* Met Conditions */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Satisfied Criteria ({recommendation.criteriaMet?.length || 0})</Text>
        {recommendation.criteriaMet && recommendation.criteriaMet.length > 0 ? (
          recommendation.criteriaMet.map((c, idx) => (
            <View key={idx} style={styles.checkItem}>
              <Text style={styles.greenCheck}>✓</Text>
              <Text style={styles.itemText}>{c}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No evaluated criteria met.</Text>
        )}
      </Card>

      {/* Missing Conditions */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Missing Conditions ({recommendation.missingCriteria?.length || 0})</Text>
        {recommendation.missingCriteria && recommendation.missingCriteria.length > 0 ? (
          recommendation.missingCriteria.map((m, idx) => (
            <View key={idx} style={styles.warningItem}>
              <Text style={styles.amberWarn}>⚠️</Text>
              <Text style={styles.itemText}>{m}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Zero missing conditions! You satisfy all scheme requirements.</Text>
        )}
      </Card>

      {/* Missing Required Documents */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Missing Vault Documents ({recommendation.missingDocuments?.length || 0})</Text>
        {recommendation.missingDocuments && recommendation.missingDocuments.length > 0 ? (
          recommendation.missingDocuments.map((doc, idx) => (
            <View key={idx} style={styles.docItem}>
              <Badge label={doc} variant="warning" />
              <Text style={styles.docNote}>Required for submission</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>All required documents uploaded.</Text>
        )}
      </Card>

      {/* Explanation Trigger */}
      <Button
        title="View Full Natural Language Explanation"
        onPress={() => onViewExplanation(recommendation.id)}
        variant="secondary"
        style={styles.explainBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  backLink: { marginBottom: theme.spacing.md },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.danger, marginBottom: theme.spacing.md },
  retryBtn: { marginBottom: theme.spacing.sm },
  backBtn: { marginTop: theme.spacing.xs },
  heroCard: { backgroundColor: theme.colors.primary, marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  matchScoreText: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.saffronLight },
  title: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.surface, marginBottom: theme.spacing.xs },
  benefitAmount: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium, color: 'rgba(255, 255, 255, 0.9)' },
  sectionCard: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  greenCheck: { color: theme.colors.success, fontWeight: 'bold', marginRight: 8, fontSize: 14 },
  warningItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  amberWarn: { marginRight: 8, fontSize: 12 },
  itemText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, flex: 1 },
  docItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  docNote: { fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic' },
  explainBtn: { marginTop: theme.spacing.sm, marginBottom: 40 },
});
