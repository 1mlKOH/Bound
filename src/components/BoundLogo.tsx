import React from 'react';
import Svg, { Circle, G, Path, ClipPath, Defs, Rect, LinearGradient, Stop } from 'react-native-svg';
import { View, StyleProp, ViewStyle } from 'react-native';

interface BoundLogoProps {
  size?: number;
  variant?: 'color' | 'mono-dark' | 'mono-white' | 'emerald';
  withTile?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Official vector brand mark for Bound — Tri-Track Harmonic Wave on Obsidian Medallion.
 */
export const BoundLogo: React.FC<BoundLogoProps> = ({
  size = 40,
  variant = 'color',
  withTile = false,
  style,
}) => {
  const topColor =
    variant === 'mono-dark'
      ? '#0F172A'
      : variant === 'mono-white'
      ? '#FFFFFF'
      : variant === 'emerald'
      ? '#3DDC84'
      : '#1E9BFF';

  const midColor =
    variant === 'mono-dark'
      ? '#0F172A'
      : variant === 'mono-white'
      ? '#FFFFFF'
      : '#3DDC84';

  const botColor =
    variant === 'mono-dark'
      ? '#0F172A'
      : variant === 'mono-white'
      ? '#FFFFFF'
      : variant === 'emerald'
      ? '#3DDC84'
      : '#FFB020';

  const medallionFill =
    variant === 'mono-dark'
      ? '#F1F3F5'
      : variant === 'mono-white'
      ? 'transparent'
      : variant === 'emerald'
      ? 'rgba(61, 220, 132, 0.12)'
      : '#22242C';

  const medallionStroke =
    variant === 'mono-dark'
      ? '#0F172A'
      : variant === 'mono-white'
      ? '#FFFFFF'
      : variant === 'emerald'
      ? '#3DDC84'
      : 'rgba(255, 255, 255, 0.46)';

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          {withTile && (
            <LinearGradient id="bound-tile-bg" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#1D1E23" />
              <Stop offset="100%" stopColor="#131418" />
            </LinearGradient>
          )}
          <ClipPath id="bound-ribbon-clip">
            <Circle cx="256" cy="256" r="218" />
          </ClipPath>
        </Defs>

        {/* Optional Obsidian Background Tile */}
        {withTile && <Rect width="512" height="512" rx="108" fill="url(#bound-tile-bg)" />}

        {/* Circular Medallion Base */}
        <Circle
          cx="256"
          cy="256"
          r="230"
          fill={medallionFill}
          stroke={medallionStroke}
          strokeWidth={14}
        />

        {/* Three Parallel Harmonic S-Curve Ribbons */}
        <G clipPath="url(#bound-ribbon-clip)">
          <Path
            d="M -25 271 C 106 271, 162 206, 256 206 C 350 206, 406 142, 537 142"
            fill="none"
            stroke={topColor}
            strokeWidth={34}
            strokeLinecap="round"
          />
          <Path
            d="M -25 321 C 106 321, 162 256, 256 256 C 350 256, 406 191, 537 191"
            fill="none"
            stroke={midColor}
            strokeWidth={34}
            strokeLinecap="round"
          />
          <Path
            d="M -25 370 C 106 370, 162 306, 256 306 C 350 306, 406 241, 537 241"
            fill="none"
            stroke={botColor}
            strokeWidth={34}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
};
