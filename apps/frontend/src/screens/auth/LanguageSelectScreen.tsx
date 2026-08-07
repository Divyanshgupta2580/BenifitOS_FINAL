import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { useLanguageStore } from '../../store/language.store';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'கன்னட' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

interface Props {
  onContinue: () => void;
}

export const LanguageSelectScreen: React.FC<Props> = ({ onContinue }) => {
  const { locale, setLocale } = useLanguageStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Language</Text>
      <Text style={styles.subtitle}>Choose your preferred language for government welfare scheme access.</Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {LANGUAGES.map((lang) => {
          const isSelected = locale === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => setLocale(lang.code)}
            >
              <Text style={[styles.langNative, isSelected && styles.textSelected]}>{lang.native}</Text>
              <Text style={[styles.langName, isSelected && styles.textSelected]}>{lang.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Button title="Continue" onPress={onContinue} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginTop: 40,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: theme.spacing.md },
  item: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(15, 60, 92, 0.05)',
  },
  langNative: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  langName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  textSelected: {
    color: theme.colors.primary,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
