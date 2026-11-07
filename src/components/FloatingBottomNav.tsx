import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export const FloatingBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
  const isSubjects = pathname.includes('/subjects');
  const isStats = pathname.includes('/stats');

  return (
    <View className="absolute bottom-5 left-5 right-5">
      <View className="h-16 rounded-full bg-[#15161C]/95 border border-[#2C2D37] px-2 flex-row items-center justify-around shadow-2xl">
        {/* Home Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)')}
          className={`flex-row items-center justify-center px-4 py-2.5 rounded-full ${
            isHome ? 'bg-[#252733]' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-base mr-1.5 ${
              isHome ? 'text-[#3DDC84]' : 'text-zinc-400'
            }`}
          >
            ⌂
          </Text>
          <Text
            className={`text-xs font-bold ${
              isHome ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Subjects Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)/subjects')}
          className={`flex-row items-center justify-center px-4 py-2.5 rounded-full ${
            isSubjects ? 'bg-[#252733]' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-base mr-1.5 ${
              isSubjects ? 'text-[#3DDC84]' : 'text-zinc-400'
            }`}
          >
            📖
          </Text>
          <Text
            className={`text-xs font-bold ${
              isSubjects ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Subjects
          </Text>
        </TouchableOpacity>

        {/* Stats Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)/stats')}
          className={`flex-row items-center justify-center px-4 py-2.5 rounded-full ${
            isStats ? 'bg-[#252733]' : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-base mr-1.5 ${
              isStats ? 'text-[#3DDC84]' : 'text-zinc-400'
            }`}
          >
            📊
          </Text>
          <Text
            className={`text-xs font-bold ${
              isStats ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Stats
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
