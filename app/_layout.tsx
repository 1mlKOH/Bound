import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
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
import { useTheme } from '../src/utils/theme';
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
  const { colors, isDark } = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });

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

  useEffect(() => {
    if (isLoading || (!fontsLoaded && !fontError)) return;
    SplashScreen.hideAsync().catch(() => {});
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isLoading, fontsLoaded, fontError, hasOnboarded, segments]);

  if (isLoading || (!fontsLoaded && !fontError)) {
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
