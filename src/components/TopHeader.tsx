import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SettingsIcon, SunIcon } from './icons';

interface TopHeaderProps {
  title: string;
  showSettings?: boolean;
  rightAction?: 'settings' | 'sun';
  onRightActionPress?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  showSettings = true,
  rightAction = 'settings',
  onRightActionPress,
}) => {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onRightActionPress) {
      onRightActionPress();
    } else {
      router.push('/settings');
    }
  };

  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
      <Text
        style={[
          styles.largeTitle,
          {
            letterSpacing: -0.8,
          },
        ]}
        className="text-[32px] font-bold text-white leading-tight"
      >
        {title}
      </Text>

      {showSettings && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
          style={styles.actionButton}
          className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.14] items-center justify-center"
        >
          {rightAction === 'sun' ? (
            <SunIcon size={18} color="rgba(255, 255, 255, 0.85)" />
          ) : (
            <SettingsIcon size={18} color="rgba(255, 255, 255, 0.85)" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  largeTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  actionButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
});

