import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Haptics } from '../src/utils/haptics';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import { useTheme } from '../src/utils/theme';
import { BoundLogo } from '../src/components/BoundLogo';
import { CloseIcon, ZapIcon } from '../src/components/icons';
import { fontFamilyNames } from '../src/utils/typography';
import { toast } from 'sonner-native';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const { colors, isDark } = useTheme();

  const isPro = useAttendanceStore((state) => state.isPro);
  const setPro = useAttendanceStore((state) => state.setPro);

  const handleTogglePro = (targetState: boolean) => {
    try {
      Haptics.notificationAsync(
        targetState
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch {}

    setPro(targetState);

    if (targetState) {
      toast.success('Bound Pro Activated!', {
        description: 'Your 5×2 Home Screen Widget is now unlocked and live.',
      });
      setTimeout(() => {
        router.back();
      }, 600);
    } else {
      toast.info('Bound Pro Deactivated', {
        description: 'Widget is now in locked preview mode.',
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Header with Close */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BoundLogo size={32} />
          <Text
            style={[
              styles.headerBrand,
              { color: colors.text, fontFamily: fontFamilyNames.bold },
            ]}
          >
            Bound <Text style={{ color: colors.statusWarning }}>Pro</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[
            styles.closeButton,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <CloseIcon size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.heroBadge}>
            <ZapIcon size={14} color="#FFB020" />
            <Text
              style={[
                styles.heroBadgeText,
                { fontFamily: fontFamilyNames.bold, color: '#FFB020' },
              ]}
            >
              PREMIUM EXPERIENCE
            </Text>
          </View>

          <Text
            style={[
              styles.heroTitle,
              { color: colors.text, fontFamily: fontFamilyNames.extraBold },
            ]}
          >
            {isPro ? 'You Have Bound Pro' : 'Unlock Home Screen Widgets & Live Tracking'}
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              { color: colors.textSecondary, fontFamily: fontFamilyNames.medium },
            ]}
          >
            {isPro
              ? 'Enjoy unrestricted access to home screen widgets, 1-tap attendance marking, and predictive skip buffers.'
              : 'Mark attendance in 1 tap directly from your home screen and track live skip buffers without opening the app.'}
          </Text>

          {/* Interactive 5x2 Widget Preview */}
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor: isDark ? '#0F1014' : '#F3F3F5',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.previewHeader}>
              <View style={styles.previewBrand}>
                <BoundLogo size={18} />
                <Text
                  style={[
                    styles.previewBrandText,
                    { color: colors.text, fontFamily: fontFamilyNames.bold },
                  ]}
                >
                  Bound · Today
                </Text>
              </View>
              <View
                style={[
                  styles.previewPill,
                  { backgroundColor: isDark ? '#25262E' : '#E4E5EA' },
                ]}
              >
                <Text
                  style={[
                    styles.previewPillText,
                    { color: colors.text, fontFamily: fontFamilyNames.bold },
                  ]}
                >
                  All Present
                </Text>
              </View>
            </View>

            {/* Mock Subject Rows */}
            <View
              style={[
                styles.mockCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.mockLeft}>
                <View style={[styles.mockIcon, { backgroundColor: '#3DDC84' }]}>
                  <Text style={styles.mockInitial}>CS</Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.mockTitle,
                      { color: colors.text, fontFamily: fontFamilyNames.bold },
                    ]}
                  >
                    CS201 · 89%
                  </Text>
                  <Text
                    style={[
                      styles.mockSubtitle,
                      { color: colors.textMuted, fontFamily: fontFamilyNames.medium },
                    ]}
                  >
                    09:00 · Can miss 4
                  </Text>
                </View>
              </View>

              <View style={styles.mockButtons}>
                <View
                  style={[
                    styles.mockCircle,
                    { backgroundColor: '#00BF63' },
                  ]}
                >
                  <Text style={{ color: '#06210F', fontWeight: 'bold' }}>✓</Text>
                </View>
                <View
                  style={[
                    styles.mockCircle,
                    { backgroundColor: isDark ? '#25262E' : '#E4E5EA' },
                  ]}
                >
                  <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>✕</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Feature List */}
        <View style={styles.featureSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontFamily: fontFamilyNames.bold },
            ]}
          >
            Included in Bound Pro
          </Text>

          <View
            style={[
              styles.featureCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(61, 220, 132, 0.15)' }]}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
              </View>
              <View style={styles.featureContent}>
                <Text
                  style={[
                    styles.featureHeading,
                    { color: colors.text, fontFamily: fontFamilyNames.bold },
                  ]}
                >
                  5×2 Android Home Screen Widget
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary, fontFamily: fontFamilyNames.regular },
                  ]}
                >
                  Scroll through today's classes and mark Present or Absent in 1 tap.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(255, 176, 32, 0.15)' }]}>
                <Text style={{ fontSize: 16 }}>🎯</Text>
              </View>
              <View style={styles.featureContent}>
                <Text
                  style={[
                    styles.featureHeading,
                    { color: colors.text, fontFamily: fontFamilyNames.bold },
                  ]}
                >
                  Live Skip Buffer Calculation
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary, fontFamily: fontFamilyNames.regular },
                  ]}
                >
                  Instant threshold math telling you exactly how many classes you can afford to miss.
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconBox, { backgroundColor: 'rgba(30, 155, 255, 0.15)' }]}>
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </View>
              <View style={styles.featureContent}>
                <Text
                  style={[
                    styles.featureHeading,
                    { color: colors.text, fontFamily: fontFamilyNames.bold },
                  ]}
                >
                  Smart Heads-up Reminders
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary, fontFamily: fontFamilyNames.regular },
                  ]}
                >
                  Interactive notification alerts with automatic status bar cleanup.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            onPress={() => handleTogglePro(!isPro)}
            activeOpacity={0.85}
            style={[
              styles.ctaButton,
              {
                backgroundColor: isPro ? colors.statusSafe : '#3DDC84',
              },
            ]}
          >
            <Text
              style={[
                styles.ctaButtonText,
                { fontFamily: fontFamilyNames.bold, color: '#06210F' },
              ]}
            >
              {isPro ? '✓ Pro Enabled (Tap to Revert)' : 'Unlock Bound Pro (Instant Test)'}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.disclaimerText,
              { color: colors.textMuted, fontFamily: fontFamilyNames.regular },
            ]}
          >
            {params.source === 'widget_action' || params.source === 'widget_locked'
              ? 'Referred directly from your Home Screen Widget'
              : 'Local-first offline attendance tracker'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBrand: {
    fontSize: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 16,
  },
  previewBox: {
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewBrandText: {
    fontSize: 12,
  },
  previewPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  previewPillText: {
    fontSize: 10.5,
  },
  mockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  mockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mockIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  mockTitle: {
    fontSize: 13,
  },
  mockSubtitle: {
    fontSize: 11,
  },
  mockButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  mockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  featureCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureHeading: {
    fontSize: 14,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: 28,
    alignItems: 'center',
    gap: 10,
  },
  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 15,
  },
  disclaimerText: {
    fontSize: 11.5,
    textAlign: 'center',
  },
});
