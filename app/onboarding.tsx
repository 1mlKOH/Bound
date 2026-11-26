import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { NumberFlow } from 'number-flow-react-native';
import { useAttendanceStore } from '../src/store/useAttendanceStore';
import { useTheme } from '../src/utils/theme';
import { fontFamilyNames } from '../src/utils/typography';
import { Haptics } from '../src/utils/haptics';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  BellIcon,
  CalendarSparklesIcon,
  PlusIcon,
  MinusIcon,
} from '../src/components/icons';
import { requestNotificationPermissions } from '../src/utils/notifications';
import { toast } from 'sonner-native';

// Emil Kowalski-inspired scale-on-press physical button wrapper
interface PressableScaleProps {
  onPress: () => void;
  disabled?: boolean;
  activeScale?: number;
  children: React.ReactNode;
  style?: any;
  containerStyle?: any;
  hitSlop?: any;
  accessible?: boolean;
  accessibilityRole?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: any;
}

const PressableScale: React.FC<PressableScaleProps> = ({
  onPress,
  disabled,
  activeScale = 0.94,
  children,
  style,
  containerStyle,
  hitSlop,
  accessible,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: activeScale,
      damping: 15,
      stiffness: 400,
      mass: 0.4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 12,
      stiffness: 280,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      style={containerStyle}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// Semicircular notched ticket component
interface TicketShapeProps {
  width: number;
  height: number;
  color: string;
  notchX: number;
  notchRadius?: number;
  cornerRadius?: number;
}

const TicketShape: React.FC<TicketShapeProps> = ({
  width,
  height,
  color,
  notchX,
  notchRadius = 9,
  cornerRadius = 16,
}) => {
  const d = `
    M 0 ${cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} 0
    L ${notchX - notchRadius} 0
    A ${notchRadius} ${notchRadius} 0 0 0 ${notchX + notchRadius} 0
    L ${width - cornerRadius} 0
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${cornerRadius}
    L ${width} ${height - cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius} ${height}
    L ${notchX + notchRadius} ${height}
    A ${notchRadius} ${notchRadius} 0 0 0 ${notchX - notchRadius} ${height}
    L ${cornerRadius} ${height}
    A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${height - cornerRadius}
    Z
  `;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path d={d} fill={color} />
      <Line
        x1={notchX}
        y1={notchRadius + 2}
        x2={notchX}
        y2={height - notchRadius - 2}
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
    </Svg>
  );
};

// Glide Hero Graphic for Screen 1 (Paper plane soaring above safety threshold)
interface GlideHeroProps {
  width: number;
}

const GlideHero: React.FC<GlideHeroProps> = ({ width }) => {
  const { isDark } = useTheme();
  const heroWidth = Math.min(320, width - 48);
  const heroHeight = 220;

  // Gentle continuous aerodynamic floating loop
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Entrance slide and pop
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(entranceAnim, {
      toValue: 1,
      damping: 14,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();

    // Infinite gentle aerodynamic floating loop
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [entranceAnim, floatAnim]);

  // Float interpolations (sine wave translation + subtle rotational tilt)
  const planeFloatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });
  const planeFloatRotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-1.5deg', '2deg'],
  });

  // Entrance interpolations
  const planeEntranceX = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 0],
  });
  const planeEntranceY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const planeScale = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });
  const planeOpacity = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View
      style={{
        width: heroWidth,
        height: heroHeight,
        alignSelf: 'center',
        marginVertical: 12,
      }}
    >
      {/* Background SVG: Aerodynamic trails and 75% Safe Threshold line */}
      <Svg width={heroWidth} height={heroHeight} viewBox="0 0 320 220">
        {/* Speed trail dashes */}
        <Path
          d="M 32 148 L 52 148 M 64 148 L 76 148"
          stroke={isDark ? 'rgba(30, 155, 255, 0.4)' : 'rgba(30, 155, 255, 0.35)'}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M 22 162 L 40 162 M 50 162 L 60 162"
          stroke={isDark ? 'rgba(255, 184, 0, 0.4)' : 'rgba(255, 184, 0, 0.35)'}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M 16 176 L 30 176 M 38 176 L 46 176"
          stroke={isDark ? 'rgba(61, 220, 132, 0.4)' : 'rgba(13, 138, 51, 0.35)'}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Dynamic Curved Contrail 1: Sky Blue */}
        <Path
          d="M 86 148 C 130 148, 165 136, 198 108 C 220 89, 238 74, 250 64"
          stroke="#1E9BFF"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />

        {/* Dynamic Curved Contrail 2: Vibrant Amber/Gold */}
        <Path
          d="M 70 162 C 118 162, 155 149, 188 120 C 210 101, 228 86, 240 76"
          stroke="#FFB800"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />

        {/* Dynamic Curved Contrail 3: Emerald Green */}
        <Path
          d="M 56 176 C 106 176, 145 162, 178 132 C 200 113, 218 98, 230 88"
          stroke="#3DDC84"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />

        {/* Horizontal Safety Threshold Line */}
        <Line
          x1={24}
          y1={194}
          x2={296}
          y2={194}
          stroke={isDark ? '#3DDC84' : '#0D8A33'}
          strokeWidth={2}
          strokeDasharray="5 5"
          strokeOpacity={0.8}
        />
      </Svg>

      {/* Floating Animated Paper Airplane */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 14,
          right: 22,
          width: 90,
          height: 75,
          opacity: planeOpacity,
          transform: [
            { translateX: planeEntranceX },
            { translateY: Animated.add(planeEntranceY, planeFloatY) },
            { rotate: planeFloatRotate },
            { scale: planeScale },
          ],
        }}
      >
        <Svg width={90} height={75} viewBox="0 0 90 75">
          {/* Origami Paper Airplane Facets */}
          {/* Keel / Underside fold shadow */}
          <Path d="M 34 42 L 22 58 L 16 50 Z" fill="#94A3B8" />

          {/* Bottom Wing (downside facet) */}
          <Path d="M 82 18 L 22 58 L 62 66 Z" fill="#E2E8F0" />

          {/* Center Crease (spine shadow facet) */}
          <Path d="M 82 18 L 34 42 L 22 58 Z" fill="#CBD5E1" />

          {/* Top Wing (main highlighted facet) */}
          <Path d="M 82 18 L 18 14 L 34 42 Z" fill="#FFFFFF" />

          {/* Fold outline accents for high contrast */}
          <Line x1={82} y1={18} x2={22} y2={58} stroke="rgba(100, 116, 139, 0.4)" strokeWidth={1} />
          <Line x1={82} y1={18} x2={18} y2={14} stroke="rgba(100, 116, 139, 0.3)" strokeWidth={1} />

          {/* Micro Emerald Safe Badge on Upper Wing */}
          <Circle cx={44} cy={27} r={6.5} fill="#3DDC84" />
          <Path
            d="M 41.5 27 L 43.5 29 L 46.5 25"
            stroke="#FFFFFF"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>

      {/* 75% SAFE THRESHOLD Badge */}
      <View
        style={{
          position: 'absolute',
          bottom: 4,
          alignSelf: 'center',
          backgroundColor: isDark ? 'rgba(6, 38, 18, 0.85)' : 'rgba(235, 252, 242, 0.95)',
          borderColor: isDark ? 'rgba(61, 220, 132, 0.45)' : 'rgba(13, 138, 51, 0.4)',
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 3,
        }}
      >
        <Text
          style={[
            styles.sfText,
            styles.tabular,
            { color: isDark ? '#3DDC84' : '#0D8A33' },
          ]}
          className="text-[11px] font-extrabold tracking-widest text-center uppercase"
        >
          75% Safe Threshold
        </Text>
      </View>
    </View>
  );
};

