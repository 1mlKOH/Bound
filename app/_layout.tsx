import React, { useEffect, useState } from 'react';
import { Platform, View, AppState, Text, TouchableOpacity } from 'react-native';
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
  const initError = useAttendanceStore((state) => state.initError);
  const hasOnboarded = useAttendanceStore((state) => state.settings.hasOnboarded);
  const themePref = useAttendanceStore((state) => state.settings.theme);
  const { colors, isDark } = useTheme();

  // Keep NativeWind & React Native Appearance synchronized with user preference
  useEffect(() => {
    syncThemeWithSystem(themePref);
  }, [themePref]);

  // When returning from background, ensure system appearance is re-synced and attendance state refreshed from DB
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const store = useAttendanceStore.getState();
        if (store.settings.theme === 'system') {
          syncThemeWithSystem('system');
        }
        store.refreshFromDb();
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
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasOnboarded && !inOnboarding && !initError) {
      router.replace('/onboarding');
      return;
    }
    SplashScreen.hideAsync().catch(() => {});
  }, [isReady, hasOnboarded, segments, initError]);

  if (initError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Database Error
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 20,
          }}
        >
          {initError}
        </Text>
        <TouchableOpacity
          onPress={() => initialize()}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Retry loading database"
          style={{
            backgroundColor: '#3DDC84',
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 14,
            minHeight: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#0F1015', fontWeight: '700', fontSize: 15 }}>
            Retry Loading
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0F1015',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        Something went wrong
      </Text>
      <Text
        style={{
          color: '#9CA3AF',
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 20,
        }}
      >
        {error?.message || 'An unexpected error occurred.'}
      </Text>
      <TouchableOpacity
        onPress={retry}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Restart app after error"
        style={{
          backgroundColor: '#3DDC84',
          paddingVertical: 12,
          paddingHorizontal: 28,
          borderRadius: 14,
          minHeight: 44,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#0F1015', fontWeight: '700', fontSize: 15 }}>
          Restart App
        </Text>
      </TouchableOpacity>
    </View>
  );
}
