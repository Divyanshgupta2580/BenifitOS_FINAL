import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useEligibility } from '../../hooks/useEligibility';

interface Props {
  schemeId: string;
  onBack: () => void;
}

export const EligibilitySimulatorScreen: React.FC<Props> = ({ schemeId, onBack }) => {
  const { eligibilityMatch, isLoading, isError, refetch } = useEligibility(schemeId);

  if (isLoading) {
    return <LoadingSpinner message="Evaluating Deterministic Backend Eligibility Rules..." />;
  }

  if (isError || !eligibilityMatch) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Eligibility Calculation Unavailable</Text>
        <Text style={styles.errorText}>Complete your citizen profile to enable rule evaluation.</Text>
        <Button title="Retry Evaluation" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back to Scheme" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  const isEligible = eligibilityMatch.isEligible;
  const matchScore = eligibilityMatch.matchPercentage;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Scheme Detail</Text>
      </TouchableOpacity>

      {/* Backend Eligibility Gauge Score */}
      <Card style={{ ...styles.scoreCard, backgroundColor: isEligible ? theme.colors.primary : theme.colors.primaryDark }}>
        <Text style={styles.scoreTitle}>Backend Eligibility Result</Text>
        <View style={styles.wheel}>
          <Text style={styles.wheelText}>{matchScore}%</Text>
          <Text style={styles.wheelSub}>Match</Text>
        </View>
        <Badge
          label={isEligible ? 'ELIGIBLE' : 'ACTION REQUIRED'}
          variant={isEligible ? 'success' : 'warning'}
        />
        <Text style={styles.benefitText}>
          Estimated Benefit: ₹{eligibilityMatch.estimatedBenefit.toLocaleString('en-IN')} / Year
        </Text>
      </Card>

      {/* Rules Evaluation Note */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Deterministic Boolean Rules Evaluation</Text>
        <Text style={styles.noteText}>
          Eligibility is computed 100% deterministically by BenefitOS backend rules engine. AI is never used to calculate welfare scores.
        </Text>
      </Card>

      <Button title="Back to Scheme" onPress={onBack} style={styles.backBtnMain} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  backLink: { marginBottom: theme.spacing.md },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  errorTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.danger },
  errorText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary, marginVertical: theme.spacing.md, textAlign: 'center' },
  retryBtn: { marginBottom: theme.spacing.sm },
  scoreCard: { alignItems: 'center', padding: theme.spacing.xl, marginBottom: theme.spacing.md },
  scoreTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.surface, marginBottom: theme.spacing.md },
  wheel: { width: 100, height: 100, borderRadius: 50, borderWidth: 6, borderColor: theme.colors.saffron, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.md },
  wheelText: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.surface },
  wheelSub: { fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' },
  benefitText: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.saffronLight, marginTop: theme.spacing.md },
  sectionCard: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  noteText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, lineHeight: 18 },
  backBtnMain: { marginTop: theme.spacing.sm },
  backBtn: { marginTop: theme.spacing.xs },
});
