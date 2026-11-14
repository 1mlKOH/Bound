import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '../src/utils/theme';
import { Haptics } from '../src/utils/haptics';

export default function NotFoundScreen() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={[
          styles.container,
          { backgroundColor: colors.canvas },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: colors.cardShadow,
            },
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 24 }}>🧭</Text>
          </View>

          <Text
            style={[styles.sfText, { color: colors.text }]}
            className="text-lg font-bold text-center mb-2"
          >
            Page not found
          </Text>

          <Text
            style={[styles.sfText, { color: colors.textSecondary }]}
            className="text-sm text-center mb-6 leading-5"
          >
            This screen or link doesn't exist or has moved.
          </Text>

          <Link href="/" asChild>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => Haptics.selectionAsync()}
              style={{
                backgroundColor: '#00BF63',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 999,
              }}
            >
              <Text style={[styles.sfText, { color: '#06210F', fontWeight: '800', fontSize: 14 }]}>
                Return Home
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  sfText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
