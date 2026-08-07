import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApplication } from '../../hooks/useApplication';

interface Props {
  applicationId: string;
  onBack: () => void;
  onViewDetails: (id: string) => void;
}

export const ApplicationTimelineScreen: React.FC<Props> = ({
  applicationId,
  onBack,
  onViewDetails,
}) => {
  const { application: app, isLoading, isError, refetch } = useApplication(applicationId);

  if (isLoading) {
    return <LoadingSpinner message="Fetching Application Timeline Events..." />;
  }

  if (isError || !app) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load application timeline.</Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  const title = app.scheme?.title || `Application #${app.applicationNumber || app.id.slice(0, 8)}`;
  const statusSteps = [
    { key: 'SUBMITTED', label: 'Application Submitted', desc: 'Submitted to Department Portal' },
    { key: 'UNDER_REVIEW', label: 'Under Nodal Review', desc: 'Assigned to Verification Officer' },
    { key: 'DOCUMENT_VERIFICATION', label: 'Document Audit', desc: 'Cross-checking vault certificates' },
    { key: 'APPROVED', label: 'Sanction Approved', desc: 'Sanction order generated' },
    { key: 'DISBURSED', label: 'Direct Benefit Transfer', desc: 'DBT funds credited to bank account' },
  ];

  const getStepState = (stepKey: string) => {
    const statusOrder = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'APPROVED', 'DISBURSED'];
    const currentIdx = statusOrder.indexOf(app.status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (app.status === 'REJECTED' && stepKey === 'APPROVED') {
      return 'REJECTED';
    }
    if (stepIdx <= currentIdx) return 'COMPLETED';
    return 'PENDING';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Applications</Text>
      </TouchableOpacity>

      <Text style={styles.screenTitle}>Application Timeline</Text>
      <Text style={styles.screenSubtitle}>Real-time lifecycle tracking directly from government backend service.</Text>

      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.appNo}>{app.applicationNumber || `APP-${app.id.slice(0, 8)}`}</Text>
          <Badge
            label={app.status}
            variant={app.status === 'APPROVED' || app.status === 'DISBURSED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}
          />
        </View>
        <Text style={styles.schemeTitle}>{title}</Text>
        <Text style={styles.deptText}>{app.scheme?.department || 'Welfare Department'}</Text>
      </Card>

      {/* Vertical Timeline */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>

        {statusSteps.map((stepItem, idx) => {
          const state = getStepState(stepItem.key);
          const isLast = idx === statusSteps.length - 1;

          return (
            <View key={stepItem.key} style={styles.timelineRow}>
              <View style={styles.leftCol}>
                <View
                  style={[
                    styles.circle,
                    state === 'COMPLETED' && styles.circleCompleted,
                    state === 'REJECTED' && styles.circleRejected,
                  ]}
                >
                  <Text style={styles.circleText}>
                    {state === 'COMPLETED' ? '✓' : state === 'REJECTED' ? '✕' : idx + 1}
                  </Text>
                </View>
                {!isLast && <View style={[styles.line, state === 'COMPLETED' && styles.lineCompleted]} />}
              </View>

              <View style={styles.rightCol}>
                <Text style={styles.stepTitle}>{stepItem.label}</Text>
                <Text style={styles.stepDesc}>{stepItem.desc}</Text>
              </View>
            </View>
          );
        })}
      </Card>

      <Button
        title="View Full Application & Review Remarks"
        onPress={() => onViewDetails(app.id)}
        variant="secondary"
        style={styles.detailBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  backLink: { marginBottom: theme.spacing.md },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  screenTitle: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  screenSubtitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2, marginBottom: theme.spacing.md },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.danger, marginBottom: theme.spacing.md },
  retryBtn: { marginBottom: theme.spacing.sm },
  backBtn: { marginTop: theme.spacing.xs },
  headerCard: { marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  appNo: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  schemeTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  deptText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  card: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.md },
  timelineRow: { flexDirection: 'row', marginBottom: theme.spacing.md },
  leftCol: { alignItems: 'center', marginRight: theme.spacing.md },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  circleCompleted: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  circleRejected: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
  circleText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary },
  line: { width: 2, flex: 1, backgroundColor: theme.colors.border, marginTop: 4 },
  lineCompleted: { backgroundColor: theme.colors.success },
  rightCol: { flex: 1, paddingTop: 2 },
  stepTitle: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  stepDesc: { fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted },
  detailBtn: { marginTop: theme.spacing.xs, marginBottom: 40 },
});
