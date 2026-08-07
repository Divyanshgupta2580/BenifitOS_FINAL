import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApplication } from '../../hooks/useApplication';

interface Props {
  applicationId: string;
  onBack: () => void;
}

export const ApplicationDetailScreen: React.FC<Props> = ({ applicationId, onBack }) => {
  const { application: app, isLoading, isError, refetch } = useApplication(applicationId);

  if (isLoading) {
    return <LoadingSpinner message="Fetching Application Review & Metadata..." />;
  }

  if (isError || !app) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load application details.</Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  const handleDownloadReceipt = () => {
    Alert.alert('Download Receipt', `Downloading official application receipt for ${app.applicationNumber || app.id}...`);
  };

  const handleDownloadAck = () => {
    Alert.alert('Download Acknowledgement', `Downloading digitally signed acknowledgement slip...`);
  };

  const title = app.scheme?.title || `Application #${app.applicationNumber || app.id.slice(0, 8)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Timeline</Text>
      </TouchableOpacity>

      <Text style={styles.screenTitle}>Application Review & Detail</Text>
      <Text style={styles.screenSubtitle}>Full audit metadata, attached vault documents, and officer remarks.</Text>

      {/* Main Metadata Card */}
      <Card style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.appNo}>{app.applicationNumber || `APP-${app.id.slice(0, 8)}`}</Text>
          <Badge
            label={app.status}
            variant={app.status === 'APPROVED' || app.status === 'DISBURSED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'warning'}
          />
        </View>

        <Text style={styles.schemeTitle}>{title}</Text>
        <Text style={styles.metaText}>Department: {app.scheme?.department || 'Welfare Department'}</Text>
        <Text style={styles.metaText}>Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'Draft Mode'}</Text>
        <Text style={styles.metaText}>Last Updated: {new Date(app.updatedAt).toLocaleDateString()}</Text>
      </Card>

      {/* Attached Vault Documents */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Attached Vault Documents ({app.attachedDocumentIds?.length || 0})</Text>
        {app.attachedDocumentIds && app.attachedDocumentIds.length > 0 ? (
          app.attachedDocumentIds.map((docId, idx) => (
            <View key={docId} style={styles.docItem}>
              <Text style={styles.docText}>📄 Linked Vault Document #{docId.slice(0, 8)}</Text>
              <Badge label="LINKED" variant="primary" />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No vault documents attached to this application.</Text>
        )}
      </Card>

      {/* Officer Remarks */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Verification Officer Remarks</Text>
        <Text style={styles.remarksText}>
          {app.officerRemarks || 'No officer remarks entered. Application is pending verification by the nodal officer.'}
        </Text>
      </Card>

      {/* Disbursement Info */}
      {app.disbursementDetails && (
        <Card style={styles.disbursementCard}>
          <Text style={styles.disbursementTitle}>Direct Benefit Transfer (DBT) Details</Text>
          <Text style={styles.disbursementText}>Amount: ₹{app.disbursementDetails.disbursedAmountINR.toLocaleString('en-IN')}</Text>
          <Text style={styles.disbursementText}>Account: {app.disbursementDetails.accountNumberMasked} ({app.disbursementDetails.ifscCode})</Text>
          <Text style={styles.disbursementText}>Ref Txn: {app.disbursementDetails.transactionReference}</Text>
        </Card>
      )}

      {/* Download Action CTAs */}
      <Button title="Download Application Receipt" onPress={handleDownloadReceipt} variant="secondary" style={styles.actionBtn} />
      <Button title="Download Signed Acknowledgement Slip" onPress={handleDownloadAck} variant="outline" style={styles.actionBtn} />
      <Button title="Back to Timeline" onPress={onBack} variant="outline" style={styles.backBtnMain} />
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
  card: { marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  appNo: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  schemeTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: 4 },
  metaText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: 2 },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  docItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingVertical: 4 },
  docText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textPrimary },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic' },
  remarksText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, lineHeight: 20 },
  disbursementCard: { backgroundColor: theme.colors.primaryDark, marginBottom: theme.spacing.md },
  disbursementTitle: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.surface, marginBottom: theme.spacing.xs },
  disbursementText: { fontSize: theme.typography.sizes.xs, color: 'rgba(255, 255, 255, 0.9)', marginBottom: 2 },
  actionBtn: { marginBottom: theme.spacing.xs },
  backBtnMain: { marginTop: theme.spacing.xs, marginBottom: 40 },
});
