import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';

interface Props {
  onBack: () => void;
}

export const DemographicsEditScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();

  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [dob, setDob] = useState(profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '1995-01-01');
  const [gender, setGender] = useState(profile?.gender || 'MALE');
  const [maritalStatus, setMaritalStatus] = useState(profile?.maritalStatus || 'SINGLE');
  const [socialCategory, setSocialCategory] = useState(profile?.socialCategory || 'GENERAL');
  const [employmentStatus, setEmploymentStatus] = useState(profile?.employmentStatus || 'UNEMPLOYED');
  const [income, setIncome] = useState(profile?.annualIncomeINR ? String(profile.annualIncomeINR) : '150000');
  const [disabilityType, setDisabilityType] = useState(profile?.disabilityType || 'NONE');
  const [disabilityPercent, setDisabilityPercent] = useState(profile?.disabilityPercent ? String(profile.disabilityPercent) : '0');
  const [isBpl, setIsBpl] = useState(profile?.isBplCardHolder || false);
  const [bplCardNumber, setBplCardNumber] = useState(profile?.bplCardNumber || '');

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Validation Error', 'First and Last name are required.');
      return;
    }
    try {
      await updateProfile({
        firstName,
        lastName,
        dateOfBirth: new Date(dob).toISOString(),
        gender,
        maritalStatus,
        socialCategory,
        employmentStatus,
        annualIncomeINR: parseFloat(income) || 0,
        disabilityType,
        disabilityPercent: parseFloat(disabilityPercent) || 0,
        isBplCardHolder: isBpl,
        bplCardNumber: isBpl ? bplCardNumber : undefined,
      });
      Alert.alert('Success', 'Profile demographics updated successfully!', [{ text: 'OK', onPress: onBack }]);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not save profile changes.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Demographics</Text>
      <Text style={styles.subtitle}>Update your demographic & income attributes for scheme eligibility calculation.</Text>

      <Input label="First Name" value={firstName} onChangeText={setFirstName} />
      <Input label="Last Name" value={lastName} onChangeText={setLastName} />
      <Input label="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} placeholder="1995-01-01" />

      <Input label="Gender (MALE / FEMALE / TRANSGENDER / OTHER)" value={gender} onChangeText={setGender} />
      <Input label="Marital Status (SINGLE / MARRIED / DIVORCED / WIDOWED)" value={maritalStatus} onChangeText={setMaritalStatus} />
      <Input label="Social Category (GENERAL / OBC / SC / ST / EWS)" value={socialCategory} onChangeText={setSocialCategory} />
      <Input label="Employment Status (EMPLOYED / UNEMPLOYED / FARMER / etc)" value={employmentStatus} onChangeText={setEmploymentStatus} />

      <Input label="Annual Income (INR)" value={income} onChangeText={setIncome} keyboardType="numeric" />
      <Input label="Disability Type (NONE / VISUAL / HEARING / LOCOMOTOR)" value={disabilityType} onChangeText={setDisabilityType} />
      <Input label="Disability Percentage (%)" value={disabilityPercent} onChangeText={setDisabilityPercent} keyboardType="numeric" />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>BPL Card Holder?</Text>
        <Switch value={isBpl} onValueChange={setIsBpl} trackColor={{ true: theme.colors.primary }} />
      </View>

      {isBpl && <Input label="BPL Card Number" value={bplCardNumber} onChangeText={setBplCardNumber} />}

      <Button title="Save Demographics" onPress={handleSave} isLoading={isUpdating} style={styles.button} />
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
