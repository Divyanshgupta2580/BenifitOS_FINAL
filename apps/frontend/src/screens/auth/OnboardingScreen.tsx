import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';

const SLIDES = [
  {
    title: 'Discover Welfare Schemes',
    description: 'Find official central and state government benefit schemes tailored specifically to your profile.',
  },
  {
    title: 'Vision OCR Document Vault',
    description: 'Scan Aadhaar, Income Certificates, and Ration Cards with AI Vision for automated document verification.',
  },
  {
    title: 'AI Multi-Lingual Assistant',
    description: 'Chat and speak in your regional language to receive clear, accessible guidance on applications.',
  },
];

interface Props {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onFinish }) => {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      onFinish();
    }
  };

  const slide = SLIDES[index];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationPlaceholder}>
          <Text style={styles.badgeText}>BenefitOS</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.activeDot]} />
        ))}
      </View>

      <Button
        title={index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        onPress={handleNext}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  badgeText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.surface,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  button: {
    marginBottom: theme.spacing.md,
  },
});