// Demo preview tickets for Screen 3
const PREVIEW_COURSES = [
  {
    id: 'PHY101',
    code: 'PHY101',
    name: 'Physics',
    days: 'MON · WED · FRI',
    color: '#1E9BFF',
    classes: '+4 Classes',
    pct: '86%',
    statusText: 'SAFE',
  },
  {
    id: 'CS201',
    code: 'CS201',
    name: 'Data Structures',
    days: 'TUE · THU',
    color: '#A25CF2',
    classes: '+2 Classes',
    pct: '79%',
    statusText: 'SAFE',
  },
  {
    id: 'MAT102',
    code: 'MAT102',
    name: 'Calculus',
    days: 'MON · THU · FRI',
    color: '#FF8A1F',
    classes: '+5 Classes',
    pct: '91%',
    statusText: 'SAFE',
  },
];

// Preset tiers for Screen 2 (Flexible, Standard, Strict, Honors)
const PRESET_TIERS = [
  { pct: 70, label: 'Flexible' },
  { pct: 75, label: 'Standard' },
  { pct: 80, label: 'Strict' },
  { pct: 85, label: 'Honors' },
];

// Dynamic attendance requirement subtitle based on percentage
const getRequirementLabel = (pct: number) => {
  if (pct < 75) return 'Flexible attendance requirement';
  if (pct < 80) return 'Standard attendance requirement';
  if (pct < 85) return 'Strict attendance requirement';
  return 'Honors attendance requirement';
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { completeOnboarding, settings } = useAttendanceStore();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  // Screen 2: Target percentage state & Emil Kowalski micro-spring animations
  const [targetPct, setTargetPct] = useState<number>(settings.globalTargetPct || 75);
  const numberScaleAnim = useRef(new Animated.Value(1)).current;
  const screen2EntranceAnim = useRef(new Animated.Value(0)).current;

  // Emil Kowalski-inspired dynamic requirement label transition (crossfade + slide)
  const requirementLabel = getRequirementLabel(targetPct);
  const [displayedLabel, setDisplayedLabel] = useState<string>(requirementLabel);
  const labelAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (requirementLabel !== displayedLabel) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 90,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setDisplayedLabel(requirementLabel);
        Animated.spring(labelAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 260,
          mass: 0.5,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [requirementLabel, displayedLabel]);

  // Screen 2 Staggered Entrance on active page
  useEffect(() => {
    if (currentPage === 1) {
      screen2EntranceAnim.setValue(0);
      Animated.spring(screen2EntranceAnim, {
        toValue: 1,
        damping: 18,
        stiffness: 220,
        mass: 0.7,
        useNativeDriver: true,
      }).start();
    }
  }, [currentPage]);

  // Tactile micro-pulse on number adjustment
  const triggerNumberScale = () => {
    numberScaleAnim.setValue(0.95);
    Animated.spring(numberScaleAnim, {
      toValue: 1,
      damping: 14,
      stiffness: 280,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  };

  // Screen 3: Interactive ticket state
  const [selectedCourseIdx, setSelectedCourseIdx] = useState<number>(0);
  const ticketAnim = useRef(new Animated.Value(1)).current;

  // Screen 4: Bell Permission Primer & Smart Alerts state (off by default)
  const [enableReminders, setEnableReminders] = useState<boolean>(false);
  const [enableSundayDigest, setEnableSundayDigest] = useState<boolean>(false);
  const [previewAlertMode, setPreviewAlertMode] = useState<'safe' | 'warning'>('safe');
  const bellFloatAnim = useRef(new Animated.Value(0)).current;
  const isNavigating = useRef<boolean>(false);

  // Screen 4: Request native notification permissions when user enables either switch
  const handleToggleReminders = async (val: boolean) => {
    Haptics.selectionAsync();
    if (val) {
      try {
        const granted = await requestNotificationPermissions();
        if (granted) {
          setEnableReminders(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success('Pre-lecture alerts enabled', {
            description: "You'll get live skip bank alerts 5/15 minutes earlier.",
          });
        } else {
          setEnableReminders(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          toast.info('Notification permission not granted', {
            description: 'You can enable notifications anytime in device Settings.',
          });
        }
      } catch (err) {
        console.warn('Error requesting notification permissions:', err);
        setEnableReminders(false);
      }
    } else {
      setEnableReminders(false);
    }
  };

  const handleToggleSundayDigest = async (val: boolean) => {
    Haptics.selectionAsync();
    if (val) {
      try {
        const granted = await requestNotificationPermissions();
        if (granted) {
          setEnableSundayDigest(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          toast.success('Sunday Digest enabled', {
            description: 'Weekly 7 PM overview to plan your safe skips.',
          });
        } else {
          setEnableSundayDigest(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          toast.info('Notification permission not granted', {
            description: 'You can enable notifications anytime in device Settings.',
          });
        }
      } catch (err) {
        console.warn('Error requesting notification permissions:', err);
        setEnableSundayDigest(false);
      }
    } else {
      setEnableSundayDigest(false);
    }
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bellFloatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bellFloatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bellFloatAnim]);

  const bellTranslateY = bellFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-3.5, 3.5],
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Smooth programmatic page navigation with double-click guard
  const goToPage = (pageIndex: number) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    setTimeout(() => {
      isNavigating.current = false;
    }, 280);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPage(pageIndex);
    scrollViewRef.current?.scrollTo({
      x: pageIndex * width,
      animated: true,
    });
  };

  // Sync state on horizontal swipe gesture
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex <= 3) {
      setCurrentPage(pageIndex);
      Haptics.selectionAsync();
    }
  };

  // Switch Screen 3 preview course with card swap spring
  const selectCourse = (idx: number) => {
    if (idx === selectedCourseIdx) return;
    Haptics.selectionAsync();
    setSelectedCourseIdx(idx);

    // Dynamic card entrance animation (scale, rotation, and slide from stack)
    ticketAnim.setValue(0);
    Animated.spring(ticketAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  // Adjust Target percentage with micro-spring scale
  const adjustTarget = (delta: number) => {
    Haptics.selectionAsync();
    triggerNumberScale();
    setTargetPct((prev) => {
      const next = Math.round(prev + delta);
      return Math.min(95, Math.max(50, next));
    });
  };

  // Complete onboarding
  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      if (enableReminders || enableSundayDigest) {
        try {
          await requestNotificationPermissions();
        } catch (permErr) {
          console.warn('Notification permission request error:', permErr);
        }
      }

      await completeOnboarding({
        targetPct,
        loadSampleData: false,
        enableReminders,
        sundayDigestEnabled: enableSundayDigest,
      });

      toast.success('Welcome to Bound!', {
        description: 'Clean timetable ready. Add your first subject to start tracking!',
      });

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error completing onboarding:', e);
      setIsSubmitting(false);
    }
  };

  // Skip onboarding tour with clean slate
  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await completeOnboarding({
        targetPct: 75,
        loadSampleData: false, // Clean slate
        enableReminders: false,
        sundayDigestEnabled: false,
      });
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Error skipping onboarding:', e);
      setIsSubmitting(false);
    }
  };

  // Dynamic ticket dimensions for Screen 3 (compact for natural card animation)
  const ticketWidth = Math.min(290, width - 48);
  const ticketHeight = 96;
  const notchX = Math.round(ticketWidth * 0.70);
  const activeCourse = PREVIEW_COURSES[selectedCourseIdx];
  const nextCourse = PREVIEW_COURSES[(selectedCourseIdx + 1) % PREVIEW_COURSES.length];

  // Card swap animation interpolations
  const ticketTranslateY = ticketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });
  const ticketScaleVal = ticketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.93, 1],
  });
  const ticketRotate = ticketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '0deg'],
  });
  const ticketOpacity = ticketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const bgTranslateY = ticketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });
  const bgScale = ticketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });
  const bgRotate = ticketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['1.5deg', '3.5deg'],
  });

  // Screen 2 entrance animation interpolations (Emil Kowalski subtle 12px slide + 0.35 opacity)
  const screen2TranslateY = screen2EntranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  const screen2Opacity = screen2EntranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* Top Header Bar */}
      <View className="relative flex-row items-center justify-between px-6 pt-2 pb-2 min-h-[44px]">
        {/* Back Button Slot (Left) */}
        <View className="z-10" style={{ minWidth: 40, alignItems: 'flex-start' }}>
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go to previous step"
            accessibilityHint="Navigates to the previous onboarding screen"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            disabled={currentPage === 0}
            onPress={() => goToPage(currentPage - 1)}
            style={{
              opacity: currentPage > 0 ? 1 : 0,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={20} color={colors.text} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* 4-Dot Interactive Progress Indicator (Centered) */}
        <View
          pointerEvents="box-none"
          style={StyleSheet.absoluteFill}
          className="items-center justify-center"
        >
          <View
            accessible={true}
            accessibilityRole="tablist"
            accessibilityLabel="Onboarding progress"
            className="flex-row items-center gap-2"
          >
            {[0, 1, 2, 3].map((idx) => {
              const isActive = currentPage === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  accessible={true}
                  accessibilityRole="tab"
                  accessibilityLabel={`Step ${idx + 1} of 4${isActive ? ', current step' : ''}`}
                  accessibilityState={{ selected: isActive }}
                  accessibilityHint={`Navigates to step ${idx + 1}`}
                  hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
                  activeOpacity={0.8}
                  onPress={() => goToPage(idx)}
                  style={{
                    width: isActive ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isActive
                      ? colors.statusSafe
                      : isDark
                      ? 'rgba(255, 255, 255, 0.20)'
                      : 'rgba(0, 0, 0, 0.15)',
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* Skip Tour Button Slot (Right) */}
        <View className="z-10" style={{ minWidth: 40, alignItems: 'flex-end' }}>
          {currentPage < 3 ? (
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding tour"
              accessibilityHint="Skips tour and sets up an empty timetable"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
              onPress={handleSkip}
              style={{
                flexShrink: 0,
                paddingHorizontal: 12,
                paddingVertical: 6,
                minHeight: 32,
                borderRadius: 999,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.sfText,
                  styles.bold,
                  {
                    color: isDark ? '#F5F5F7' : '#111114',
                    opacity: isDark ? 0.85 : 0.80,
                    includeFontPadding: false,
                  },
                ]}
                className="text-xs font-bold"
              >
                Skip Tour
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36, height: 36 }} />
          )}
        </View>
      </View>

      {/* Main Gesture-Enabled Horizontal Pager */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* ========================================================= */}
        {/* SCREEN 1: Visual Hero & Value Proposition (Glide)         */}
        {/* ========================================================= */}
        <View style={{ width, flex: 1 }} className="px-6 justify-between py-2">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 12 }}
          >
            {/* Editorial Header */}
            <View className="mb-4">
              <Text
                style={[styles.sfText, styles.editorialTitle, { color: colors.text }]}
                className="mb-2"
              >
                Track attendance{'\n'}without the stress.
              </Text>
              <Text
                style={[styles.sfText, styles.editorialSubtitle, { color: colors.textSecondary }]}
              >
                Stay comfortably above your college attendance requirement with live safe-absence forecasts.
              </Text>
            </View>

            {/* Aerodynamic Paper Plane & Safety Threshold Hero */}
            <View
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel="Illustration: Attendance target with live safe absence buffer forecasting"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <GlideHero width={width} />
            </View>
          </ScrollView>
        </View>

        {/* ========================================================= */}
        {/* SCREEN 2: Attendance Cutoff Target Configuration          */}
        {/* ========================================================= */}
        <View style={{ width, flex: 1 }} className="px-6 justify-between py-2">
          <Animated.View
            style={{
              flex: 1,
              opacity: screen2Opacity,
              transform: [{ translateY: screen2TranslateY }],
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              {/* Editorial Header */}
              <View className="mb-4">
                <Text
                  style={[styles.sfText, styles.editorialTitle, { color: colors.text }]}
                  className="mb-2"
                >
                  Minimum{'\n'}attendance.
                </Text>
                <Text
                  style={[styles.sfText, styles.editorialSubtitle, { color: colors.textSecondary }]}
                >
                  Set the percentage your college requires.
                </Text>
              </View>

              <View style={{ flex: 1, justifyContent: 'space-around' }}>

              {/* Stepper Counter Row: [-]  70%  [+] with Emil scale-on-press & NumberFlow */}
              <View className="items-center my-6">
                <View className="flex-row items-center justify-between w-full px-2">
                  {/* Minus Stepper Button with physical press damping */}
                  <PressableScale
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease minimum attendance"
                    accessibilityHint="Decreases requirement by 1 percent"
                    accessibilityState={{ disabled: targetPct <= 50 }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeScale={0.88}
                    onPress={() => adjustTarget(-1)}
                    disabled={targetPct <= 50}
                    style={[
                      styles.circularButton,
                      {
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: targetPct <= 50 ? 0.35 : 1,
                      },
                    ]}
                  >
                    <MinusIcon size={18} color={colors.text} strokeWidth={2.6} />
                  </PressableScale>

                  {/* Center Big Percentage with NumberFlow rolling digits & micro-pulse */}
                  <Animated.View
                    accessible={true}
                    accessibilityRole="text"
                    accessibilityLabel={`Minimum attendance requirement: ${targetPct} percent, ${requirementLabel}`}
                    accessibilityLiveRegion="polite"
                    style={{
                      transform: [{ scale: numberScaleAnim }],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <NumberFlow
                      value={targetPct}
                      suffix="%"
                      style={{
                        fontFamily: fontFamilyNames.extraBold,
                        fontSize: 78,
                        fontWeight: '900',
                        letterSpacing: -2,
                        color: colors.text,
                      }}
                    />
                  </Animated.View>

                  {/* Plus Stepper Button with physical press damping */}
                  <PressableScale
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Increase minimum attendance"
                    accessibilityHint="Increases requirement by 1 percent"
                    accessibilityState={{ disabled: targetPct >= 95 }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeScale={0.88}
                    onPress={() => adjustTarget(1)}
                    disabled={targetPct >= 95}
                    style={[
                      styles.circularButton,
                      {
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: targetPct >= 95 ? 0.35 : 1,
                      },
                    ]}
                  >
                    <PlusIcon size={18} color={colors.text} strokeWidth={2.6} />
                  </PressableScale>
                </View>

                {/* Requirement Contextual Descriptor with smooth crossfade & slide */}
                <Animated.Text
                  accessible={true}
                  accessibilityRole="text"
                  style={[
                    styles.sfText,
                    styles.semiBold,
                    {
                      color: colors.textSecondary,
                      fontSize: 15,
                      fontWeight: '600',
                      fontFamily: fontFamilyNames.semiBold,
                      textAlign: 'center',
                      marginTop: 14,
                      opacity: labelAnim,
                      transform: [
                        {
                          translateY: labelAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [4, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {displayedLabel}
                </Animated.Text>
              </View>

              {/* Preset Attendance Chips Row with Emil physical press scale */}
              <View>
                <View
                  accessible={true}
                  accessibilityRole="radiogroup"
                  accessibilityLabel="Preset attendance requirement policies"
                  className="flex-row items-center justify-between gap-2.5"
                >
                  {PRESET_TIERS.map((tier) => {
                    const isSelected = targetPct === tier.pct;
                    return (
                      <PressableScale
                        key={tier.pct}
                        accessible={true}
                        accessibilityRole="radio"
                        accessibilityLabel={`${tier.pct} percent, ${tier.label} policy`}
                        accessibilityState={{ selected: isSelected }}
                        accessibilityHint={`Sets minimum attendance to ${tier.pct} percent`}
                        activeScale={0.94}
                        containerStyle={{ flex: 1 }}
                        onPress={() => {
                          Haptics.selectionAsync();
                          triggerNumberScale();
                          setTargetPct(tier.pct);
                        }}
                        style={[
                          styles.presetCardShadow,
                          {
                            paddingVertical: 14,
                            paddingHorizontal: 4,
                            borderRadius: 22,
                            borderCurve: 'continuous',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected
                              ? isDark
                                ? '#FFFFFF'
                                : '#111114'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : '#FFFFFF',
                            borderWidth: isSelected ? 0 : 1,
                            borderColor: isDark
                              ? 'rgba(255, 255, 255, 0.12)'
                              : 'rgba(0, 0, 0, 0.08)',
                          },
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.sfText,
                            styles.extraBold,
                            styles.tabular,
                            {
                              fontSize: 16,
                              fontWeight: '800',
                              fontFamily: fontFamilyNames.extraBold,
                              color: isSelected
                                ? isDark
                                  ? '#111114'
                                  : '#FFFFFF'
                                : colors.text,
                              includeFontPadding: false,
                            },
                          ]}
                        >
                          {tier.pct}%
                        </Text>
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                          style={[
                            styles.sfText,
                            styles.semiBold,
                            {
                              fontSize: 11,
                              fontWeight: isSelected ? '700' : '600',
                              fontFamily: fontFamilyNames.semiBold,
                              color: isSelected
                                ? isDark
                                  ? 'rgba(17, 17, 20, 0.65)'
                                  : 'rgba(255, 255, 255, 0.70)'
                                : colors.textSecondary,
                              marginTop: 3,
                              includeFontPadding: false,
                            },
                          ]}
                        >
                          {tier.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>

        {/* ========================================================= */}
        {/* SCREEN 3: The "Skip Bank" Interactive Ticket Preview      */}
        {/* ========================================================= */}
        <View style={{ width, flex: 1 }} className="px-6 justify-between py-2">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 12 }}
          >
            {/* Editorial Header */}
            <View className="mb-4">
              <Text
                style={[styles.sfText, styles.editorialTitle, { color: colors.text }]}
                className="mb-2"
              >
                Know your safe{'\n'}absence buffer.
              </Text>
              <Text
                style={[styles.sfText, styles.editorialSubtitle, { color: colors.textSecondary }]}
              >
                Every course shows how many lectures you can miss before you drop below your cutoff.
              </Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
            {/* Example Preview Label */}
            <View
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="Example preview"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'rgba(0, 0, 0, 0.08)',
                borderWidth: 1,
                borderRadius: 999,
              }}
              className="self-center px-3 py-1 mb-3"
            >
              <Text
                style={[
                  styles.sfText,
                  styles.extraBold,
                  {
                    color: colors.textSecondary,
                    fontFamily: fontFamilyNames.extraBold,
                    letterSpacing: 1.1,
                  },
                ]}
                className="text-[11px] font-extrabold uppercase"
              >
                Example Preview
              </Text>
            </View>

            {/* Stacked Interactive Ticket Showcase */}
            <View className="items-center my-2">
              {/* Background Angled Card (preview next course in deck) */}
              <Animated.View
                accessible={false}
                importantForAccessibility="no"
                style={{
                  position: 'absolute',
                  top: -6,
                  width: ticketWidth - 8,
                  height: ticketHeight,
                  transform: [
                    { translateY: bgTranslateY },
                    { scale: bgScale },
                    { rotate: bgRotate },
                  ],
                  opacity: isDark ? 0.45 : 0.35,
                  borderRadius: 14,
                  backgroundColor: nextCourse.color,
                }}
                className="p-3 justify-between"
              >
                <Text
                  style={[
                    styles.sfText,
                    styles.bold,
                    {
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontFamily: fontFamilyNames.bold,
                    },
                  ]}
                  className="text-[11px] font-extrabold tracking-widest text-right"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {nextCourse.code} · {nextCourse.name.toUpperCase()}
                </Text>
              </Animated.View>

              {/* Main Active Ticket with Perforated Notches */}
              <Animated.View
                accessible={true}
                accessibilityRole="summary"
                accessibilityLabel={`${activeCourse.name}, code ${activeCourse.code}, schedule ${activeCourse.days}, buffer ${activeCourse.classes.replace('+', '')}, attendance ${activeCourse.pct}, status ${activeCourse.statusText}`}
                style={{
                  transform: [
                    { translateY: ticketTranslateY },
                    { scale: ticketScaleVal },
                    { rotate: ticketRotate },
                  ],
                  opacity: ticketOpacity,
                  width: ticketWidth,
                  height: ticketHeight,
                  shadowColor: activeCourse.color,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.35 : 0.22,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <TicketShape
                  width={ticketWidth}
                  height={ticketHeight}
                  color={activeCourse.color}
                  notchX={notchX}
                  notchRadius={7.5}
                  cornerRadius={14}
                />

                {/* Ticket Content Overlay */}
                <View
                  style={StyleSheet.absoluteFill}
                  className="flex-row items-center px-2"
                >
                  {/* Left Body: Subject info and buffer count */}
                  <View style={{ width: notchX - 16 }} className="justify-center py-1.5">
                    <Text
                      style={[
                        styles.sfText,
                        styles.bold,
                        {
                          color: 'rgba(255, 255, 255, 0.85)',
                          letterSpacing: 0.4,
                          fontFamily: fontFamilyNames.bold,
                        },
                      ]}
                      className="text-[11px] font-extrabold uppercase mb-0.5"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {activeCourse.code} · {activeCourse.days}
                    </Text>

                    <Text
                      style={[
                        styles.sfText,
                        styles.extraBold,
                        styles.tabular,
                        { color: '#FFFFFF', fontFamily: fontFamilyNames.extraBold },
                      ]}
                      className="text-[22px] font-black leading-6"
                    >
                      {activeCourse.classes}
                    </Text>

                    <Text
                      style={[
                        styles.sfText,
                        styles.semiBold,
                        {
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontFamily: fontFamilyNames.semiBold,
                        },
                      ]}
                      className="text-[11px] font-semibold mt-0.5"
                    >
                      Safe above {targetPct}%
                    </Text>
                  </View>

                  {/* Right Stub: Percentage & Status badge */}
                  <View
                    style={{ width: ticketWidth - notchX - 8 }}
                    className="items-center justify-center pl-2"
                  >
                    <Text
                      style={[
                        styles.sfText,
                        styles.extraBold,
                        styles.tabular,
                        { color: '#FFFFFF', fontFamily: fontFamilyNames.extraBold },
                      ]}
                      className="text-xl font-black mb-0.5"
                    >
                      {activeCourse.pct}
                    </Text>

                    <View
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        borderRadius: 999,
                      }}
                      className="px-2 py-0.5"
                    >
                      <Text
                        style={[
                          styles.sfText,
                          styles.bold,
                          { color: '#FFFFFF', fontFamily: fontFamilyNames.bold },
                        ]}
                        className="text-[11px] font-extrabold tracking-wider"
                      >
                        {activeCourse.statusText}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Free-Floating Status Pill (detached with clean margin) */}
              <View
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={`Buffer ready: ${activeCourse.classes.replace('+', '').replace('Classes', 'Skips').trim()}`}
                style={{
                  backgroundColor: isDark ? '#062612' : '#0B4722',
                  borderColor: isDark ? 'rgba(61, 220, 132, 0.4)' : 'rgba(61, 220, 132, 0.5)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                className="self-center mt-4 mb-1 px-3.5 py-1.5 rounded-full border flex-row items-center gap-1.5"
              >
                <CheckIcon size={12} color="#3DDC84" strokeWidth={3} />
                <Text
                  style={[
                    styles.sfText,
                    styles.bold,
                    { color: '#3DDC84', fontFamily: fontFamilyNames.bold },
                  ]}
                  className="text-[11px] font-bold"
                >
                  Buffer Ready ({activeCourse.classes.replace('+', '').replace('Classes', 'Skips').trim()})
                </Text>
              </View>
            </View>

            {/* Interactive Subject Chips Selector */}
            <View
              accessible={true}
              accessibilityRole="tablist"
              accessibilityLabel="Preview course selector"
              className="flex-row items-center justify-center gap-2.5 mt-3 mb-3"
            >
              {PREVIEW_COURSES.map((course, idx) => {
                const isSelected = selectedCourseIdx === idx;
                return (
                  <TouchableOpacity
                    key={course.id}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityLabel={`Preview ${course.name}, code ${course.code}`}
                    accessibilityState={{ selected: isSelected }}
                    accessibilityHint={`Shows attendance buffer simulation for ${course.name}`}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    activeOpacity={0.75}
                    onPress={() => selectCourse(idx)}
                    style={{
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(255, 255, 255, 0.16)'
                          : 'rgba(0, 0, 0, 0.10)'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)',
                      borderColor: isSelected ? course.color : 'transparent',
                      borderWidth: 1.5,
                      borderRadius: 999,
                    }}
                    className="flex-row items-center gap-1.5 px-3 py-1.5"
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 3.5,
                        backgroundColor: course.color,
                      }}
                    />
                    <Text
                      style={[
                        styles.sfText,
                        styles.bold,
                        styles.tabular,
                        {
                          color: isSelected ? colors.text : colors.textSecondary,
                          fontWeight: isSelected ? '800' : '600',
                          fontFamily: isSelected
                            ? fontFamilyNames.extraBold
                            : fontFamilyNames.semiBold,
                        },
                      ]}
                      className="text-xs"
                    >
                      {course.code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Student Explanation Note */}
            <View className="mt-2 px-3">
              <Text
                style={[
                  styles.sfText,
                  styles.medium,
                  { color: colors.textSecondary, fontFamily: fontFamilyNames.medium },
                ]}
                className="text-xs text-center leading-4"
              >
                Example preview — tap a sample course above to see how Bound calculates your safe skips.
              </Text>
            </View>
            </View>
          </ScrollView>
        </View>

        {/* ========================================================= */}
        {/* SCREEN 4: The Bell Permission Primer & Smart Alerts       */}
        {/* ========================================================= */}
        <View style={{ width, flex: 1 }} className="px-6 justify-between py-2">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 12 }}
          >
            {/* Editorial Header */}
            <View className="mb-4">
              <Text
                style={[styles.sfText, styles.editorialTitle, { color: colors.text }]}
                className="mb-2"
              >
                Never drop by surprise.{'\n'}Get smart alerts.
              </Text>
              <Text
                style={[styles.sfText, styles.editorialSubtitle, { color: colors.textSecondary }]}
              >
                Timely heads-up reminders right before class with your live skip bank.
              </Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
            {/* Hero Section: Simulated Native Heads-Up Alert (Dynamic Island style) */}
            <View className="items-center my-2">
              {/* Background Subtle Glowing Rings */}
              <View
                style={{
                  position: 'absolute',
                  top: -16,
                  alignSelf: 'center',
                  width: Math.min(300, width - 64),
                  height: 140,
                  opacity: isDark ? 0.30 : 0.18,
                }}
                pointerEvents="none"
              >
                <Svg width="100%" height="100%" viewBox="0 0 300 140">
                  <Circle
                    cx="150"
                    cy="70"
                    r="65"
                    stroke={previewAlertMode === 'safe' ? colors.statusSafe : colors.statusWarning}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  <Circle
                    cx="150"
                    cy="70"
                    r="48"
                    stroke={previewAlertMode === 'safe' ? colors.statusSafe : colors.statusWarning}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    fill="none"
                  />
                </Svg>
              </View>

              {/* Floating Notification Card */}
              <Animated.View
                accessible={true}
                accessibilityRole="summary"
                accessibilityLabel={`Smart alert preview for ${previewAlertMode === 'safe' ? 'Physics, PHY 101' : 'Calculus, MAT 102'}. ${previewAlertMode === 'safe' ? 'You have 4 skips banked. Safe to take a break today.' : `Current attendance is 74 percent, cutoff is ${targetPct} percent. Attendance required today.`}`}
                style={[
                  styles.cardShadow,
                  {
                    width: Math.min(320, width - 48),
                    backgroundColor: isDark ? '#1C1D24' : '#FFFFFF',
                    borderColor: previewAlertMode === 'safe'
                      ? isDark ? 'rgba(61, 220, 132, 0.35)' : 'rgba(13, 138, 51, 0.3)'
                      : isDark ? 'rgba(255, 176, 32, 0.35)' : 'rgba(217, 119, 6, 0.3)',
                    borderWidth: 1.5,
                    borderRadius: 22,
                    borderCurve: 'continuous',
                    transform: [{ translateY: bellTranslateY }],
                    padding: 14,
                  },
                ]}
              >
                {/* Header Row */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        backgroundColor: previewAlertMode === 'safe' ? colors.statusSafe : colors.statusWarning,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BellIcon
                        size={14}
                        color={previewAlertMode === 'safe' ? '#06210F' : '#2D1600'}
                        strokeWidth={2.4}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.sfText,
                          styles.extraBold,
                          { color: colors.textSecondary, fontFamily: fontFamilyNames.extraBold },
                        ]}
                        className="text-[11px] font-extrabold tracking-wider uppercase"
                      >
                        Bound · Smart Alert
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.sfText,
                      styles.semiBold,
                      { color: colors.textSecondary, fontFamily: fontFamilyNames.semiBold },
                    ]}
                    className="text-[11px] font-semibold"
                  >
                    15m before class
                  </Text>
                </View>

                {/* Content Body */}
                <View className="my-1">
                  <Text
                    style={[
                      styles.sfText,
                      styles.extraBold,
                      { color: colors.text, fontFamily: fontFamilyNames.extraBold },
                    ]}
                    className="text-base font-extrabold mb-0.5"
                  >
                    {previewAlertMode === 'safe' ? 'Physics · PHY101' : 'Calculus · MAT102'}
                  </Text>
                  <Text
                    style={[
                      styles.sfText,
                      styles.medium,
                      { color: colors.textSecondary, fontFamily: fontFamilyNames.medium },
                    ]}
                    className="text-xs leading-4"
                  >
                    {previewAlertMode === 'safe'
                      ? 'You have 4 skips banked. Safe to take a break today!'
                      : `Current attendance is 74% (cutoff: ${targetPct}%). Attendance required today!`}
                  </Text>
                </View>

                {/* Status Pill Tag */}
                <View className="flex-row items-center justify-between gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                  <View className="flex-row items-center gap-1.5">
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: previewAlertMode === 'safe' ? colors.statusSafe : colors.statusWarning,
                      }}
                    />
                    <Text
                      style={[
                        styles.sfText,
                        styles.bold,
                        styles.tabular,
                        {
                          color: previewAlertMode === 'safe' ? colors.statusSafe : colors.statusWarning,
                          fontFamily: fontFamilyNames.bold,
                        },
                      ]}
                      className="text-[11px] font-bold"
                    >
                      {previewAlertMode === 'safe' ? 'Safe Status (+4 Skips)' : 'Risk: Must Attend'}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.sfText,
                      styles.medium,
                      { color: colors.textSecondary, fontFamily: fontFamilyNames.medium },
                    ]}
                    className="text-[11px] font-medium flex-shrink text-right"
                    numberOfLines={1}
                  >
                    Tap preview below to test
                  </Text>
                </View>
              </Animated.View>

              {/* Interactive Mode Switcher Chips */}
              <View
                accessibilityRole="tablist"
                className="flex-row items-center justify-center gap-2 mt-3 mb-1"
              >
                <TouchableOpacity
                  accessible={true}
                  accessibilityRole="tab"
                  accessibilityLabel="Safe Day preview alert"
                  accessibilityState={{ selected: previewAlertMode === 'safe' }}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPreviewAlertMode('safe');
                  }}
                  style={{
                    backgroundColor: previewAlertMode === 'safe'
                      ? isDark ? 'rgba(61, 220, 132, 0.18)' : 'rgba(13, 138, 51, 0.12)'
                      : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: previewAlertMode === 'safe' ? colors.statusSafe : 'transparent',
                    borderWidth: 1,
                    borderRadius: 999,
                  }}
                  className="px-3 py-1.5"
                >
                  <Text
                    style={[
                      styles.sfText,
                      previewAlertMode === 'safe' ? styles.extraBold : styles.semiBold,
                      {
                        color: previewAlertMode === 'safe' ? colors.statusSafe : colors.textSecondary,
                        fontWeight: previewAlertMode === 'safe' ? '800' : '600',
                        fontFamily: previewAlertMode === 'safe' ? fontFamilyNames.extraBold : fontFamilyNames.semiBold,
                      },
                    ]}
                    className="text-xs"
                  >
                    Safe Day Preview
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessible={true}
                  accessibilityRole="tab"
                  accessibilityLabel="Close Call alert preview"
                  accessibilityState={{ selected: previewAlertMode === 'warning' }}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPreviewAlertMode('warning');
                  }}
                  style={{
                    backgroundColor: previewAlertMode === 'warning'
                      ? isDark ? 'rgba(255, 176, 32, 0.18)' : 'rgba(217, 119, 6, 0.12)'
                      : isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: previewAlertMode === 'warning' ? colors.statusWarning : 'transparent',
                    borderWidth: 1,
                    borderRadius: 999,
                  }}
                  className="px-3 py-1.5"
                >
                  <Text
                    style={[
                      styles.sfText,
                      previewAlertMode === 'warning' ? styles.extraBold : styles.semiBold,
                      {
                        color: previewAlertMode === 'warning' ? colors.statusWarning : colors.textSecondary,
                        fontWeight: previewAlertMode === 'warning' ? '800' : '600',
                        fontFamily: previewAlertMode === 'warning' ? fontFamilyNames.extraBold : fontFamilyNames.semiBold,
                      },
                    ]}
                    className="text-xs"
                  >
                    Close Call Alert
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preferences Setting Card with Switch */}
            <View
              style={[
                styles.cardShadow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                  borderRadius: 20,
                  borderCurve: 'continuous',
                  overflow: 'hidden',
                },
              ]}
              className="my-2"
            >
              {/* Row 1: Pre-Lecture Heads-Up */}
              <TouchableOpacity
                accessible={true}
                accessibilityRole="switch"
                accessibilityLabel="Pre-lecture alerts"
                accessibilityHint="Toggles 5 or 15 minute advance notifications before classes start"
                accessibilityState={{ checked: enableReminders }}
                activeOpacity={0.7}
                onPress={() => handleToggleReminders(!enableReminders)}
                style={{ width: '100%', minHeight: 56 }}
                className="flex-row items-center justify-between px-4 py-3.5"
              >
                <View className="flex-row items-center gap-3 flex-1 pr-3">
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: enableReminders
                        ? isDark ? 'rgba(61, 220, 132, 0.15)' : 'rgba(13, 138, 51, 0.12)'
                        : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BellIcon
                      size={17}
                      color={enableReminders ? colors.statusSafe : colors.textSecondary}
                      strokeWidth={2.4}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={[
                        styles.sfText,
                        styles.bold,
                        { color: colors.text, fontFamily: fontFamilyNames.bold },
                      ]}
                      className="text-sm font-bold mb-0.5"
                    >
                      Pre-Lecture Alerts
                    </Text>
                    <Text
                      style={[
                        styles.sfText,
                        styles.medium,
                        { color: colors.textSecondary, fontFamily: fontFamilyNames.medium },
                      ]}
                      className="text-xs leading-4"
                    >
                      Reminders 5 or 15 minutes before class starts.
                    </Text>
                  </View>
                </View>

                <Switch
                  accessible={false}
                  importantForAccessibility="no"
                  value={enableReminders}
                  onValueChange={handleToggleReminders}
                  trackColor={{
                    false: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                    true: colors.statusSafe,
                  }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Divider */}
              <View className="h-px bg-black/5 dark:bg-white/10 mx-4" />

              {/* Row 2: Sunday Weekly Summary */}
              <TouchableOpacity
                accessible={true}
                accessibilityRole="switch"
                accessibilityLabel="Sunday weekly summary"
                accessibilityHint="Toggles a 7 PM weekly overview of upcoming schedule"
                accessibilityState={{ checked: enableSundayDigest }}
                activeOpacity={0.7}
                onPress={() => handleToggleSundayDigest(!enableSundayDigest)}
                style={{ width: '100%', minHeight: 56 }}
                className="flex-row items-center justify-between px-4 py-3.5"
              >
                <View className="flex-row items-center gap-3 flex-1 pr-3">
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: enableSundayDigest
                        ? isDark ? 'rgba(30, 155, 255, 0.15)' : 'rgba(30, 155, 255, 0.12)'
                        : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CalendarSparklesIcon
                      size={17}
                      color={enableSundayDigest ? '#1E9BFF' : colors.textSecondary}
                      strokeWidth={2.2}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={[
                        styles.sfText,
                        styles.bold,
                        { color: colors.text, fontFamily: fontFamilyNames.bold },
                      ]}
                      className="text-sm font-bold mb-0.5"
                    >
                      Sunday Weekly Summary
                    </Text>
                    <Text
                      style={[
                        styles.sfText,
                        styles.medium,
                        { color: colors.textSecondary, fontFamily: fontFamilyNames.medium },
                      ]}
                      className="text-xs leading-4"
                    >
                      Calm 7 PM weekly overview of upcoming schedule.
                    </Text>
                  </View>
                </View>

                <Switch
                  accessible={false}
                  importantForAccessibility="no"
                  value={enableSundayDigest}
                  onValueChange={handleToggleSundayDigest}
                  trackColor={{
                    false: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                    true: colors.statusSafe,
                  }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          backgroundColor: colors.canvas,
        }}
        className="px-6 pt-3"
      >
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            currentPage < 3
              ? 'Continue to next step'
              : isSubmitting
              ? 'Setting up Bound'
              : 'Get started with Bound'
          }
          accessibilityHint={
            currentPage < 3
              ? 'Navigates to the next onboarding slide'
              : 'Completes onboarding and opens Bound'
          }
          accessibilityState={{ disabled: isSubmitting }}
          activeOpacity={0.85}
          onPress={() => {
            if (currentPage < 3) {
              goToPage(currentPage + 1);
            } else {
              handleFinish();
            }
          }}
          disabled={isSubmitting}
          style={[
            styles.ctaShadow,
            {
              backgroundColor: colors.primaryButton,
              borderRadius: 999,
            },
          ]}
          className="py-3.5 items-center justify-center flex-row gap-2"
        >
          <Text
            style={[
              styles.sfText,
              styles.extraBold,
              { color: colors.primaryButtonText, fontFamily: fontFamilyNames.extraBold },
            ]}
            className="text-base font-extrabold tracking-wide"
          >
            {currentPage < 3
              ? 'Continue'
              : isSubmitting
              ? 'Setting up Bound...'
              : 'Get Started'}
          </Text>
          {currentPage < 3 && (
            <ChevronRightIcon size={18} color={colors.primaryButtonText} strokeWidth={2.6} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaShadow: {
    shadowColor: '#00BF63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  circularButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  presetCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1.5,
  },
  sfText: {
    fontFamily: fontFamilyNames.regular,
  },
  editorialTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.7,
    fontFamily: fontFamilyNames.extraBold,
    textAlign: 'left',
  },
  editorialSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: fontFamilyNames.medium,
    textAlign: 'left',
  },
  medium: {
    fontFamily: fontFamilyNames.medium,
  },
  semiBold: {
    fontFamily: fontFamilyNames.semiBold,
  },
  bold: {
    fontFamily: fontFamilyNames.bold,
  },
  extraBold: {
    fontFamily: fontFamilyNames.extraBold,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
