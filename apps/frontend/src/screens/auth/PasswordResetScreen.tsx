import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { theme } from '../../theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api-client';

interface Props {
  onBackToLogin: () => void;
}

export const PasswordResetScreen: React.FC<Props> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      Alert.alert(
        'Reset Link Sent',
        `If an account exists for ${email}, a password reset link has been sent to your email.`,
        [{ text: 'OK', onPress: onBackToLogin }]
      );
    } catch (err: any) {
      Alert.alert(
        'Reset Instruction Sent',
        err.message || `Password reset instructions generated for ${email}.`,
        [{ text: 'OK', onPress: onBackToLogin }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email address to receive password reset instructions.</Text>

      <Input
        label="Email Address"
        placeholder="citizen@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Button title="Send Reset Link" onPress={handleResetRequest} isLoading={isLoading} style={styles.button} />
      <Button title="Back to Login" onPress={onBackToLogin} variant="outline" style={styles.backButton} />
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
  button: {
    marginTop: theme.spacing.md,
  },
  backButton: {
    marginTop: theme.spacing.sm,
  },
});
