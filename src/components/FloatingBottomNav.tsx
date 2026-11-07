import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { HomeIcon, SubjectsIcon, StatsIcon } from './icons';

export const FloatingBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
  const isSubjects = pathname.includes('/subjects');
  const isStats = pathname.includes('/stats');

  return (
    <View className="absolute bottom-5 left-5 right-5">
      <View className="h-[72px] rounded-full bg-[#15161C]/95 border border-[#282932] px-3 flex-row items-center justify-around shadow-2xl">
        {/* Home Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)')}
          className={`items-center justify-center px-6 py-2 rounded-full ${
            isHome ? 'bg-[#252733]' : 'bg-transparent'
          }`}
        >
          <HomeIcon
            size={21}
            color={isHome ? '#FFFFFF' : '#8E8E93'}
            strokeWidth={2}
          />
          <Text
            className={`text-[11px] font-bold mt-1 tracking-tight ${
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
          className={`items-center justify-center px-6 py-2 rounded-full ${
            isSubjects ? 'bg-[#252733]' : 'bg-transparent'
          }`}
        >
          <SubjectsIcon
            size={21}
            color={isSubjects ? '#FFFFFF' : '#8E8E93'}
            strokeWidth={2}
          />
          <Text
            className={`text-[11px] font-bold mt-1 tracking-tight ${
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
          className={`items-center justify-center px-6 py-2 rounded-full ${
            isStats ? 'bg-[#252733]' : 'bg-transparent'
          }`}
        >
          <StatsIcon
            size={21}
            color={isStats ? '#FFFFFF' : '#8E8E93'}
            strokeWidth={2.2}
          />
          <Text
            className={`text-[11px] font-bold mt-1 tracking-tight ${
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

