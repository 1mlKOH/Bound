import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../utils/theme';

export type AttendanceTier = 'safe' | 'warning' | 'danger' | 'neutral';

export interface ProgressBarProps {
  /** Current progress value (e.g. 0 to 100 percentage) */
  value: number;
  /** Maximum possible value (defaults to 100) */
  max?: number;
  /** Explicit attendance tier for color presets */
  tier?: AttendanceTier;
  /** Whether the subject/app is in zero-attendance state (no classes held) */
  isZeroState?: boolean;
  /** Target cutoff percentage to automatically derive tier if tier is not explicitly given */
  target?: number;
  /** Whether to render a vertical target cutoff notch indicator */
  showNotch?: boolean;
  /** Custom percentage position for the notch (defaults to target) */
  notchValue?: number;
  /** Height of the progress bar in pixels (defaults to 10) */
  height?: number;
  /** Custom fill color (overrides automatic tier preset) */
  fillColor?: string;
  /** Custom track background color (overrides automatic tier preset) */
  trackColor?: string;
  /** Animation duration in milliseconds (defaults to 380) */
  duration?: number;
  /** Optional delay before starting animation (useful for staggered lists) */
  delay?: number;
  /** Optional container style */
  style?: StyleProp<ViewStyle>;
  /** Optional Tailwind className */
  className?: string;
}

/**
 * High-performance, GPU-accelerated Progress Bar component inspired by Arc UI.
 *
 * Key Engineering Details:
 * 1. Uses `translateX` sliding fill instead of `width` scaling, which runs 100% on
 *    the native GPU thread (`useNativeDriver: true`) without triggering expensive
 *    layout recalculations (`requestLayout()`) on Android.
 * 2. Uses Arc's critically damped bezier curve `[0.16, 1, 0.3, 1]` with zero bounce,
 *    ensuring the progress bar smoothly glides and settles without overshooting or reversing.
 * 3. Dynamically handles chromatic attendance status presets (Safe, Near Target, Low, Neutral).
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  tier: propTier,
  isZeroState = false,
  target = 75,
  showNotch = false,
  notchValue,
  height = 10,
  fillColor,
  trackColor,
  duration = 380,
  delay = 0,
  style,
  className = '',
}) => {
  const { isDark } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  // Automatically derive tier if not explicitly specified
  const derivedTier: AttendanceTier = useMemo(() => {
    if (propTier) return propTier;
    if (isZeroState) return 'neutral';
    if (value < target) return 'danger';
    if (value < target + 5) return 'warning';
    return 'safe';
  }, [propTier, isZeroState, value, target]);

  // Color presets matching Bound's chromatic design tokens
  const defaultColors = useMemo(() => {
    switch (derivedTier) {
      case 'neutral':
        return {
          fill: isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.15)',
          track: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        };
      case 'danger':
        return {
          fill: isDark ? '#FF6B72' : '#D1323A',
          track: isDark ? '#3D121B' : '#FECDD3',
        };
      case 'warning':
        return {
          fill: isDark ? '#FFB020' : '#B26A00',
          track: isDark ? '#3D270E' : '#FDE68A',
        };
      case 'safe':
      default:
        return {
          fill: isDark ? '#3DDC84' : '#0D8A33',
          track: isDark ? '#143D27' : '#C8EED9',
        };
    }
  }, [derivedTier, isDark]);

  const activeFillColor = fillColor || defaultColors.fill;
  const activeTrackColor = trackColor || defaultColors.track;

  // Clamp target percentage between 0 and 100
  const safeMax = max > 0 ? max : 100;
  const safeValue = isZeroState ? 0 : Math.min(safeMax, Math.max(0, value));
  const targetPercent = (safeValue / safeMax) * 100;

  // Animated value tracking progress from 0 to 100
  const animProgress = useRef(new Animated.Value(targetPercent)).current;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: targetPercent,
      duration,
      delay,
      // Arc UI standard smooth enter curve (critically damped, bounce: 0, no overshoot or reverse)
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, [targetPercent, duration, delay]);

  // Native GPU-driven translateX interpolation: slides from -trackWidth (0%) to 0 (100%)
  const translateX = animProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [-trackWidth, 0],
    extrapolate: 'clamp',
  });

  const notchPos = Math.min(100, Math.max(0, notchValue ?? target));

  return (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - trackWidth) > 0.5) {
          setTrackWidth(w);
        }
      }}
      style={[
        {
          height,
          backgroundColor: activeTrackColor,
          borderRadius: 999,
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      ]}
      className={`w-full ${className}`}
    >
      {/* Fill Bar - constant width 100%, slides on native compositor thread */}
      {trackWidth > 0 && (
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: activeFillColor,
            borderRadius: 999,
            transform: [{ translateX }],
          }}
        />
      )}

      {/* Optional Target Cutoff Notch */}
      {showNotch && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${notchPos}%`,
            width: 2.5,
            height: height + 8,
            borderRadius: 1.5,
            backgroundColor: isDark ? '#FFFFFF' : '#111114',
            top: -4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      )}
    </View>
  );
};

export default ProgressBar;
