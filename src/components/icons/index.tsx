import React from 'react';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Keyline Icons: home-simple (fill)
 * MIT License (c) Keyline Icons
 */
export const HomeIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.0605 2.70727C11.1795 1.75931 12.8205 1.75931 13.9395 2.70727L20.9395 8.63794L21.0615 8.74829C21.6586 9.31317 22 10.1004 22 10.927V19.0002C21.9999 20.657 20.6568 22.0002 19 22.0002H5C3.34318 22.0002 2.00011 20.657 2 19.0002V10.927C2.00002 10.0454 2.38775 9.20795 3.06055 8.63794L10.0605 2.70727Z"
      fill={color}
    />
  </Svg>
);

/**
 * Keyline Icons: book-open (fill)
 * MIT License (c) Keyline Icons
 */
export const SubjectsIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#8E8E93',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 3L8 3C9.5738 3 11.0557 3.741 12 5C12.9443 3.741 14.4262 3 16 3L20 3C21.6569 3 23 4.3431 23 6L23 15C23 16.6569 21.6569 18 20 18L15 18C13.8954 18 13 18.8954 13 20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20C11 18.8954 10.1046 18 9 18L4 18C2.3431 18 1 16.6569 1 15L1 6C1 4.3431 2.3431 3 4 3ZM11 4L11 15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15L13 4C12.621 4.2843 12.2843 4.621 12 5C11.7157 4.621 11.379 4.2843 11 4Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </Svg>
);

/**
 * Keyline Icons: chart-column-big (fill)
 * MIT License (c) Keyline Icons
 */
