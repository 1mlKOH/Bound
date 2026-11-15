import React from 'react';
import { View } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FloatingBottomNav } from '../../src/components/FloatingBottomNav';
import { TopHeader } from '../../src/components/TopHeader';
import { useTheme } from '../../src/utils/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const pathname = usePathname();

  const isSubjects = pathname.includes('subjects');
  const isStats = pathname.includes('stats');
  const isHome = !isSubjects && !isStats;

  const headerTitle = isHome ? 'Bound' : isSubjects ? 'Subjects' : 'Stats';
  const showLogo = isHome;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={['top']}>
      <TopHeader title={headerTitle} showLogo={showLogo} />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <FloatingBottomNav />
    </SafeAreaView>
  );
}
