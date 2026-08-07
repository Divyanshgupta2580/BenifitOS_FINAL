import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useUploadDocument } from '../../hooks/useUploadDocument';

const TYPES = [
  'AADHAAR',
  'INCOME_CERTIFICATE',
  'RATION_CARD',
  'CASTE_CERTIFICATE',
  'DISABILITY_CERTIFICATE',
  'LAND_RECORD',
  'BANK_PASSBOOK',
  'VOTER_ID',
  'PAN_CARD',
  'OTHER',
];

interface Props {
  onBack: () => void;
}

export const DocumentUploadScreen: React.FC<Props> = ({ onBack }) => {
  const { uploadDocument, isUploading } = useUploadDocument();
  const [docType, setDocType] = useState('AADHAAR');
  const [fileName, setFileName] = useState('aadhaar_card_scan.pdf');
  const [mimeType, setMimeType] = useState('application/pdf');
  const [fileSizeKb, setFileSizeKb] = useState('512');
  const [fileUri, setFileUri] = useState('');

  const validateAndConstructPayload = () => {
    if (!fileName) {
      Alert.alert('Validation Error', 'File name is required.');
      return null;
    }

    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.pdf', '.jpeg', '.jpg', '.png'];
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

    if (!allowedMimeTypes.includes(mimeType.toLowerCase()) && !allowedExtensions.includes(ext)) {
      Alert.alert('Invalid File Format', 'Only PDF, JPEG, and PNG files are allowed.');
      return null;
    }

    const sizeInBytes = (parseFloat(fileSizeKb) || 0) * 1024;
    const maxLimitInBytes = 10 * 1024 * 1024; // 10 MB
    if (sizeInBytes > maxLimitInBytes) {
      Alert.alert('File Size Exceeded', 'Maximum file upload size is 10 MB.');
      return null;
    }

    const platformUri = fileUri || `file://${fileName}`;

    return {
      uri: platformUri,
      name: fileName,
      type: mimeType,
    };
  };

  const handleUpload = async () => {
    const filePayload = validateAndConstructPayload();
    if (!filePayload) return;

    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('file', filePayload as any);

      await uploadDocument(formData);
      Alert.alert('Upload Successful', `${fileName} uploaded to Document Vault.`, [
        { text: 'OK', onPress: onBack },
      ]);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload document.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Vault</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Upload Document</Text>
      <Text style={styles.subtitle}>Select document category and file (PDF, JPEG, PNG, max 10MB).</Text>

      {/* Select Category */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Document Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, docType === t && styles.typeChipActive]}
              onPress={() => setDocType(t)}
            >
              <Text style={[styles.typeText, docType === t && styles.typeTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {/* File Specification Form */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>File Metadata & Validation</Text>
        <Input label="File Name (.pdf, .jpeg, .png)" value={fileName} onChangeText={setFileName} placeholder="e.g. income_cert_2026.pdf" />
        <Input label="MIME Type (application/pdf, image/jpeg, image/png)" value={mimeType} onChangeText={setMimeType} />
        <Input label="File Size (KB, max 10240 KB / 10MB)" value={fileSizeKb} onChangeText={setFileSizeKb} keyboardType="numeric" />
        <Input label="Platform File URI (Optional)" value={fileUri} onChangeText={setFileUri} placeholder="e.g. file:///path or blob:http://..." />
      </Card>

      <Button title="Upload File to Vault" onPress={handleUpload} isLoading={isUploading} style={styles.button} />
      <Button title="Cancel" onPress={onBack} variant="outline" style={styles.cancelBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  backLink: { marginBottom: theme.spacing.md },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  title: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.sizes.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  card: { marginBottom: theme.spacing.md },
  cardTitle: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  typeRow: { marginVertical: 4 },
  typeChip: { backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.spacing.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, marginRight: theme.spacing.xs },
  typeChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  typeTextActive: { color: theme.colors.surface, fontWeight: theme.typography.weights.bold },
  button: { marginTop: theme.spacing.md },
  cancelBtn: { marginTop: theme.spacing.sm },
});
