import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary' }) => {
  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: theme.colors.successLight, text: theme.colors.success };
      case 'warning': return { bg: theme.colors.warningLight, text: theme.colors.saffron };
      case 'danger': return { bg: theme.colors.dangerLight, text: theme.colors.danger };
      default: return { bg: theme.colors.background, text: theme.colors.primary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.spacing.borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
});
