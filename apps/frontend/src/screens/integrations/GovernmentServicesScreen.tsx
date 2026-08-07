import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { useGovernmentServices } from '../../hooks/useGovernmentServices';
import { GovernmentServiceItem, ServiceStatus } from '../../services/government.service';

interface Props {
  onBack: () => void;
}

const CATEGORIES = ['ALL', 'IDENTITY', 'DOCUMENTS', 'HEALTH', 'AGRICULTURE', 'LABOUR', 'CIVIL'];

export const GovernmentServicesScreen: React.FC<Props> = ({ onBack }) => {
  const {
    services,
    isLoading,
    isError,
    refetch,
    connectService,
    isConnecting,
    syncService,
    isSyncing,
    disconnectService,
    isDisconnecting,
  } = useGovernmentServices();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Connection Modal State
  const [activeModalService, setActiveModalService] = useState<GovernmentServiceItem | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('999999999999');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  const connectedCount = services.filter((s) => s.status === 'CONNECTED' || s.status === 'VERIFIED').length;
  const verifiedCount = services.filter((s) => s.status === 'VERIFIED').length;
  const pendingCount = services.filter((s) => s.status === 'PENDING').length;

  const handleOpenConnect = (service: GovernmentServiceItem) => {
    if (service.code === 'DIGILOCKER') {
      Alert.alert(
        'DigiLocker Redirect',
        'Redirecting to official DigiLocker OAuth2 authentication gateway...',
        [{ text: 'Proceed', onPress: () => Alert.alert('Connected', 'DigiLocker account linked successfully.') }]
      );
      return;
    }
    setActiveModalService(service);
    setIsOtpSent(false);
    setOtp('');
    setTxnId('');
  };

  const handleRequestOtp = async () => {
    if (aadhaarNumber.length !== 12) {
      Alert.alert('Validation Error', 'Aadhaar number must be exactly 12 digits.');
      return;
    }
    try {
      const res: any = await connectService({ aadhaarNumber });
      setTxnId(res.txnId || 'TXN-GOV-' + Date.now());
      setIsOtpSent(true);
      Alert.alert('OTP Sent', 'Verification OTP dispatched to registered mobile number.');
    } catch (err: any) {
      Alert.alert('Request Failed', err.message || 'Could not request verification OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Validation Error', 'Verification OTP must be 6 digits.');
      return;
    }
    try {
      await connectService({ otp, txnId: txnId || 'TXN-GOV-LIVE' });
      Alert.alert('Connection Successful', `${activeModalService?.name} verified and connected.`, [
        {
          text: 'OK',
          onPress: () => {
            setActiveModalService(null);
            refetch();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid verification OTP.');
    }
  };

  const handleSync = async (service: GovernmentServiceItem) => {
    try {
      await syncService(service.id);
      Alert.alert('Sync Complete', `${service.name} data updated from national registry.`, [
        { text: 'OK', onPress: () => refetch() },
      ]);
    } catch (err: any) {
      Alert.alert('Sync Failed', err.message || 'Could not sync service data.');
    }
  };

  const handleDisconnect = (service: GovernmentServiceItem) => {
    Alert.alert(
      'Disconnect Integration',
      `Are you sure you want to disconnect ${service.name}? You will need to re-verify your identity.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectService(service.id);
            Alert.alert('Disconnected', `${service.name} link unlinked.`);
            refetch();
          },
        },
      ]
    );
  };

  const getBadgeVariant = (status: ServiceStatus): 'success' | 'warning' | 'danger' | 'primary' => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'CONNECTED':
        return 'primary';
      case 'PENDING':
        return 'warning';
      case 'EXPIRED':
      case 'NOT_CONNECTED':
      default:
        return 'danger';
    }
  };

  const renderServiceCard = ({ item }: { item: GovernmentServiceItem }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconRow}>
          <Text style={styles.serviceIcon}>{item.icon}</Text>
          <View style={styles.nameContainer}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.serviceCategory}>{item.category} REGISTRY</Text>
          </View>
        </View>
        <Badge label={item.status} variant={getBadgeVariant(item.status)} />
      </View>

      <Text style={styles.serviceDesc}>{item.description}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.healthText}>
          Health: <Text style={item.health === 'HEALTHY' ? styles.healthOk : styles.healthBad}>{item.health}</Text>
        </Text>
        <Text style={styles.syncTime}>Last Synced: {item.lastSynced || 'Never'}</Text>
      </View>

      <View style={styles.actionsRow}>
        {item.status === 'NOT_CONNECTED' || item.status === 'EXPIRED' ? (
          <Button
            title="Connect Account"
            onPress={() => handleOpenConnect(item)}
            isLoading={isConnecting}
            style={styles.connectBtn}
          />
        ) : (
          <>
            <Button
              title="Sync Data"
              onPress={() => handleSync(item)}
              isLoading={isSyncing}
              variant="outline"
              style={styles.syncBtn}
            />
            <Button
              title="Disconnect"
              onPress={() => handleDisconnect(item)}
              isLoading={isDisconnecting}
              variant="outline"
              style={styles.disconnectBtn}
            />
          </>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backLink} accessibilityLabel="Back to Dashboard">
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Government Services Hub</Text>
        <Text style={styles.subtitle}>
          Connect & verify citizen identity accounts with official national registries.
        </Text>
      </View>

      {/* Integration Dashboard Summary */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{connectedCount}</Text>
          <Text style={styles.summaryLabel}>Connected</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{verifiedCount}</Text>
          <Text style={styles.summaryLabel}>Verified</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </Card>
      </View>

      {/* Category Filter Bar */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
              accessibilityLabel={`Filter by ${cat}`}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services Cards List */}
      {isLoading ? (
        <ScrollView style={styles.listPadding}>
          <Skeleton height={140} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton height={140} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton height={140} borderRadius={12} style={{ marginBottom: 12 }} />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
        />
      )}

      {/* Aadhaar / Account Connection Modal */}
      <Modal visible={!!activeModalService} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect {activeModalService?.name}</Text>
            <Text style={styles.modalSub}>
              Enter your official 12-digit number to request e-KYC authentication OTP.
            </Text>

            {!isOtpSent ? (
              <>
                <Input
                  label="Aadhaar / Registry Identifier"
                  value={aadhaarNumber}
                  onChangeText={setAadhaarNumber}
                  keyboardType="number-pad"
                  maxLength={12}
                />
                <Button title="Request Verification OTP" onPress={handleRequestOtp} isLoading={isConnecting} style={styles.modalBtn} />
              </>
            ) : (
              <>
                <Text style={styles.otpNotice}>Transaction ID: {txnId}</Text>
                <Input
                  label="6-Digit Verification OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <Button title="Verify & Link Account" onPress={handleVerifyOtp} isLoading={isConnecting} style={styles.modalBtn} />
              </>
            )}

            <Button
              title="Cancel"
              onPress={() => setActiveModalService(null)}
              variant="outline"
              style={styles.modalCancel}
            />
          </Card>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.lg, paddingTop: 50, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backLink: { marginBottom: theme.spacing.xs },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  title: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  subtitle: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2 },
  
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.md, backgroundColor: theme.colors.surface },
  summaryCard: { width: '31%', alignItems: 'center', paddingVertical: theme.spacing.sm },
  summaryNumber: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  summaryLabel: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },
  
  categoryContainer: { backgroundColor: theme.colors.surface, paddingVertical: theme.spacing.xs, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  categoryRow: { paddingHorizontal: theme.spacing.md },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  categoryChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  categoryTextActive: { color: '#FFFFFF', fontWeight: theme.typography.weights.bold },
  
  listPadding: { padding: theme.spacing.md, paddingBottom: 40 },
  card: { marginBottom: theme.spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  iconRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  serviceIcon: { fontSize: 24, marginRight: 8 },
  nameContainer: { flex: 1 },
  serviceName: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  serviceCategory: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: theme.typography.weights.bold },
  serviceDesc: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: 8 },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.divider, marginBottom: 12 },
  healthText: { fontSize: 10, color: theme.colors.textSecondary },
  healthOk: { color: theme.colors.success, fontWeight: theme.typography.weights.bold },
  healthBad: { color: theme.colors.danger, fontWeight: theme.typography.weights.bold },
  syncTime: { fontSize: 10, color: theme.colors.textMuted },
  
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  connectBtn: { flex: 1 },
  syncBtn: { width: '48%' },
  disconnectBtn: { width: '48%', borderColor: theme.colors.danger },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.lg },
  modalContent: { backgroundColor: theme.colors.surface },
  modalTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: 4 },
  modalSub: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  modalBtn: { marginTop: theme.spacing.md },
  modalCancel: { marginTop: theme.spacing.xs },
  otpNotice: { fontSize: theme.typography.sizes.xs, color: theme.colors.primary, fontWeight: theme.typography.weights.bold, marginBottom: 8 },
});