export const StatsIcon: React.FC<IconProps> = ({
  size = 22,
  color = '#8E8E93',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 7L11 7C12.1046 7 13 7.8954 13 9L13 16C13 17.1046 12.1046 18 11 18L9 18C7.8954 18 7 17.1046 7 16L7 9C7 7.8954 7.8954 7 9 7ZM17 4L19 4C20.1046 4 21 4.8954 21 6L21 16C21 17.1046 20.1046 18 19 18L17 18C15.8954 18 15 17.1046 15 16L15 6C15 4.8954 15.8954 4 17 4Z"
      fill={color}
    />
    <Path
      d="M3 3L3 19C3 20.1046 3.8954 21 5 21L21 21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Precision Settings gear icon
 */
export const SettingsIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Sun icon matching top right of reference screenshot
 */
export const SunIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="2" x2="12" y2="4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="19.5" x2="12" y2="22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="2" y1="12" x2="4.5" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="19.5" y1="12" x2="22" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4.93" y1="4.93" x2="6.7" y2="6.7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="17.3" y1="17.3" x2="19.07" y2="19.07" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="4.93" y1="19.07" x2="6.7" y2="17.3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="17.3" y1="6.7" x2="19.07" y2="4.93" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * Moon icon for dark theme
 */
export const MoonIcon: React.FC<IconProps> = ({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Chevrons for navigation & date selector
 */
export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#A1A1AA',
  strokeWidth = 2.2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18l-6-6 6-6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#A1A1AA',
  strokeWidth = 2.2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#A1A1AA',
  strokeWidth = 2.2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#A1A1AA',
  strokeWidth = 2.2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 15l-6-6-6 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Search magnifying glass
 */
export const SearchIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#71717A',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
    <Line
      x1="16.5"
      y1="16.5"
      x2="21"
      y2="21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Close / Dismiss 'X'
 */
export const CloseIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#A1A1AA',
  strokeWidth = 2.2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * Checkmark
 */
export const CheckIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFFFFF',
  strokeWidth = 2.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Plus / Add Icon
 */
export const PlusIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
  strokeWidth = 2.4,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * Calendar / Schedule Icon
 */
export const CalendarIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#A1A1AA',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="17"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * Keyline Icons: bin (fill)
 * Trash / Delete Icon
 */
export const TrashIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FF6B72',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6C20.5523 6 21 6.4477 21 7C21 7.5523 20.5523 8 20 8L19 8L19 19C19 21.2091 17.2091 23 15 23L9 23C6.7909 23 5 21.2091 5 19L5 8L4 8C3.4477 8 3 7.5523 3 7C3 6.4477 3.4477 6 4 6L20 6ZM14 1C14.5523 1 15 1.4477 15 2C15 2.5523 14.5523 3 14 3L10 3C9.4477 3 9 2.5523 9 2C9 1.4477 9.4477 1 10 1L14 1Z"
      fill={color}
    />
  </Svg>
);

/**
 * Refresh / Reset Icon
 */
export const RefreshIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFB020',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4v6h-6M1 20v-6h6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Keyline Icons: folder-arrow-down (fill)
 * Export / Backup Icon
 */
export const ExportIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#A1A1AA',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 7C2 4.7909 3.7909 3 6 3L8.6716 3C9.4672 3 10.2303 3.3161 10.7929 3.8787L12.1213 5.2071C12.3089 5.3946 12.5632 5.5 12.8284 5.5L18 5.5C20.2091 5.5 22 7.2909 22 9.5L22 10C22 10.5523 21.5523 11 21 11L14 11C12.3431 11 11 12.3431 11 14L11 20C11 20.5523 10.5523 21 10 21L6 21C3.7909 21 2 19.2091 2 17Z"
      fill={color}
    />
    <Path
      d="M18 14V20M15 17L18 20L21 17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Keyline Icons: folder-arrow-up (fill)
 * Import / Download Icon
 */
export const ImportIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#A1A1AA',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 7C2 4.7909 3.7909 3 6 3L8.6716 3C9.4672 3 10.2303 3.3161 10.7929 3.8787L12.1213 5.2071C12.3089 5.3946 12.5632 5.5 12.8284 5.5L18 5.5C20.2091 5.5 22 7.2909 22 9.5L22 10C22 10.5523 21.5523 11 21 11L14 11C12.3431 11 11 12.3431 11 14L11 20C11 20.5523 10.5523 21 10 21L6 21C3.7909 21 2 19.2091 2 17Z"
      fill={color}
    />
    <Path
      d="M18 20V14M15 17L18 14L21 17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Three Dots / More Options Icon (Ellipsis)
 */
export const MoreHorizontalIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#A1A1AA',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="1.75" fill={color} />
    <Circle cx="19" cy="12" r="1.75" fill={color} />
    <Circle cx="5" cy="12" r="1.75" fill={color} />
  </Svg>
);

/**
 * Keyline Icons: copy-check (fill)
 * Perfect for batch mark / select all
 */
export const CopyCheckIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.8284 4C15.4046 2.8015 14.2714 2 13 2L5 2C3.34315 2 2 3.34315 2 5L2 13C2 14.2714 2.8015 15.4046 4 15.8284"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 7L19 7C21.2091 7 23 8.7909 23 11L23 19C23 21.2091 21.2091 23 19 23L11 23C8.7909 23 7 21.2091 7 19L7 11C7 8.7909 8.7909 7 11 7ZM12.7071 14.2929C12.5196 14.1054 12.2652 14 12 14C11.4477 14 11 14.4477 11 15C11 15.2652 11.1054 15.5196 11.2929 15.7071L13.2929 17.7071C13.4804 17.8946 13.7348 18 14 18C14.2652 18 14.5196 17.8946 14.7071 17.7071L18.7071 13.7071C18.8946 13.5196 19 13.2652 19 13C19 12.4477 18.5523 12 18 12C17.7348 12 17.4804 12.1054 17.2929 12.2929L14 15.5858L12.7071 14.2929Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </Svg>
);

/**
 * Keyline Icons: calendar-sparkles (fill)
 * Festive calendar for holidays / off-days
 */
export const CalendarSparklesIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFB020',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 20L6 20C4.3431 20 3 18.6569 3 17L3 7C3 5.3431 4.3431 4 6 4L18 4C19.6569 4 21 5.3431 21 7L21 12M13 10L17 10M8 2L8 6M16 2L16 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5492 15.3739L19.1373 16.8648C19.3173 17.3213 19.6787 17.6827 20.1352 17.8627L21.6261 18.4508C21.8518 18.5397 22 18.7576 22 19C22 19.2424 21.8518 19.4603 21.6261 19.5492L20.1352 20.1373C19.6787 20.3173 19.3173 20.6787 19.1373 21.1352L18.5492 22.6261C18.4603 22.8518 18.2424 23 18 23C17.7576 23 17.5397 22.8518 17.4508 22.6261L16.8627 21.1352C16.6827 20.6787 16.3213 20.3173 15.8648 20.1373L14.3739 19.5492C14.1482 19.4603 14 19.2424 14 19C14 18.7576 14.1482 18.5397 14.3739 18.4508L15.8648 17.8627C16.3213 17.6827 16.6827 17.3213 16.8627 16.8648L17.4508 15.3739C17.5397 15.1482 17.7576 15 18 15C18.2424 15 18.4603 15.1482 18.5492 15.3739ZM9.8433 11.2337L10.2108 12.1655C10.3233 12.4508 10.5492 12.6767 10.8345 12.7892L11.7663 13.1567C11.9074 13.2123 12 13.3485 12 13.5C12 13.6515 11.9074 13.7877 11.7663 13.8433L10.8345 14.2108C10.5492 14.3233 10.3233 14.5492 10.2108 14.8345L9.8433 15.7663C9.7877 15.9074 9.6515 16 9.5 16C9.3485 16 9.2123 15.9074 9.1567 15.7663L8.7892 14.8345C8.6767 14.5492 8.4508 14.3233 8.1655 14.2108L7.2337 13.8433C7.0926 13.7877 7 13.6515 7 13.5C7 13.3485 7.0926 13.2123 7.2337 13.1567L8.1655 12.7892C8.4508 12.6767 8.6767 12.4508 8.7892 12.1655L9.1567 11.2337C9.2123 11.0926 9.3485 11 9.5 11C9.6515 11 9.7877 11.0926 9.8433 11.2337Z"
      fill={color}
    />
  </Svg>
);

