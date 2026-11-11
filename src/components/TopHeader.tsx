import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Haptics } from '../utils/haptics';
import { SettingsIcon, SunIcon } from './icons';
import { useTheme } from '../utils/theme';

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
  const { colors } = useTheme();

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
            letterSpacing: -0.5,
            color: colors.text,
            fontSize: Platform.OS === 'ios' ? 34 : 28,
            fontWeight: Platform.OS === 'ios' ? '700' : '800',
          },
        ]}
        className="font-bold leading-tight"
      >
        {title}
      </Text>

      {showSettings && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.glassBg,
              shadowColor: colors.cardShadow,
            },
          ]}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          {rightAction === 'sun' ? (
            <SunIcon size={18} color={colors.textSecondary} />
          ) : (
            <SettingsIcon size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  largeTitle: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Figtree_800ExtraBold',
      default: undefined,
    }),
  },
  actionButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});
