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

interface NavTabItemProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  renderIcon: (color: string) => React.ReactNode;
  activeBg: string;
  activeBorder: string;
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
  activeBorder,
  activeTextColor,
  inactiveTextColor,
  iconColor,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.94,
      duration: 100,
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
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[
          styles.tabItem,
          {
            backgroundColor: isActive ? activeBg : 'transparent',
          },
        ]}
        className="items-center justify-center px-6 py-2 rounded-full"
      >
        {renderIcon(iconColor)}
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? activeTextColor : inactiveTextColor,
              letterSpacing: 0.2,
            },
          ]}
          className="text-[11px] font-semibold mt-1"
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const FloatingBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

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
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 20,
        right: 20,
      }}
    >
      <View
        style={[
          styles.container,
          {
            borderRadius: 36,
            borderCurve: 'continuous',
            overflow: 'hidden',
            shadowColor: colors.cardShadow,
          },
        ]}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 85}
          tint={colors.blurTint}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.liquidLayer,
            {
              borderRadius: 999,
              borderCurve: 'continuous',
              backgroundColor: colors.navBg,
              borderWidth: 1,
              borderColor: colors.navBorder,
            },
          ]}
          className="h-[64px] px-2.5 flex-row items-center justify-around"
        >
          {/* Home Tab */}
          <NavTabItem
            label="Home"
            isActive={isHome}
            onPress={() => handleNavigate('/(tabs)')}
            activeBg={colors.navActiveBg}
            activeBorder={colors.navActiveBorder}
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
            activeBorder={colors.navActiveBorder}
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
            activeBorder={colors.navActiveBorder}
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
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    borderCurve: 'continuous',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 16,
  },
  liquidLayer: {},
  tabItem: {
    borderRadius: 999,
    borderCurve: 'continuous',
    height: 52,
    minWidth: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Figtree_700Bold',
      default: undefined,
    }),
  },
});
