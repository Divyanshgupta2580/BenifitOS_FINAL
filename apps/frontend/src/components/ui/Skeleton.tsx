import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.spacing.borderRadius.sm,
  style,
}) => {
  return <View style={[styles.skeleton, { width, height, borderRadius }, style]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
    marginVertical: 4,
  },
});
