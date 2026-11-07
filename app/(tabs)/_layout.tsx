import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { FloatingBottomNav } from '../../src/components/FloatingBottomNav';

export default function TabsLayout() {
  return (
    <View className="flex-1 bg-[#0F1015]">
      <Slot />
      <FloatingBottomNav />
    </View>
  );
}
