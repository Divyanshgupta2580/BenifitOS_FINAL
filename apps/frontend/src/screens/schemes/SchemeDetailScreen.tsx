import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useScheme } from '../../hooks/useScheme';

interface Props {
  schemeId: string;
  onBack: () => void;
  onSimulateEligibility: (schemeId: string) => void;
}

export const SchemeDetailScreen: React.FC<Props> = ({ schemeId, onBack, onSimulateEligibility }) => {
  const { scheme, isLoading, isError, refetch } = useScheme(schemeId);

  if (isLoading) {
    return <LoadingSpinner message="Loading Scheme Details..." />;
  }

  if (isError || !scheme) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load scheme details.</Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back to Catalog" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Catalog</Text>
      </TouchableOpacity>

      {/* Scheme Header Banner */}
      <Card style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.codeText}>{scheme.code}</Text>
          <Badge label={scheme.category} variant="primary" />
        </View>
        <Text style={styles.title}>{scheme.title}</Text>
        <Text style={styles.department}>{scheme.department}</Text>
        <View style={styles.benefitContainer}>
          <Text style={styles.benefitLabel}>Financial Benefit:</Text>
          <Text style={styles.benefitAmount}>₹{scheme.financialBenefit.toLocaleString('en-IN')} / Year</Text>
        </View>
      </Card>

      {/* Description */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Overview & Purpose</Text>
        <Text style={styles.descText}>{scheme.description}</Text>
      </Card>

      {/* Eligibility Rules */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Eligibility Rules</Text>
        {scheme.eligibilityRules && scheme.eligibilityRules.length > 0 ? (
          scheme.eligibilityRules.map((rule) => (
            <View key={rule.id} style={styles.ruleItem}>
              <Text style={styles.ruleBullet}>•</Text>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleDesc}>{rule.description}</Text>
                <Text style={styles.ruleMeta}>
                  {rule.attributeKey} {rule.operator} {rule.targetValue}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Standard welfare guidelines apply.</Text>
        )}
      </Card>

      {/* Required Documents */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
          scheme.requiredDocuments.map((doc) => (
            <View key={doc.id} style={styles.docItem}>
              <Badge label={doc.documentType} variant="warning" />
              <Text style={styles.docDesc}>{doc.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No special document requirements specified.</Text>
        )}
      </Card>

      {/* Action Buttons */}
      <Button
        title="Check My Eligibility Match"
        onPress={() => onSimulateEligibility(scheme.id)}
        variant="secondary"
        style={styles.simulateBtn}
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
  headerCard: { backgroundColor: theme.colors.primary, marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  codeText: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  title: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.surface, marginBottom: 4 },
  department: { fontSize: theme.typography.sizes.xs, color: 'rgba(255, 255, 255, 0.8)', marginBottom: theme.spacing.md },
  benefitContainer: { backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: theme.spacing.sm, borderRadius: theme.spacing.borderRadius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  benefitLabel: { fontSize: theme.typography.sizes.xs, color: theme.colors.surface },
  benefitAmount: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.saffronLight },
  sectionCard: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  descText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, lineHeight: 22 },
  ruleItem: { flexDirection: 'row', marginBottom: theme.spacing.xs },
  ruleBullet: { fontSize: theme.typography.sizes.md, color: theme.colors.primary, marginRight: theme.spacing.xs },
  ruleContent: { flex: 1 },
  ruleDesc: { fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, fontWeight: theme.typography.weights.medium },
  ruleMeta: { fontSize: 10, color: theme.colors.textMuted },
  docItem: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
  docDesc: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic' },
  simulateBtn: { marginTop: theme.spacing.sm, marginBottom: 40 },
  backBtn: { marginTop: theme.spacing.xs },
});
