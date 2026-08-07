import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
}

export const LandDetailsScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();
  const lands = profile?.landDetails || [];

  const [sizeAcres, setSizeAcres] = useState('');
  const [landType, setLandType] = useState('IRRIGATED');
  const [surveyNo, setSurveyNo] = useState('');
  const [district, setDistrict] = useState(profile?.address?.district || '');
  const [state, setState] = useState(profile?.address?.state || '');

  const handleAddLand = async () => {
    if (!sizeAcres || !district || !state) {
      Alert.alert('Validation Error', 'Land size, District, and State are required.');
      return;
    }

    const newLand = {
      id: Math.random().toString(),
      landSizeAcres: parseFloat(sizeAcres) || 0,
      landType,
      surveyNumber: surveyNo || undefined,
      district,
      state,
    };

    const updatedLands = [...lands, newLand];

    try {
      await updateProfile({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        dateOfBirth: profile?.dateOfBirth || new Date().toISOString(),
        gender: profile?.gender || 'MALE',
        maritalStatus: profile?.maritalStatus || 'SINGLE',
        socialCategory: profile?.socialCategory || 'GENERAL',
        employmentStatus: profile?.employmentStatus || 'UNEMPLOYED',
        annualIncomeINR: profile?.annualIncomeINR || 0,
        disabilityType: profile?.disabilityType || 'NONE',
        disabilityPercent: profile?.disabilityPercent || 0,
        isBplCardHolder: profile?.isBplCardHolder || false,
        bplCardNumber: profile?.bplCardNumber,
        landDetails: updatedLands,
      });

      setSizeAcres('');
      setSurveyNo('');
      Alert.alert('Land Record Added', 'Agricultural land holding registered successfully.');
    } catch (err: any) {
      Alert.alert('Failed to Add Land Record', err.message || 'Could not save land record.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Land Details</Text>
      <Text style={styles.subtitle}>Register agricultural land holdings for PM-KISAN and farming benefit schemes.</Text>

      {/* List Existing Land Holdings */}
      {lands.length > 0 ? (
        lands.map((l) => (
          <Card key={l.id} style={styles.landCard}>
            <Text style={styles.landTitle}>
              {l.landSizeAcres} Acres ({l.landType})
            </Text>
            <Text style={styles.landMeta}>
              Survey No: {l.surveyNumber || 'N/A'} • {l.district}, {l.state}
            </Text>
          </Card>
        ))
      ) : (
        <Text style={styles.emptyText}>No land holding records added yet.</Text>
      )}

      {/* Add New Land Form */}
      <Card style={styles.addCard}>
        <Text style={styles.addTitle}>Add Land Record</Text>
        <Input label="Land Size (Acres)" value={sizeAcres} onChangeText={setSizeAcres} keyboardType="numeric" placeholder="e.g. 2.5" />
        <Input label="Land Type (IRRIGATED / UNIRRIGATED / BARREN)" value={landType} onChangeText={setLandType} />
        <Input label="Survey / Khasra Number" value={surveyNo} onChangeText={setSurveyNo} placeholder="e.g. 142/A" />
        <Input label="District" value={district} onChangeText={setDistrict} />
        <Input label="State" value={state} onChangeText={setState} />

        <Button title="Add Land Record" onPress={handleAddLand} isLoading={isUpdating} style={styles.addBtn} />
      </Card>

      <Button title="Back to Profile" onPress={onBack} variant="outline" style={styles.backBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  title: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.sizes.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  landCard: { marginBottom: theme.spacing.sm },
  landTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  landMeta: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: theme.spacing.md },
  addCard: { marginTop: theme.spacing.md, marginBottom: theme.spacing.lg },
  addTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.md },
  addBtn: { marginTop: theme.spacing.sm },
  backBtn: { marginTop: theme.spacing.sm },
});
