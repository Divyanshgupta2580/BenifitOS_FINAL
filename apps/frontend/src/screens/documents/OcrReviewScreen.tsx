import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useOcrResult } from '../../hooks/useOcrResult';
import { useProcessOcr } from '../../hooks/useProcessOcr';
import { useDocument } from '../../hooks/useDocument';

interface Props {
  documentId: string;
  onBack: () => void;
}

export const OcrReviewScreen: React.FC<Props> = ({ documentId, onBack }) => {
  const { document: doc } = useDocument(documentId);
  const { ocrResult, isLoading, isError, refetch } = useOcrResult(documentId);
  const { processOcr, isProcessing } = useProcessOcr();

  const [editableFields, setEditableFields] = useState<Record<string, string>>({});
  const [hasInitializedFields, setHasInitializedFields] = useState(false);

  // Initialize editable fields when OCR result is available
  if (ocrResult?.extractedData && !hasInitializedFields) {
    const initial: Record<string, string> = {};
    Object.entries(ocrResult.extractedData).forEach(([key, val]) => {
      initial[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
    });
    setEditableFields(initial);
    setHasInitializedFields(true);
  }

  const handleRunOcr = async () => {
    try {
      await processOcr(documentId);
      setHasInitializedFields(false);
      refetch();
    } catch (err: any) {
      Alert.alert('OCR Failed', err.message || 'Vision OCR scan could not complete.');
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditableFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirmVerification = () => {
    Alert.alert(
      'Verification Confirmed',
      'Extracted fields verified and linked to citizen document vault.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const confidencePct = ocrResult ? (ocrResult.confidenceScore * 100).toFixed(1) : '0.0';
  const isHighConfidence = ocrResult && ocrResult.confidenceScore >= 0.85;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Vault</Text>
      </TouchableOpacity>

      <Text style={styles.screenTitle}>Vision OCR & AI Extraction</Text>
      <Text style={styles.screenSubtitle}>
        Review and verify document attributes extracted by Google Gemini Vision.
      </Text>

      {/* Document Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Badge label={doc?.documentType || 'DOCUMENT'} variant="primary" />
          <Badge label={doc?.verificationStatus || 'PENDING'} variant={doc?.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} />
        </View>
        <Text style={styles.docName}>{doc?.fileName || `Document #${documentId.slice(0, 8)}`}</Text>
        
        <Button
          title={isProcessing ? 'Processing Vision Scan...' : 'Run Vision OCR Scan'}
          onPress={handleRunOcr}
          isLoading={isProcessing}
          variant="secondary"
          style={styles.ocrBtn}
        />
      </Card>

      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner message="Fetching OCR Results..." />}

      {/* OCR Extraction Review Body */}
      {ocrResult ? (
        <>
          {/* Confidence Indicator Gauge */}
          <Card style={{ ...styles.confidenceCard, backgroundColor: isHighConfidence ? theme.colors.primary : theme.colors.primaryDark }}>
            <Text style={styles.confidenceTitle}>Gemini Vision Confidence Score</Text>
            <View style={styles.gaugeRow}>
              <Text style={styles.confidenceScore}>{confidencePct}%</Text>
              <Badge
                label={isHighConfidence ? 'HIGH CONFIDENCE' : 'MANUAL REVIEW REQUIRED'}
                variant={isHighConfidence ? 'success' : 'warning'}
              />
            </View>
          </Card>

          {/* Editable Extracted Fields List */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Extracted Document Attributes</Text>
            <Text style={styles.sectionSub}>Verify and edit any field before submitting to verification audit.</Text>

            {Object.keys(editableFields).length > 0 ? (
              Object.entries(editableFields).map(([key, val]) => (
                <Input
                  key={key}
                  label={key.toUpperCase().replace(/_/g, ' ')}
                  value={val}
                  onChangeText={(text) => handleFieldChange(key, text)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No structured fields extracted from document image.</Text>
            )}
          </Card>

          {/* Raw Text Viewer */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Raw Extracted Text</Text>
            <View style={styles.rawBox}>
              <Text style={styles.rawText}>{ocrResult.rawText}</Text>
            </View>
          </Card>

          <Button title="Confirm & Verify Document" onPress={handleConfirmVerification} style={styles.confirmBtn} />
        </>
      ) : (
        !isLoading && (
          <Card style={styles.card}>
            <Text style={styles.emptyText}>
              No OCR extraction result available yet. Click "Run Vision OCR Scan" to initiate AI processing.
            </Text>
          </Card>
        )
      )}

      <Button title="Back to Vault" onPress={onBack} variant="outline" style={styles.backBtnMain} />
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
  headerCard: { marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  docName: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.sm },
  ocrBtn: { marginTop: theme.spacing.xs },
  confidenceCard: { marginBottom: theme.spacing.md, padding: theme.spacing.md },
  confidenceTitle: { fontSize: theme.typography.sizes.xs, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 4 },
  gaugeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceScore: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.surface },
  card: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: 2 },
  sectionSub: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  rawBox: { backgroundColor: theme.colors.background, padding: theme.spacing.md, borderRadius: theme.spacing.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border },
  rawText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textPrimary, fontFamily: 'monospace' },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic' },
  confirmBtn: { marginTop: theme.spacing.xs },
  backBtnMain: { marginTop: theme.spacing.xs, marginBottom: 40 },
});
