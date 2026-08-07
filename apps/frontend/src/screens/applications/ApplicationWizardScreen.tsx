import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useSchemes } from '../../hooks/useSchemes';
import { useCitizenProfile } from '../../hooks/useCitizenProfile';
import { useDocuments } from '../../hooks/useDocuments';
import { useCreateApplication } from '../../hooks/useCreateApplication';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export const ApplicationWizardScreen: React.FC<Props> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [declarationChecked, setDeclarationChecked] = useState<boolean>(false);
  const [applicantNotes, setApplicantNotes] = useState<string>('');

  const { schemes } = useSchemes();
  const { profile } = useCitizenProfile();
  const { documents } = useDocuments();
  const { createApplication, isCreating } = useCreateApplication();

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId);

  const toggleDocSelection = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      setSelectedDocIds(selectedDocIds.filter((id) => id !== docId));
    } else {
      setSelectedDocIds([...selectedDocIds, docId]);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedSchemeId) {
      Alert.alert('Validation Error', 'Please select a welfare scheme for application draft.');
      return;
    }

    try {
      await createApplication({
        schemeId: selectedSchemeId,
        formData: { applicantNotes, autoFilledDemographics: { firstName: profile?.firstName, lastName: profile?.lastName } },
        attachedDocumentIds: selectedDocIds,
      });
      Alert.alert('Draft Saved', 'Welfare application draft saved successfully.', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save application draft.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedSchemeId) {
      Alert.alert('Validation Error', 'Please select a welfare scheme.');
      return;
    }

    if (!declarationChecked) {
      Alert.alert('Declaration Required', 'You must agree to the self-declaration terms.');
      return;
    }

    try {
      await createApplication({
        schemeId: selectedSchemeId,
        formData: { applicantNotes, autoFilledDemographics: { firstName: profile?.firstName, lastName: profile?.lastName }, submittedAt: new Date().toISOString() },
        attachedDocumentIds: selectedDocIds,
      });
      Alert.alert('Application Submitted', 'Your welfare application has been submitted for department review.', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Could not submit welfare application.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backLink}>
        <Text style={styles.backText}>← Back to Applications</Text>
      </TouchableOpacity>

      <Text style={styles.screenTitle}>Application Wizard</Text>
      <Text style={styles.screenSubtitle}>Step {step} of 4: Direct Benefit Transfer Application</Text>

      {/* Progress Bar Indicator */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
      </View>

      {/* Step 1: Scheme Selection */}
      {step === 1 && (
        <Card style={styles.card}>
          <Text style={styles.stepTitle}>Step 1: Select Target Scheme</Text>
          <Text style={styles.stepSub}>Choose the government scheme you wish to apply for.</Text>

          {schemes.map((s) => {
            const isSelected = selectedSchemeId === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.schemeOption, isSelected && styles.schemeOptionSelected]}
                onPress={() => setSelectedSchemeId(s.id)}
              >
                <View style={styles.schemeOptionHeader}>
                  <Text style={styles.schemeCode}>{s.code}</Text>
                  <Badge label={`₹${s.financialBenefit.toLocaleString('en-IN')}`} variant="success" />
                </View>
                <Text style={styles.schemeTitle}>{s.title}</Text>
                <Text style={styles.schemeDept}>{s.department}</Text>
              </TouchableOpacity>
            );
          })}

          <Button
            title="Next: Review Profile Data →"
            onPress={() => {
              if (!selectedSchemeId) {
                Alert.alert('Select Scheme', 'Please select a scheme to proceed.');
                return;
              }
              setStep(2);
            }}
            style={styles.nextBtn}
          />
        </Card>
      )}

      {/* Step 2: Auto-Filled Profile Data */}
      {step === 2 && (
        <Card style={styles.card}>
          <Text style={styles.stepTitle}>Step 2: Citizen Data Auto-Fill</Text>
          <Text style={styles.stepSub}>Review information auto-populated from your verified profile.</Text>

          <View style={styles.dataBlock}>
            <Text style={styles.dataLabel}>Applicant Name</Text>
            <Text style={styles.dataValue}>
              {profile ? `${profile.firstName} ${profile.lastName}` : 'Not Specified'}
            </Text>

            <Text style={styles.dataLabel}>Gender / DOB</Text>
            <Text style={styles.dataValue}>
              {profile ? `${profile.gender} • ${new Date(profile.dateOfBirth).toLocaleDateString()}` : 'N/A'}
            </Text>

            <Text style={styles.dataLabel}>State & District</Text>
            <Text style={styles.dataValue}>
              {profile?.address ? `${profile.address.district}, ${profile.address.state} (${profile.address.pincode})` : 'N/A'}
            </Text>
          </View>

          <Input
            label="Additional Application Notes (Optional)"
            value={applicantNotes}
            onChangeText={setApplicantNotes}
            placeholder="e.g. Special circumstance or urgent processing request"
          />

          <View style={styles.navRow}>
            <Button title="← Previous" onPress={() => setStep(1)} variant="outline" style={styles.halfBtn} />
            <Button title="Next: Attach Vault Docs →" onPress={() => setStep(3)} style={styles.halfBtn} />
          </View>
        </Card>
      )}

      {/* Step 3: Attach Vault Documents */}
      {step === 3 && (
        <Card style={styles.card}>
          <Text style={styles.stepTitle}>Step 3: Attach Vault Documents</Text>
          <Text style={styles.stepSub}>Select verified documents from your Document Vault to link to this application.</Text>

          {documents.length > 0 ? (
            documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.docOption, isSelected && styles.docOptionSelected]}
                  onPress={() => toggleDocSelection(doc.id)}
                >
                  <View style={styles.docOptionHeader}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.docName}>{doc.fileName}</Text>
                  </View>
                  <Badge label={doc.documentType} variant="primary" />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No documents in vault. You can still proceed and attach later.</Text>
          )}

          <View style={styles.navRow}>
            <Button title="← Previous" onPress={() => setStep(2)} variant="outline" style={styles.halfBtn} />
            <Button title="Next: Final Declaration →" onPress={() => setStep(4)} style={styles.halfBtn} />
          </View>
        </Card>
      )}

      {/* Step 4: Final Declaration & Submission */}
      {step === 4 && (
        <Card style={styles.card}>
          <Text style={styles.stepTitle}>Step 4: Self-Declaration & Submit</Text>
          <Text style={styles.stepSub}>Review summary details before submitting to government welfare portal.</Text>

          <View style={styles.summaryBlock}>
            <Text style={styles.summaryTitle}>Selected Scheme</Text>
            <Text style={styles.summaryText}>{selectedScheme?.title || 'Scheme Selected'}</Text>

            <Text style={styles.summaryTitle}>Documents Attached</Text>
            <Text style={styles.summaryText}>{selectedDocIds.length} Vault Documents Linked</Text>
          </View>

          <TouchableOpacity style={styles.decRow} onPress={() => setDeclarationChecked(!declarationChecked)}>
            <View style={[styles.checkbox, declarationChecked && styles.checkboxActive]}>
              {declarationChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.decText}>
              I hereby declare that all details furnished in this application are true and correct to the best of my knowledge.
            </Text>
          </TouchableOpacity>

          <Button title="Save Application Draft" onPress={handleSaveDraft} variant="outline" style={styles.saveDraftBtn} />
          <Button title="Submit Application" onPress={handleSubmit} isLoading={isCreating} style={styles.submitBtn} />
          <Button title="← Previous Step" onPress={() => setStep(3)} variant="outline" style={styles.prevBtn} />
        </Card>
      )}
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
  progressBar: { height: 6, backgroundColor: theme.colors.surface, borderRadius: 3, marginBottom: theme.spacing.lg, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.colors.primary },
  card: { marginBottom: theme.spacing.md },
  stepTitle: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: 2 },
  stepSub: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  schemeOption: { padding: theme.spacing.md, borderRadius: theme.spacing.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.sm, backgroundColor: theme.colors.surface },
  schemeOptionSelected: { borderColor: theme.colors.primary, backgroundColor: 'rgba(15, 60, 92, 0.05)' },
  schemeOptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  schemeCode: { fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.saffron },
  schemeTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  schemeDept: { fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary },
  nextBtn: { marginTop: theme.spacing.md },
  dataBlock: { backgroundColor: theme.colors.background, padding: theme.spacing.md, borderRadius: theme.spacing.borderRadius.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  dataLabel: { fontSize: 10, color: theme.colors.textMuted },
  dataValue: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
  halfBtn: { width: '48%' },
  docOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.spacing.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, marginBottom: theme.spacing.xs },
  docOptionSelected: { borderColor: theme.colors.primary, backgroundColor: 'rgba(15, 60, 92, 0.05)' },
  docOptionHeader: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: theme.colors.primary, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.colors.primary },
  checkmark: { color: theme.colors.surface, fontSize: 12, fontWeight: 'bold' },
  docName: { fontSize: theme.typography.sizes.sm, color: theme.colors.textPrimary, fontWeight: theme.typography.weights.medium },
  emptyText: { fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, fontStyle: 'italic', marginBottom: theme.spacing.md },
  summaryBlock: { backgroundColor: theme.colors.background, padding: theme.spacing.md, borderRadius: theme.spacing.borderRadius.md, marginBottom: theme.spacing.md },
  summaryTitle: { fontSize: 10, color: theme.colors.textMuted },
  summaryText: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: theme.spacing.xs },
  decRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.lg },
  decText: { fontSize: theme.typography.sizes.xs, color: theme.colors.textPrimary, flex: 1, lineHeight: 18 },
  saveDraftBtn: { marginBottom: theme.spacing.xs },
  submitBtn: { marginBottom: theme.spacing.xs },
  prevBtn: { marginTop: theme.spacing.xs },
});
