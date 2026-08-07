import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onNavigateToDemographics: () => void;
  onNavigateToAddress: () => void;
  onNavigateToHousehold: () => void;
  onNavigateToLand: () => void;
  onBack?: () => void;
}

export const CitizenProfileScreen: React.FC<Props> = ({
  onNavigateToDemographics,
  onNavigateToAddress,
  onNavigateToHousehold,
  onNavigateToLand,
  onBack,
}) => {
  const { profile, isLoading, isError, refetch } = useCitizenProfile();

  if (isLoading) {
    return <LoadingSpinner message="Loading Citizen Profile..." />;
  }

  if (isError || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Failed to Load Profile</Text>
        <Text style={styles.errorText}>Unable to retrieve citizen details from server.</Text>
        <Button title="Try Again" onPress={() => refetch()} style={styles.retryButton} />
      </View>
    );
  }

  const completionPct = profile.completionPercentage || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      )}

      {/* Completion Header */}
      <Card style={styles.completionCard}>
        <View style={styles.completionRow}>
          <View>
            <Text style={styles.profileName}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.profileMeta}>
              {profile.gender} • Age {profile.age || 30} • {profile.socialCategory}
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{completionPct}%</Text>
            <Text style={styles.scoreSub}>Complete</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${completionPct}%` }]} />
        </View>
      </Card>

      {/* Section 1: Demographics */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Demographics & Income</Text>
          <TouchableOpacity onPress={onNavigateToDemographics}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Employment</Text>
            <Text style={styles.infoValue}>{profile.employmentStatus}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Annual Income</Text>
            <Text style={styles.infoValue}>₹{profile.annualIncomeINR.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>BPL Card</Text>
            <Badge
              label={profile.isBplCardHolder ? 'YES' : 'NO'}
              variant={profile.isBplCardHolder ? 'success' : 'warning'}
            />
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Disability</Text>
            <Text style={styles.infoValue}>{profile.disabilityType}</Text>
          </View>
        </View>
      </Card>

      {/* Section 2: Address */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Residential Address</Text>
          <TouchableOpacity onPress={onNavigateToAddress}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        {profile.address ? (
          <View>
            <Text style={styles.addressText}>{profile.address.streetAddress}</Text>
            <Text style={styles.addressText}>
              {profile.address.city}, {profile.address.district}, {profile.address.state} - {profile.address.pincode}
            </Text>
            <Badge
              label={profile.address.isRural ? 'RURAL' : 'URBAN'}
              variant="primary"
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>No address details added yet.</Text>
        )}
      </Card>

      {/* Section 3: Household Members */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Household Members</Text>
          <TouchableOpacity onPress={onNavigateToHousehold}>
            <Text style={styles.editLink}>Manage ({profile.householdMembers?.length || 0})</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.infoValue}>
          {profile.householdMembers?.length || 0} family dependents registered.
        </Text>
      </Card>

      {/* Section 4: Land Details */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Land Holdings</Text>
          <TouchableOpacity onPress={onNavigateToLand}>
            <Text style={styles.editLink}>Manage ({profile.landDetails?.length || 0})</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.infoValue}>
          {profile.landDetails?.length || 0} agricultural land records linked.
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  backLink: { marginBottom: theme.spacing.md },
  backText: { fontSize: theme.typography.sizes.sm, color: theme.colors.primary, fontWeight: theme.typography.weights.medium },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  errorTitle: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.danger },
  errorText: { fontSize: theme.typography.sizes.md, color: theme.colors.textSecondary, marginVertical: theme.spacing.md },
  retryButton: { marginTop: theme.spacing.sm },
  completionCard: { backgroundColor: theme.colors.primary, marginBottom: theme.spacing.lg },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  profileName: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.surface },
  profileMeta: { fontSize: theme.typography.sizes.sm, color: 'rgba(255, 255, 255, 0.8)', marginTop: 2 },
  scoreBadge: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.spacing.borderRadius.md },
  scoreText: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.surface },
  scoreSub: { fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: theme.colors.saffron, borderRadius: 3 },
  sectionCard: { marginBottom: theme.spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  editLink: { fontSize: theme.typography.sizes.sm, color: theme.colors.saffron, fontWeight: theme.typography.weights.semibold },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoItem: { width: '48%', marginBottom: theme.spacing.sm },
  infoLabel: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  infoValue: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary, marginTop: 2 },
  addressText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, marginBottom: 4 },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic' },
});
