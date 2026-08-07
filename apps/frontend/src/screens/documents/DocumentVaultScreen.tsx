import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDocuments } from '../../hooks/useDocuments';
import { useDeleteDocument } from '../../hooks/useDeleteDocument';
import { DocumentItem } from '../../services/document.service';

const DOC_TYPES = [
  { id: 'ALL', label: 'All Vault Docs' },
  { id: 'AADHAAR', label: '🪪 Aadhaar Card' },
  { id: 'INCOME_CERTIFICATE', label: '📄 Income Cert' },
  { id: 'RATION_CARD', label: '🌾 Ration Card' },
  { id: 'CASTE_CERTIFICATE', label: '📋 Caste Cert' },
  { id: 'LAND_RECORD', label: '🏞️ Land Record' },
];

interface Props {
  onNavigateToUpload: () => void;
  onPreviewDocument: (id: string) => void;
  onBack?: () => void;
}

export const DocumentVaultScreen: React.FC<Props> = ({
  onNavigateToUpload,
  onPreviewDocument,
  onBack,
}) => {
  const { documents, isLoading, isError, refetch } = useDocuments();
  const { deleteDocument } = useDeleteDocument();
  const [selectedType, setSelectedType] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredDocs = documents.filter((doc) => {
    if (selectedType === 'ALL') return true;
    return doc.documentType === selectedType;
  });

  const handleDelete = (doc: DocumentItem) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete ${doc.fileName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(doc.id);
              Alert.alert('Deleted', 'Document removed from vault.');
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Could not delete document.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: DocumentItem }) => {
    const isVerified = item.verificationStatus === 'VERIFIED';
    const isRejected = item.verificationStatus === 'REJECTED';
    const statusVariant = isVerified ? 'success' : isRejected ? 'danger' : 'warning';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Badge label={item.documentType} variant="primary" />
          <Badge label={item.verificationStatus} variant={statusVariant} />
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={() => onPreviewDocument(item.id)}>
          <Text style={styles.fileName}>{item.fileName}</Text>
          <Text style={styles.fileMeta}>
            {(item.fileSize / 1024).toFixed(1)} KB • {item.mimeType} • Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <Button title="Preview" onPress={() => onPreviewDocument(item.id)} size="sm" variant="outline" />
          <Button title="Delete" onPress={() => handleDelete(item)} size="sm" variant="destructive" style={styles.deleteBtn} />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Document Vault</Text>
          <Button title="+ Upload File" onPress={onNavigateToUpload} size="sm" variant="secondary" />
        </View>
        <Text style={styles.screenSubtitle}>Secure encrypted storage for identity & welfare certificates.</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsWrapper}>
        <FlatList
          horizontal
          data={DOC_TYPES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item }) => {
            const isSelected = selectedType === item.id;
            return (
              <TouchableOpacity
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedType(item.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Document List */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <Skeleton height={110} borderRadius={12} style={styles.skel} />
          <Skeleton height={110} borderRadius={12} style={styles.skel} />
          <Skeleton height={110} borderRadius={12} style={styles.skel} />
        </View>
      ) : isError ? (
        <View style={styles.errorWrapper}>
          <Text style={styles.errorText}>Unable to load vault documents.</Text>
          <Button title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
        </View>
      ) : filteredDocs.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>No documents found in vault for selected filter.</Text>
          <Button title="Upload First Document" onPress={onNavigateToUpload} style={styles.uploadFirstBtn} />
        </View>
      ) : (
        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topHeader: { paddingHorizontal: theme.spacing.lg, paddingTop: 50, paddingBottom: theme.spacing.xs },
  backBtn: { marginBottom: 6 },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  screenSubtitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2, marginBottom: theme.spacing.xs },
  chipsWrapper: { marginBottom: theme.spacing.sm },
  chipsContainer: { paddingHorizontal: theme.spacing.lg },
  chip: { backgroundColor: theme.colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.spacing.borderRadius.full, marginRight: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.medium },
  chipTextActive: { color: theme.colors.surface, fontWeight: theme.typography.weights.bold },
  listContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  card: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  fileName: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginVertical: 2 },
  fileMeta: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: theme.spacing.xs, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  deleteBtn: { marginLeft: theme.spacing.xs },
  loadingWrapper: { paddingHorizontal: theme.spacing.lg },
  skel: { marginBottom: theme.spacing.md },
  errorWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.danger, marginBottom: theme.spacing.md },
  retryBtn: { marginTop: theme.spacing.xs },
  emptyWrapper: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: theme.spacing.md },
  uploadFirstBtn: { marginTop: theme.spacing.xs },
});
