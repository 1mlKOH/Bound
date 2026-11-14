import React, { useEffect, useState } from 'react';
import { Platform, View, AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import { useTheme, syncThemeWithSystem } from '../src/utils/theme';
import {
  setupNotificationCategoriesAndChannels,
  handleNotificationResponse,
} from '../src/utils/notifications';
import '../global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const initialize = useAttendanceStore((state) => state.initialize);
  const isLoading = useAttendanceStore((state) => state.isLoading);
  const hasOnboarded = useAttendanceStore((state) => state.settings.hasOnboarded);
  const themePref = useAttendanceStore((state) => state.settings.theme);
  const { colors, isDark } = useTheme();

  // Keep NativeWind & React Native Appearance synchronized with user preference
  useEffect(() => {
    syncThemeWithSystem(themePref);
  }, [themePref]);

  // When returning from background, ensure system appearance is re-synced if on system theme
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const currentPref = useAttendanceStore.getState().settings.theme;
        if (currentPref === 'system') {
          syncThemeWithSystem('system');
        }
      }
    });
    return () => subscription.remove();
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });

  const [fontTimedOut, setFontTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFontTimedOut(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    setupNotificationCategoriesAndChannels();

    // Check if app was launched via notification response from cold-start
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response, router);
      }
    });

    // Listen for notification responses while running
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response, router);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  const isReady = !isLoading && (fontsLoaded || fontError || fontTimedOut);

  useEffect(() => {
    if (!isReady) return;
    SplashScreen.hideAsync().catch(() => {});
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isReady, hasOnboarded, segments]);

  if (!isReady) {
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
          <Stack.Screen
            name="stats/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 220,
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
