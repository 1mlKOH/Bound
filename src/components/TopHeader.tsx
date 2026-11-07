import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
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
    if (onRightActionPress) {
      onRightActionPress();
    } else {
      router.push('/settings');
    }
  };

  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
      <Text className="text-3xl font-black text-white tracking-tight">
        {title}
      </Text>

      {showSettings && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
          className="w-10 h-10 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center"
        >
          {rightAction === 'sun' ? (
            <SunIcon size={19} color="#D4D4D8" />
          ) : (
            <SettingsIcon size={19} color="#D4D4D8" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

