import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
}

export const AddressEditScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();
  const addr = profile?.address;

  const [streetAddress, setStreetAddress] = useState(addr?.streetAddress || '');
  const [city, setCity] = useState(addr?.city || '');
  const [district, setDistrict] = useState(addr?.district || '');
  const [state, setState] = useState(addr?.state || '');
  const [pincode, setPincode] = useState(addr?.pincode || '');
  const [isRural, setIsRural] = useState(addr?.isRural || false);

  const handleSave = async () => {
    if (!streetAddress || !city || !district || !state || !pincode) {
      Alert.alert('Validation Error', 'All address fields are required.');
      return;
    }

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
        address: {
          streetAddress,
          city,
          district,
          state,
          pincode,
          isRural,
        },
      });

      Alert.alert('Address Saved', 'Residential address updated successfully.', [{ text: 'OK', onPress: onBack }]);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save residential address.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Address</Text>
      <Text style={styles.subtitle}>Specify your residential location for state and district scheme matching.</Text>

      <Input label="Street Address" value={streetAddress} onChangeText={setStreetAddress} />
      <Input label="City / Village" value={city} onChangeText={setCity} />
      <Input label="District" value={district} onChangeText={setDistrict} />
      <Input label="State" value={state} onChangeText={setState} />
      <Input label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="number-pad" maxLength={6} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Rural Area Resident?</Text>
        <Switch value={isRural} onValueChange={setIsRural} trackColor={{ true: theme.colors.primary }} />
      </View>

      <Button title="Save Address" onPress={handleSave} isLoading={isUpdating} style={styles.button} />
      <Button title="Cancel" onPress={onBack} variant="outline" style={styles.cancelBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingTop: 50 },
  title: { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.sizes.md, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md, paddingVertical: 8 },
  switchLabel: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.medium, color: theme.colors.textPrimary },
  button: { marginTop: theme.spacing.md },
  cancelBtn: { marginTop: theme.spacing.sm },
});
