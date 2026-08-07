import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useDocument } from '../../hooks/useDocument';

interface Props {
  documentId: string;
  onBack: () => void;
  onRunOcr?: (documentId: string) => void;
}

export const DocumentViewerModal: React.FC<Props> = ({ documentId, onBack, onRunOcr }) => {
  const { document: doc, isLoading, isError, refetch } = useDocument(documentId);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving Secure Presigned Document Metadata..." />;
  }

  if (isError || !doc) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load document preview.</Text>
        <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        <Button title="Back" onPress={onBack} variant="outline" style={styles.backBtn} />
      </View>
    );
  }

  const handleDownload = () => {
    Alert.alert('Secure Download', `Initiating encrypted download for ${doc.fileName}...`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Close Viewer</Text>
      </TouchableOpacity>

      {/* Main Document Details */}
      <Card style={styles.mainCard}>
        <View style={styles.badgeRow}>
          <Badge label={doc.documentType} variant="primary" />
          <Badge label={doc.verificationStatus} variant={doc.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} />
        </View>

        <Text style={styles.fileName}>{doc.fileName}</Text>
        <Text style={styles.mimeText}>{doc.mimeType} • {(doc.fileSize / 1024).toFixed(1)} KB</Text>

        <View style={styles.previewBox}>
          <Text style={styles.previewPlaceholder}>📄 Secure Presigned Document Preview</Text>
          <Text style={styles.pathText}>Storage Reference: {doc.storagePath}</Text>
        </View>

        <Button title="Download Document File" onPress={handleDownload} variant="secondary" style={styles.downloadBtn} />
        {onRunOcr && (
          <Button
            title="🔍 Run AI Vision OCR Extraction"
            onPress={() => onRunOcr(doc.id)}
            variant="outline"
            style={{ marginTop: theme.spacing.xs }}
          />
        )}
      </Card>

      <Button title="Close Viewer" onPress={onBack} variant="outline" style={styles.closeBtn} />
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
  mainCard: { marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  fileName: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginVertical: 4 },
  mimeText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  previewBox: { backgroundColor: theme.colors.background, padding: theme.spacing.lg, borderRadius: theme.spacing.borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  previewPlaceholder: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: 4 },
  pathText: { fontSize: 10, color: theme.colors.textMuted },
  downloadBtn: { marginTop: theme.spacing.xs },
  closeBtn: { marginTop: theme.spacing.xs, marginBottom: 40 },
});
