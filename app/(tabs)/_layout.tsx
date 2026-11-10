import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { FloatingBottomNav } from '../../src/components/FloatingBottomNav';
import { useTheme } from '../../src/utils/theme';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Slot />
      <FloatingBottomNav />
    </View>
  );
}
