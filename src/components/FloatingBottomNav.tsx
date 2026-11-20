import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Haptics } from '../utils/haptics';
import { HomeIcon, SubjectsIcon, StatsIcon } from './icons';
import { useTheme } from '../utils/theme';
import { fontFamilyNames } from '../utils/typography';

interface NavTabItemProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  renderIcon: (color: string) => React.ReactNode;
  activeBg: string;
  activeTextColor: string;
  inactiveTextColor: string;
  iconColor: string;
}

const NavTabItem: React.FC<NavTabItemProps> = ({
  label,
  isActive,
  onPress,
  renderIcon,
  activeBg,
  activeTextColor,
  inactiveTextColor,
  iconColor,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.94,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 14,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.tabCell}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.88}
          accessibilityRole="tab"
          accessibilityLabel={`${label} tab`}
          accessibilityState={{ selected: isActive }}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={onPress}
          style={[
            styles.tabItem,
            {
              backgroundColor: isActive ? activeBg : 'transparent',
            },
          ]}
        >
          {renderIcon(iconColor)}
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={[
              styles.tabLabel,
              {
                color: isActive ? activeTextColor : inactiveTextColor,
              },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const FloatingBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const isHome =
    pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
  const isSubjects = pathname.includes('/subjects');
  const isStats = pathname.includes('/stats');

  const bottomOffset = Math.max(insets.bottom, 16);

  const handleNavigate = (path: any) => {
    Haptics.selectionAsync();
    router.replace(path);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outerWrapper,
        {
          bottom: bottomOffset,
        },
      ]}
    >
      {/* Floating Shadow Wrapper: clean, soft, diffused elevation without clipping artifacts */}
      <View
        style={[
          styles.shadowWrapper,
          {
            shadowColor: colors.cardShadow,
            shadowOpacity: isDark ? 0.35 : 0.08,
          },
        ]}
      >
        {/* Navigation Container: Smooth capsule surface with backdrop blur */}
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.navBg,
            },
          ]}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 70 : 85}
            tint={colors.blurTint}
            style={StyleSheet.absoluteFill}
          />

          {/* Tab Items Row: Balanced partitions with equal cell widths */}
          <View style={styles.navRow}>
            {/* Home Tab */}
            <NavTabItem
              label="Home"
              isActive={isHome}
              onPress={() => handleNavigate('/(tabs)')}
              activeBg={colors.navActiveBg}
              activeTextColor={colors.navActiveText}
              inactiveTextColor={colors.navInactiveText}
              iconColor={isHome ? colors.navActiveIcon : colors.navInactiveIcon}
              renderIcon={(color) => (
                <HomeIcon size={20} color={color} strokeWidth={2} />
              )}
            />

            {/* Subjects Tab */}
            <NavTabItem
              label="Subjects"
              isActive={isSubjects}
              onPress={() => handleNavigate('/(tabs)/subjects')}
              activeBg={colors.navActiveBg}
              activeTextColor={colors.navActiveText}
              inactiveTextColor={colors.navInactiveText}
              iconColor={isSubjects ? colors.navActiveIcon : colors.navInactiveIcon}
              renderIcon={(color) => (
                <SubjectsIcon size={20} color={color} strokeWidth={2} />
              )}
            />

            {/* Stats Tab */}
            <NavTabItem
              label="Stats"
              isActive={isStats}
              onPress={() => handleNavigate('/(tabs)/stats')}
              activeBg={colors.navActiveBg}
              activeTextColor={colors.navActiveText}
              inactiveTextColor={colors.navInactiveText}
              iconColor={isStats ? colors.navActiveIcon : colors.navInactiveIcon}
              renderIcon={(color) => (
                <StatsIcon size={20} color={color} strokeWidth={2} />
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  shadowWrapper: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 999,
    borderCurve: 'continuous',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  container: {
    width: '100%',
    height: 64,
    borderRadius: 999,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 0,
  },
  navRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  tabCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    height: 50,
    width: 76,
    borderRadius: 25,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  tabLabel: {
    fontFamily: fontFamilyNames.bold,
    fontSize: 11,
    marginTop: 3,
    letterSpacing: -0.1,
    includeFontPadding: false,
    textAlign: 'center',
  },
});

export default FloatingBottomNav;
