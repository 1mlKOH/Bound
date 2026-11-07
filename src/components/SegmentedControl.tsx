import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SegmentedControlProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: any) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <View className="flex-row mx-4 my-2 p-1 rounded-full bg-[#1B1C22] border border-[#282932]">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => onSelect(opt.value)}
            className={`flex-1 py-2 rounded-full items-center justify-center ${
              isSelected ? 'bg-[#2A2B33]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                isSelected ? 'text-white' : 'text-zinc-400'
              }`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
