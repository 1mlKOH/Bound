import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface TopHeaderProps {
  title: string;
  showSettings?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  showSettings = true,
}) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
      <Text className="text-3xl font-black text-white tracking-tight">
        {title}
      </Text>

      {showSettings && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/settings')}
          className="w-10 h-10 rounded-full bg-[#1B1C22] border border-[#282932] items-center justify-center"
        >
          {/* Settings Gear Glyph */}
          <Text className="text-zinc-300 text-lg">⚙</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
