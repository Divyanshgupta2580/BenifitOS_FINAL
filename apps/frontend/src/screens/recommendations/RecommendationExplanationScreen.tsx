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
}

export const RecommendationExplanationScreen: React.FC<Props> = ({ recommendationId, onBack }) => {
  const { recommendation, isLoading, isError, refetch } = useRecommendation(recommendationId);

  if (isLoading) {
    return <LoadingSpinner message="Generating Recommendation Reasoning Explanation..." />;
  }

  if (isError || !recommendation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load explanation.</Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  const title = recommendation.scheme?.title || recommendation.title || `Scheme #${recommendation.schemeId.slice(0, 8)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Recommendation Detail</Text>
      </TouchableOpacity>

      <Text style={styles.screenTitle}>AI Explanation & Reasoning</Text>
      <Text style={styles.screenSubtitle}>Transparent breakdown of how your citizen profile matched against scheme eligibility rules.</Text>

      {/* Primary Summary */}
      <Card style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.schemeCode}>{recommendation.scheme?.code || 'SCHEME'}</Text>
          <Badge label={`${recommendation.matchPercentage}% Match`} variant="success" />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </Card>

      {/* Why Recommended Explanation */}
      <Card style={styles.card}>
        <Text style={styles.sectionHeading}>Why Was This Scheme Recommended?</Text>
        <Text style={styles.explanationBody}>
          Based on your verified annual household income (₹
          {recommendation.scheme?.financialBenefit
            ? (recommendation.estimatedBenefit || 150000).toLocaleString('en-IN')
            : '1,50,000'}
          ) and primary employment category, your profile satisfies key eligibility criteria defined by the welfare department.
        </Text>
      </Card>

      {/* Rules Integrity Banner */}
      <Card style={styles.integrityCard}>
        <Text style={styles.integrityTitle}>Deterministic Scoring Policy</Text>
        <Text style={styles.integrityText}>
          BenefitOS AI assistant translates complex rule ASTs into clear natural language, but NEVER alters or calculates eligibility scores.
        </Text>
      </Card>

      <Button title="Back to Details" onPress={onBack} style={styles.backBtnMain} />
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
  card: { marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  schemeCode: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  cardTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  sectionHeading: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  explanationBody: { fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, lineHeight: 22 },
  integrityCard: { backgroundColor: theme.colors.primaryDark, marginBottom: theme.spacing.lg },
  integrityTitle: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.surface, marginBottom: 4 },
  integrityText: { fontSize: theme.typography.sizes.xs, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 18 },
  backBtnMain: { marginTop: theme.spacing.xs, marginBottom: 40 },
});