/**
 * Keyline Icons: calendar-off (fill)
 * Indicating excluded/cancelled holiday date
 */
export const CalendarOffIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFB020',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.8284 20.8284C20.1046 21.5523 19.1046 22 18 22L6 22C3.7909 22 2 20.2091 2 18L2 8C2 6.3778 2.9657 4.9811 4.3535 4.3535ZM9.9497 5.7071C9.6637 5.4211 9.5782 4.991 9.733 4.6173C9.8878 4.2436 10.2524 4 10.6569 4L18 4C20.2091 4 22 5.7909 22 8L22 15.3431C22 15.7476 21.7564 16.1122 21.3827 16.267C21.009 16.4218 20.5789 16.3363 20.2929 16.0503L9.9497 5.7071ZM12 12L7 12C6.4477 12 6 11.5523 6 11C6 10.4477 6.4477 10 7 10L10 10Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
    <Path
      d="M16 3L16 7M2 2L22 22"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Keyline Icons: calendar-plus (fill)
 * Schedule / Add Extra Class
 */
export const CalendarPlusIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4H18C20.2091 4 22 5.79086 22 8V11C22 11.5523 21.5523 12 21 12H15C13.3431 12 12 13.3431 12 15V21C12 21.5523 11.5523 22 11 22H6C3.79086 22 2 20.2091 2 18V8C2 5.79086 3.79086 4 6 4ZM7 10H17C17.5523 10 18 10.4477 18 11C18 11.5523 17.5523 12 17 12H7C6.44772 12 6 11.5523 6 11C6 10.4477 6.44772 10 7 10Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
    <Path
      d="M8 3V7M16 3V7M18 15V21M15 18H21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Keyline Icons: book-plus (fill)
 * Add Subject / New Course
 */
export const BookPlusIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 1L17 1C19.2091 1 21 2.7909 21 5L21 12C21 12.5523 20.5523 13 20 13L14 13C12.3431 13 11 14.3431 11 16L11 22C11 22.5523 10.5523 23 10 23L6 23C4.3431 23 3 21.6569 3 20L3 5C3 2.7909 4.7909 1 7 1ZM6 19C5.4477 19 5 19.4477 5 20C5 20.5523 5.4477 21 6 21L11 21L11 19L6 19ZM8 5C7.4477 5 7 5.4477 7 6L7 14C7 14.5523 7.4477 15 8 15C8.5523 15 9 14.5523 9 14L9 6C9 5.4477 8.5523 5 8 5Z"
      fill={color}
    />
    <Path
      d="M17 16V22M14 19H20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Keyline Icons: circle-check (fill)
 */
