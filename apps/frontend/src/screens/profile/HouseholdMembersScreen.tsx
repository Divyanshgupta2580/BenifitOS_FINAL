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

export const HouseholdMembersScreen: React.FC<Props> = ({ onBack }) => {
  const { profile, updateProfile, isUpdating } = useCitizenProfile();
  const members = profile?.householdMembers || [];

  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('SPOUSE');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('FEMALE');
  const [income, setIncome] = useState('0');

  const handleAddMember = async () => {
    if (!fullName || !age) {
      Alert.alert('Validation Error', 'Full Name and Age are required.');
      return;
    }

    const newMember = {
      id: Math.random().toString(),
      fullName,
      relation,
      age: parseInt(age, 10),
      gender,
      annualIncomeINR: parseFloat(income) || 0,
    };

    const updatedMembers = [...members, newMember];

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
        householdMembers: updatedMembers,
      });

      setFullName('');
      setAge('');
      setIncome('0');
      Alert.alert('Member Added', `${fullName} added to household profile.`);
    } catch (err: any) {
      Alert.alert('Failed to Add Member', err.message || 'Could not save household member.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Household Members</Text>
      <Text style={styles.subtitle}>Register family dependents for household income & benefit calculation.</Text>

      {/* List Existing Members */}
      {members.length > 0 ? (
        members.map((m) => (
          <Card key={m.id} style={styles.memberCard}>
            <Text style={styles.memberName}>{m.fullName}</Text>
            <Text style={styles.memberMeta}>
              {m.relation} • Age {m.age} • {m.gender}
            </Text>
            <Text style={styles.memberIncome}>Income: ₹{m.annualIncomeINR.toLocaleString('en-IN')}</Text>
          </Card>
        ))
      ) : (
        <Text style={styles.emptyText}>No household members added yet.</Text>
      )}

      {/* Add New Member Form */}
      <Card style={styles.addCard}>
        <Text style={styles.addTitle}>Add Dependent Member</Text>
        <Input label="Full Name" value={fullName} onChangeText={setFullName} placeholder="e.g. Sunita Devi" />
        <Input label="Relation (SPOUSE / CHILD / PARENT / OTHER)" value={relation} onChangeText={setRelation} />
        <Input label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
        <Input label="Gender (MALE / FEMALE / OTHER)" value={gender} onChangeText={setGender} />
        <Input label="Annual Income (INR)" value={income} onChangeText={setIncome} keyboardType="numeric" />

        <Button title="Add Member" onPress={handleAddMember} isLoading={isUpdating} style={styles.addBtn} />
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
  memberCard: { marginBottom: theme.spacing.sm },
  memberName: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary },
  memberMeta: { fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary, marginTop: 2 },
  memberIncome: { fontSize: theme.typography.sizes.xs, color: theme.colors.saffron, fontWeight: theme.typography.weights.semibold, marginTop: 4 },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: theme.spacing.md },
  addCard: { marginTop: theme.spacing.md, marginBottom: theme.spacing.lg },
  addTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.md },
  addBtn: { marginTop: theme.spacing.sm },
  backBtn: { marginTop: theme.spacing.sm },
});
