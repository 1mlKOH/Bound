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
import * as Haptics from 'expo-haptics';
import { HomeIcon, SubjectsIcon, StatsIcon } from './icons';

interface NavTabItemProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  renderIcon: (color: string) => React.ReactNode;
}

const NavTabItem: React.FC<NavTabItemProps> = ({
  label,
  isActive,
  onPress,
  renderIcon,
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
        style={[styles.tabItem, isActive && styles.activeTab]}
        className={`items-center justify-center px-6 py-2 rounded-full ${
          isActive ? 'bg-white/[0.14]' : 'bg-transparent'
        }`}
      >
        {renderIcon(isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)')}
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.50)',
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

  const isHome =
    pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
  const isSubjects = pathname.includes('/subjects');
  const isStats = pathname.includes('/stats');

  const handleNavigate = (path: any) => {
    Haptics.selectionAsync();
    router.replace(path);
  };

  return (
    <View className="absolute bottom-6 left-5 right-5">
      <View
        style={[
          styles.container,
          {
            borderRadius: 36,
            borderCurve: 'continuous',
            overflow: 'hidden',
          },
        ]}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 85}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.liquidLayer,
            {
              borderRadius: 36,
              borderCurve: 'continuous',
            },
          ]}
          className="h-[72px] px-3 flex-row items-center justify-around"
        >
          {/* Home Tab */}
          <NavTabItem
            label="Home"
            isActive={isHome}
            onPress={() => handleNavigate('/(tabs)')}
            renderIcon={(color) => (
              <HomeIcon size={21} color={color} strokeWidth={2} />
            )}
          />

          {/* Subjects Tab */}
          <NavTabItem
            label="Subjects"
            isActive={isSubjects}
            onPress={() => handleNavigate('/(tabs)/subjects')}
            renderIcon={(color) => (
              <SubjectsIcon size={21} color={color} strokeWidth={2} />
            )}
          />

          {/* Stats Tab */}
          <NavTabItem
            label="Stats"
            isActive={isStats}
            onPress={() => handleNavigate('/(tabs)/stats')}
            renderIcon={(color) => (
              <StatsIcon size={21} color={color} strokeWidth={2.2} />
            )}
          />
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  liquidLayer: {
    backgroundColor: 'rgba(21, 22, 28, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderTopColor: 'rgba(255, 255, 255, 0.22)', // Apple specular light catcher
  },
  tabItem: {
    borderRadius: 24,
    borderCurve: 'continuous',
  },
  activeTab: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  tabLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});