export const CircleCheckIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#10B981',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM17.1305 7.87822C16.6764 7.47461 15.9818 7.51547 15.5782 7.96953L10.5326 13.6436L8.42178 11.2695C8.01817 10.8155 7.32359 10.7746 6.86953 11.1782C6.41547 11.5818 6.37461 12.2764 6.77822 12.7305L9.71084 16.0305C9.91958 16.2653 10.2195 16.4 10.5337 16.4C10.8478 16.3999 11.1468 16.2652 11.3555 16.0305L17.2218 9.43047C17.6254 8.97641 17.5845 8.28183 17.1305 7.87822Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </Svg>
);

/**
 * Keyline Icons: circle-x (fill)
 */
export const CircleXIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#EF4444',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM16.0777 7.92227C15.6482 7.4927 14.9518 7.49271 14.5223 7.92227L12 10.4445L9.47773 7.92227C9.04816 7.49271 8.35184 7.49269 7.92227 7.92227C7.49271 8.35184 7.49271 9.04816 7.92227 9.47773L10.4445 12L7.92227 14.5223C7.49269 14.9518 7.49269 15.6482 7.92227 16.0777C8.35184 16.5073 9.04816 16.5073 9.47773 16.0777L12 13.5555L14.5223 16.0777C14.9518 16.5073 15.6482 16.5073 16.0777 16.0777C16.5073 15.6482 16.5073 14.9518 16.0777 14.5223L13.5555 12L16.0777 9.47773C16.5073 9.04816 16.5073 8.35184 16.0777 7.92227Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </Svg>
);

/**
 * Keyline Icons: circle-minus (fill)
 */
export const CircleMinusIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#A1A1AA',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM7.6 10.9C6.99249 10.9 6.5 11.3925 6.5 12C6.5 12.6075 6.99249 13.1 7.6 13.1H16.4C17.0075 13.1 17.5 12.6075 17.5 12C17.5 11.3925 17.0075 10.9 16.4 10.9H7.6Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </Svg>
);

/**
 * Keyline Icons: bell (fill)
 */
export const BellIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C15.3137 2 18 4.68629 18 8C18 10.3517 18.4669 11.6977 18.8944 12.5528C19.1215 13.007 19.3311 13.3166 19.545 13.673C19.7216 13.9674 20 14.4387 20 15C20 16.1046 19.1046 17 18 17H6C4.8954 17 4 16.1046 4 15C4 14.4387 4.2784 13.9674 4.455 13.673C4.6689 13.3166 4.8785 13.007 5.1056 12.5528C5.5331 11.6977 6 10.3517 6 8C6 4.68629 8.68629 2 12 2Z"
      fill={color}
    />
    <Path
      d="M10.2679 20C10.6252 20.6188 11.2855 21 12 21C12.7145 21 13.3748 20.6188 13.7321 20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Keyline Icons: gauge (fill)
 */
export const GaugeIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 12C23 18.0751 18.0751 23 12 23C5.9249 23 1 18.0751 1 12C1 5.9249 5.9249 1 12 1C18.0751 1 23 5.9249 23 12ZM13 10.2679L13 7C13 6.4477 12.5523 6 12 6C11.4477 6 11 6.4477 11 7L11 10.2679C10.3812 10.6252 10 11.2855 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 11.2855 13.6188 10.6252 13 10.2679ZM7 12C7 11.4477 6.5523 11 6 11C5.4477 11 5 11.4477 5 12C5 12.5523 5.4477 13 6 13C6.5523 13 7 12.5523 7 12ZM8.7574 7.7574C8.7574 7.2051 8.3096 6.7574 7.7574 6.7574C7.2051 6.7574 6.7574 7.2051 6.7574 7.7574C6.7574 8.3096 7.2051 8.7574 7.7574 8.7574C8.3096 8.7574 8.7574 8.3096 8.7574 7.7574ZM17.2426 7.7574C17.2426 7.2051 16.7949 6.7574 16.2426 6.7574C15.6904 6.7574 15.2426 7.2051 15.2426 7.7574C15.2426 8.3096 15.6904 8.7574 16.2426 8.7574C16.7949 8.7574 17.2426 8.3096 17.2426 7.7574ZM19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </Svg>
);

export const InfoIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1" fill={color} />
  </Svg>
);

export const ZapIcon: React.FC<IconProps> = ({
  size = 18,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      fill={color}
    />
  </Svg>
);

