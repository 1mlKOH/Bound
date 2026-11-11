import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import { useTheme } from '../src/utils/theme';
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const initialize = useAttendanceStore((state) => state.initialize);
  const isLoading = useAttendanceStore((state) => state.isLoading);
  const hasOnboarded = useAttendanceStore((state) => state.settings.hasOnboarded);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isLoading, hasOnboarded, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: colors.canvas },
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              presentation: Platform.OS === 'ios' ? 'pageSheet' : 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: colors.canvas },
            }}
          />
          <Stack.Screen
            name="modals/subject-editor"
            options={{
              presentation: Platform.OS === 'ios' ? 'pageSheet' : 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: colors.canvas },
            }}
          />
          <Stack.Screen
            name="modals/extra-class"
            options={{
              presentation: Platform.OS === 'ios' ? 'pageSheet' : 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
              contentStyle: { backgroundColor: colors.canvas },
            }}
          />
        </Stack>
        <Toaster
          theme={isDark ? 'dark' : 'light'}
          position="bottom-center"
          offset={96}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
