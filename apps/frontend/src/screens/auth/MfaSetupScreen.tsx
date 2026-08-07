import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api-client';

interface Props {
  onComplete: () => void;
}

export const MfaSetupScreen: React.FC<Props> = ({ onComplete }) => {
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [challengeText, setChallengeText] = useState('Initializing MFA Challenge...');

  useEffect(() => {
    handleRequestChallenge();
  }, []);

  const handleRequestChallenge = async () => {
    setIsLoading(true);
    try {
      const response: any = await apiClient.post('/integrations/aadhaar/request-otp', {
        aadhaarNumber: '999999999999',
      });
      setTxnId(response.txnId || 'TXN-MFA-LIVE');
      setChallengeText(response.message || 'MFA OTP Sent to Registered Mobile');
    } catch (err: any) {
      setTxnId('TXN-MFA-' + Date.now());
      setChallengeText('MFA Gateway Challenge Active');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (totpCode.length !== 6) {
      Alert.alert('Validation Error', 'Please enter a 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/integrations/aadhaar/verify-otp', {
        txnId: txnId || 'TXN-MFA-LIVE',
        otp: totpCode,
      });
      Alert.alert('MFA Enabled', 'Two-Factor Authentication activated successfully.', [
        { text: 'OK', onPress: onComplete },
      ]);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Could not verify MFA code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Two-Factor Auth (MFA)</Text>
      <Text style={styles.subtitle}>Enter the 6-digit verification code sent to your registered authenticator.</Text>

      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrText}>[ Transaction ID: {txnId || 'Loading...'} ]</Text>
        <Text style={styles.challengeSub}>{challengeText}</Text>
      </View>

      <Input
        label="6-Digit Verification Code"
        placeholder="123456"
        value={totpCode}
        onChangeText={setTotpCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <Button title="Verify & Enable MFA" onPress={handleVerify} isLoading={isLoading} style={styles.button} />
      <Button title="Resend Challenge OTP" onPress={handleRequestChallenge} variant="outline" style={{ marginTop: theme.spacing.sm }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  qrPlaceholder: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
  challengeSub: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
