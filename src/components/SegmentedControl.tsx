import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

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
  const [troughWidth, setTroughWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const isInitialRender = useRef(true);

  const selectedIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === selectedValue)
  );
  const segmentWidth =
    troughWidth > 0 ? (troughWidth - 8) / options.length : 0;

  useEffect(() => {
    if (segmentWidth > 0) {
      const targetX = selectedIndex * segmentWidth;
      if (isInitialRender.current) {
        translateX.setValue(targetX);
        isInitialRender.current = false;
      } else {
        Animated.spring(translateX, {
          toValue: targetX,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [selectedIndex, segmentWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== troughWidth) {
      setTroughWidth(width);
      translateX.setValue(selectedIndex * ((width - 8) / options.length));
    }
  };

  const handleSelect = (val: any) => {
    if (val !== selectedValue) {
      Haptics.selectionAsync();
      onSelect(val);
    }
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.trough,
        {
          borderRadius: 24,
          borderCurve: 'continuous',
        },
      ]}
      className="relative flex-row mx-4 my-2 p-1 bg-[#15161C]/85 border border-white/[0.08]"
    >
      {/* Sliding Active Pill Indicator */}
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: segmentWidth,
              transform: [{ translateX }],
              borderRadius: 20,
              borderCurve: 'continuous',
            },
          ]}
        />
      )}

      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => handleSelect(opt.value)}
            style={{
              borderRadius: 20,
              borderCurve: 'continuous',
            }}
            className="flex-1 py-2 items-center justify-center z-10"
          >
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                  letterSpacing: -0.1,
                },
              ]}
              className={`text-[13px] ${
                isSelected ? 'font-semibold' : 'font-medium'
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

const styles = StyleSheet.create({
  trough: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderTopColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});

