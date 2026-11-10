import React from 'react';
import Svg, { Path, Circle, Rect, Line, Ellipse } from 'react-native-svg';

export interface SubjectIconProps {
  size?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

const DEFAULT_STROKE = '#FFFFFF';
const DEFAULT_FILL = 'rgba(255, 255, 255, 0.28)';

/**
 * 1. Physics & Quantum
 * Keyline outline: atom
 */
export const PhysicsIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.1119 12C21.2171 15.4351 21.5935 18.5707 20.0821 20.0821C17.8951 22.269 12.5038 20.4234 8.0402 15.9598M4.8881 12C2.7829 8.5649 2.4065 5.4293 3.9179 3.9179C6.1049 1.731 11.4962 3.5766 15.9598 8.0402M12 4.8881C15.4351 2.7829 18.5707 2.4065 20.0821 3.9179C22.269 6.1049 20.4234 11.4962 15.9598 15.9598M12 19.1119C8.5649 21.2171 5.4293 21.5935 3.9179 20.0821C1.731 17.8951 3.5766 12.5038 8.0402 8.0402"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z"
      fill={strokeColor}
    />
  </Svg>
);

/**
 * 2. Computer Science & Data Structures
 * Keyline outline: folder-tree
 */
export const ComputerScienceIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3v13c0 1.657 1.343 3 3 3h3M3 5c0 1.657 1.343 3 3 3h3M14 3h1.382c.379 0 .725.214.894.553l.448.894c.169.339.515.553.894.553H20c.552 0 1 .448 1 1v3c0 .552-.448 1-1 1h-6c-.552 0-1-.448-1-1V4c0-.552.448-1 1-1zM14 14h1.382c.379 0 .725.214.894.553l.448.894c.169.339.515.553.894.553H20c.552 0 1 .448 1 1v3c0 .552-.448 1-1 1h-6c-.552 0-1-.448-1-1v-5c0-.552.448-1 1-1z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 3. Economics & Finance
 * Keyline outline: trending-up
 */
export const EconomicsIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 17l6.5-6.5 5 5 7.9-7.9M16 7h5.5c.276 0 .5.224.5.5V13"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 4. Chemistry & Materials
 * Keyline outline: flask-conical
 */
export const ChemistryIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.5 2h3c.552 0 1 .448 1 1v4.774c0 .149.033.296.097.43l5.207 10.936c.631 1.328-.337 2.86-1.806 2.86H6.002c-1.47 0-2.438-1.532-1.806-2.86L9.403 8.204c.064-.134.097-.281.097-.43V3c0-.552.448-1 1-1zM8 2h8M4.739 18h14.522"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 5. Mathematics & Calculus
 * Radical root with variable x & calculus symbol disc
 */
export const MathematicsIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Translucent math disc */}
    <Circle cx="16.5" cy="14.5" r="4.2" fill={fillColor} />
    {/* Radical root stroke */}
    <Path
      d="M3 13.5h2.5l3 7 4.5-16.5h7.5"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Variable 'x' inside */}
    <Path
      d="M14.5 12.5l4 4M18.5 12.5l-4 4"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * 6. Biology & Life Sciences
 * Double helix DNA spiral with translucent base rungs
 */
export const BiologyIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left Strand */}
    <Path
      d="M6 3.5c0 4.5 12 6.5 12 11s-12 5.5-12 6"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Right Strand */}
    <Path
      d="M18 3.5c0 4.5-12 6.5-12 11s12 5.5 12 6"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Cross rungs */}
    <Line x1="7" y1="6" x2="17" y2="6" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1="8" y1="11.5" x2="16" y2="11.5" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1="7" y1="17.5" x2="17" y2="17.5" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" />
    {/* Genetic nodes */}
    <Circle cx="12" cy="11.5" r="2.2" fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
  </Svg>
);

/**
 * 7. Medicine & Health
 * Stethoscope with translucent diaphragm
 */
export const MedicineIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Earpieces & Y-tube */}
    <Path
      d="M5 3.5v4.5a7 7 0 0 0 14 0V3.5"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Extension tube */}
    <Path
      d="M12 15v1.5a4.5 4.5 0 0 0 7.5 3.3"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Chest piece with translucent diaphragm */}
    <Circle
      cx="19.5"
      cy="17"
      r="2.8"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
  </Svg>
);

/**
 * 8. Electrical & Electronics
 * Microchip processor with pins & translucent core
 */
export const ElectricalIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Chip body */}
    <Rect
      x="6.5"
      y="6.5"
      width="11"
      height="11"
      rx="2.5"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
    {/* Top & bottom pins */}
    <Line x1="9.5" y1="3" x2="9.5" y2="6.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="14.5" y1="3" x2="14.5" y2="6.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="9.5" y1="17.5" x2="9.5" y2="21" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="14.5" y1="17.5" x2="14.5" y2="21" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Left & right pins */}
    <Line x1="3" y1="9.5" x2="6.5" y2="9.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3" y1="14.5" x2="6.5" y2="14.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="17.5" y1="9.5" x2="21" y2="9.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="17.5" y1="14.5" x2="21" y2="14.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Center core pip */}
    <Circle cx="12" cy="12" r="1.5" fill={strokeColor} />
  </Svg>
);

/**
 * 9. Mechanical & Civil Engineering
 * Interlocking gear cogs with translucent hub
 */
export const EngineeringIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Central gear body with translucent fill */}
    <Circle
      cx="12"
      cy="12"
      r="4.5"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
    <Circle cx="12" cy="12" r="1.8" fill={strokeColor} />
    {/* 8 Gear Teeth */}
    <Path
      d="M12 3.5v2.5M12 18v2.5M3.5 12h2.5M18 12h2.5M6 6l1.8 1.8M16.2 16.2l1.8 1.8M6 18l1.8-1.8M16.2 7.8l1.8-1.8"
      stroke={strokeColor}
      strokeWidth={strokeWidth + 0.3}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * 10. Literature & Writing
 * Open book with translucent layered pages & fountain pen tip
 */
export const LiteratureIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left page with translucent fill */}
    <Path
      d="M12 6.5c-2.5-1.5-5.5-1.5-8.5 0V19c3-1.5 6-1.5 8.5 0"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right page */}
    <Path
      d="M12 6.5c2.5-1.5 5.5-1.5 8.5 0V19c-3-1.5-6-1.5-8.5 0"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Spine */}
    <Line x1="12" y1="6.5" x2="12" y2="19" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * 11. Languages & Linguistics
 * Overlapping speech bubbles with translucent backdrop
 */
export const LanguagesIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Background bubble with translucent fill */}
    <Path
      d="M9 7.5h7.5a3.5 3.5 0 0 1 3.5 3.5v3a3.5 3.5 0 0 1-3.5 3.5H15l-3 2.5v-2.5"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Foreground speech bubble */}
    <Path
      d="M4 6h8a3.5 3.5 0 0 1 3.5 3.5v2.5a3.5 3.5 0 0 1-3.5 3.5H8.5L5 18v-2.5A3.5 3.5 0 0 1 4 12V6z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Text line inside */}
    <Line x1="7" y1="10" x2="12" y2="10" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

/**
 * 12. History & Civilizations
 * Classical Pantheon columns with translucent pediment
 */
export const HistoryIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Triangular pediment roof with translucent fill */}
    <Path
      d="M12 4L3.5 9h17L12 4z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 4 Classical Columns */}
    <Line x1="6" y1="9" x2="6" y2="17.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="10" y1="9" x2="10" y2="17.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="14" y1="9" x2="14" y2="17.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="18" y1="9" x2="18" y2="17.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Base stylobate platform */}
    <Line x1="3" y1="17.5" x2="21" y2="17.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="2" y1="20" x2="22" y2="20" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * 13. Law & Political Science
 * Balanced scales of justice with translucent pans
 */
export const LawIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Center pillar & fulcrum */}
    <Line x1="12" y1="4" x2="12" y2="20" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="20" x2="16" y2="20" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="4" r="1.5" fill={strokeColor} />
    {/* Cross beam */}
    <Line x1="4.5" y1="7" x2="19.5" y2="7" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Left Pan */}
    <Path d="M4.5 7L2.5 13h4z" stroke={strokeColor} strokeWidth={1.5} strokeLinejoin="round" />
    <Path d="M2 13a2.5 2.5 0 0 0 5 0z" fill={fillColor} stroke={strokeColor} strokeWidth={1.8} />
    {/* Right Pan */}
    <Path d="M19.5 7L17.5 13h4z" stroke={strokeColor} strokeWidth={1.5} strokeLinejoin="round" />
    <Path d="M17 13a2.5 2.5 0 0 0 5 0z" fill={fillColor} stroke={strokeColor} strokeWidth={1.8} />
  </Svg>
);

/**
 * 14. Psychology & Philosophy
 * Dual brain / mind profile with translucent glowing idea core
 */
export const PsychologyIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Glowing cognitive idea core */}
    <Circle cx="12" cy="11.5" r="4" fill={fillColor} />
    {/* Brain lobes outline */}
    <Path
      d="M9.5 17.5a4.5 4.5 0 0 1-5-4 4 4 0 0 1 2-3.8 4 4 0 0 1 3-5.2 4.5 4.5 0 0 1 5 0 4 4 0 0 1 3 5.2 4 4 0 0 1 2 3.8 4.5 4.5 0 0 1-5 4"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Central light filament spark */}
    <Line x1="12" y1="9" x2="12" y2="14" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
    <Line x1="10" y1="18.5" x2="14" y2="18.5" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

/**
 * 15. Art, Design & Architecture
 * Artist palette with translucent paint mixing wells & brush
 */
export const ArtIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Palette body with translucent fill */}
    <Path
      d="M12 3a9 9 0 0 0-9 9c0 3.5 2 6 5.5 6h1.5a2 2 0 0 1 2 2v.5a2.5 2.5 0 0 0 2.5 2.5 6 6 0 0 0 6-6c0-7.7-4-14-8.5-14z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Paint color dots */}
    <Circle cx="7.5" cy="10.5" r="1.3" fill={strokeColor} />
    <Circle cx="11.5" cy="7.5" r="1.3" fill={strokeColor} />
    <Circle cx="16" cy="10" r="1.3" fill={strokeColor} />
    {/* Thumb cutout hole */}
    <Circle cx="14.5" cy="15.5" r="1.5" fill="none" stroke={strokeColor} strokeWidth={1.5} />
  </Svg>
);

/**
 * 16. Music & Audio
 * Beamed musical notes with translucent heads
 */
export const MusicIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left note head */}
    <Circle cx="6.5" cy="17.5" r="3" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
    {/* Right note head */}
    <Circle cx="17.5" cy="14.5" r="3" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
    {/* Stems & Connecting Beam */}
    <Path
      d="M9.5 17.5V6l11-3v11.5"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Secondary double beam */}
    <Path
      d="M9.5 9.5l11-3"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * 17. Geography & Earth Sciences
 * Globe with latitude meridians & translucent continent fill
 */
export const GeographyIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Outer sphere with translucent hemisphere fill */}
    <Circle
      cx="12"
      cy="12"
      r="8.5"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
    {/* Equator */}
    <Line x1="3.5" y1="12" x2="20.5" y2="12" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" />
    {/* Meridian ellipse */}
    <Ellipse
      cx="12"
      cy="12"
      rx="4.2"
      ry="8.5"
      stroke={strokeColor}
      strokeWidth={1.8}
    />
  </Svg>
);

/**
 * 18. Physical Education & Athletics
 * Barbell dumbbell with translucent weights
 */
export const SportsIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Center handle bar */}
    <Line x1="6.5" y1="12" x2="17.5" y2="12" stroke={strokeColor} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    {/* Left outer & inner plates */}
    <Rect
      x="4.5"
      y="8"
      width="2.5"
      height="8"
      rx="1.2"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
    <Rect x="2.5" y="9.5" width="2" height="5" rx="1" stroke={strokeColor} strokeWidth={strokeWidth} />
    {/* Right outer & inner plates */}
    <Rect
      x="17"
      y="8"
      width="2.5"
      height="8"
      rx="1.2"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    />
    <Rect x="19.5" y="9.5" width="2" height="5" rx="1" stroke={strokeColor} strokeWidth={strokeWidth} />
  </Svg>
);

/**
 * 19. Communication, Journalism & Media
 * Broadcasting megaphone with translucent sound cone
 */
export const MediaIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Megaphone body with translucent fill */}
    <Path
      d="M3 10v4a1 1 0 0 0 1 1h2.5l5.5 4V5L6.5 9H4a1 1 0 0 0-1 1z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Handle */}
    <Path d="M7 15v3.5a1.5 1.5 0 0 0 3 0V17" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    {/* Broadcast waves */}
    <Path d="M16 9a4 4 0 0 1 0 6" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M19 6.5a7.5 7.5 0 0 1 0 11" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * 20. Environment & Agriculture
 * Sprouting dual leaves with translucent blades
 */
export const EnvironmentIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left leaf */}
    <Path
      d="M12 12c-4 0-7.5-2.5-7.5-7.5 5 0 7.5 3.5 7.5 7.5z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right leaf */}
    <Path
      d="M12 15c4 0 7.5-2.5 7.5-7.5-5 0-7.5 3.5-7.5 7.5z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Growing stem */}
    <Path d="M12 21v-9" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * 21. General Studies & Academics (Universal Fallback)
 * Graduation cap with translucent crown & hanging tassel
 */
export const GeneralIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Diamond mortarboard crown with translucent fill */}
    <Path
      d="M12 3.5L2 8.5l10 5 10-5-10-5z"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cap base band */}
    <Path
      d="M6 10.8v4.7c0 2 2.7 3.8 6 3.8s6-1.8 6-3.8v-4.7"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Hanging side tassel */}
    <Path d="M20 9v7.5" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="20" cy="17.5" r="1.2" fill={strokeColor} />
  </Svg>
);

/**
 * 22. Veterinary & Animal Science
 * Keyline outline: paw-print
 */
export const VeterinaryIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12.25c1.201 0 2.286.716 2.758 1.82.42.982 1.143 1.803 2.063 2.344.916.539 1.479 1.523 1.479 2.586 0 1.657-1.343 3-3 3-.427 0-.849-.091-1.238-.267-.648-.294-1.351-.445-2.062-.445s-1.414.151-2.063.445c-.389.176-.811.267-1.238.267-1.657 0-3-1.343-3-3 0-1.063.563-2.047 1.479-2.586.92-.541 1.643-1.362 2.063-2.344.472-1.104 1.557-1.82 2.758-1.82zm2.25-7.25c0 1.657-1.007 3-2.25 3s-2.25-1.343-2.25-3 1.007-3 2.25-3 2.25 1.343 2.25 3zm-7.786 3.362c.567 1.557.08 3.163-1.088 3.588s-2.574-.517-3.14-2.074c-.567-1.557-.08-3.164 1.088-3.589s2.574.518 3.14 2.075zm15.3 1.539c-.567 1.557-1.973 2.475-3.141 2.05s-1.655-2.031-1.088-3.588 1.973-2.475 3.141-2.05 1.655 2.031 1.088 3.588z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 23. Anatomy & Morphology
 * Keyline outline: bone
 */
export const AnatomyIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.586 10.586l2.283-2.283c.351-.351.391-.908.093-1.306-.744-.995-.644-2.386.234-3.265.977-.976 2.56-.976 3.536 0 .475.475.739 1.122.732 1.794-.003.268.103.527.293.717s.449.296.717.293c.672-.007 1.318.257 1.794.732.976.976.976 2.56 0 3.536-.879.879-2.27.979-3.265.234-.398-.298-.955-.257-1.306.094l-2.283 2.283-2.283 2.283c-.351.351-.391.908-.093 1.306.744.995.644 2.386-.234 3.265-.976.976-2.56.976-3.536 0-.475-.475-.739-1.121-.732-1.793.003-.269-.103-.527-.293-.717s-.449-.296-.717-.293c-.672.007-1.319-.257-1.794-.732-.976-.977-.976-2.56 0-3.536.879-.879 2.27-.979 3.265-.235.398.298.955.258 1.306-.093l2.283-2.283z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 24. Physiology & Diagnostics
 * Keyline outline: heart-pulse
 */
export const PhysiologyIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C7.438 17.103 2 13.75 2 8.75 2 5.574 4.686 3 8 3c1.5 0 2.843.546 4 1.5 1.157-.954 2.5-1.5 4-1.5 3.314 0 6 2.574 6 5.75 0 5-5.438 8.353-10 12.25zM2.38 11H9l1-3 3 6 1-3h7.62"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 25. Livestock & Farm Management
 * Keyline outline: tractor
 */
export const LivestockIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 18c.628-.84 1-1.87 1-3 0-1.64-.785-3.09-2-4m0 7c-.912 1.21-2.364 2-4 2-2.761 0-5-2.24-5-5 0-1.64.786-3.09 2-4m7 7h4m-5-7c-.835-.63-1.874-1-3-1-1.126 0-2.164.37-3 1m6 0c.713-.11 1.378-.19 2-.24M4 11V4m0 0H2m2 0h6l2 6.76M19 18h2c.552 0 1-.45 1-1v-2.15c0-1.13-.634-2.19-1.66-2.68-1.014-.48-2.068-.91-3.34-1.18m0 0C15.65 10.7 14.055 10.58 12 10.76M17 10.99V11m0-.01V8l1-1m1 11c0 1.1-.895 2-2 2s-2-.9-2-2 .895-2 2-2 2 .9 2 2z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 15c0 .83-.672 1.5-1.5 1.5s-1.5-.67-1.5-1.5.672-1.5 1.5-1.5 1.5.67 1.5 1.5z"
      fill={strokeColor}
    />
  </Svg>
);

/**
 * 26. Pathology & Microbiology
 * Keyline outline: microscope
 */
export const PathologyIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5.065 3.64L3.918 2m6.309 9.01l.573.82M9.68 5H15c3.314 0 6 2.69 6 6s-2.686 6-6 6H8m7 0v5M3 22h18M3.426 4.79l3.277-2.3a1.47 1.47 0 011.393.43l4.015 5.73c.236.337.236.78 0 1.12l-3.277 2.3a1.47 1.47 0 01-1.393-.43L3.426 5.91a.998.998 0 010-1.12z"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 27. Pharmacology & Therapeutics
 * Keyline outline: pill
 */
export const PharmacologyIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.995 4.374a5.002 5.002 0 017.071 7.071l-8.621 8.621a5.002 5.002 0 01-7.071-7.071l8.621-8.621zm-4.311 4.31l6.632 6.632"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 28. Databases & Data Engineering
 * Keyline outline: database
 */
export const DatabaseIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 4c0 1.105-3.582 2-8 2s-8-.895-8-2 3.582-2 8-2 8 .895 8 2zM4 4v16c0 1.105 3.582 2 8 2s8-.895 8-2V4M4 12c0 1.105 3.582 2 8 2s8-.895 8-2"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 29. Architecture & Spatial Design
 * Keyline outline: building
 */
export const ArchitectureIcon: React.FC<SubjectIconProps> = ({
  size = 24,
  strokeColor = DEFAULT_STROKE,
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 2h10c1.657 0 3 1.343 3 3v14c0 1.657-1.343 3-3 3H7c-1.657 0-3-1.343-3-3V5c0-1.657 1.343-3 3-3zm3 20v-2c0-1.105.895-2 2-2s2 .895 2 2v2M9 6v2m6-2v2M9 12v2m6-2v2"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

import {
  SubjectCategoryKey,
  SUBJECT_CATEGORY_METAS,
  detectSubjectCategory,
} from '../../domain/subjectCategory';

export {
  SubjectCategoryKey,
  SUBJECT_CATEGORY_METAS,
  detectSubjectCategory,
};

export interface CategoryInfo {
  key: SubjectCategoryKey;
  label: string;
  iconComponent: React.FC<SubjectIconProps>;
}

export const CATEGORY_MAP: Record<
  SubjectCategoryKey,
  { label: string; component: React.FC<SubjectIconProps> }
> = {
  physics: { label: SUBJECT_CATEGORY_METAS.physics.label, component: PhysicsIcon },
  'computer-science': {
    label: SUBJECT_CATEGORY_METAS['computer-science'].label,
    component: ComputerScienceIcon,
  },
  economics: { label: SUBJECT_CATEGORY_METAS.economics.label, component: EconomicsIcon },
  chemistry: { label: SUBJECT_CATEGORY_METAS.chemistry.label, component: ChemistryIcon },
  mathematics: { label: SUBJECT_CATEGORY_METAS.mathematics.label, component: MathematicsIcon },
  biology: { label: SUBJECT_CATEGORY_METAS.biology.label, component: BiologyIcon },
  medicine: { label: SUBJECT_CATEGORY_METAS.medicine.label, component: MedicineIcon },
  electrical: { label: SUBJECT_CATEGORY_METAS.electrical.label, component: ElectricalIcon },
  engineering: { label: SUBJECT_CATEGORY_METAS.engineering.label, component: EngineeringIcon },
  literature: { label: SUBJECT_CATEGORY_METAS.literature.label, component: LiteratureIcon },
  languages: { label: SUBJECT_CATEGORY_METAS.languages.label, component: LanguagesIcon },
  history: { label: SUBJECT_CATEGORY_METAS.history.label, component: HistoryIcon },
  law: { label: SUBJECT_CATEGORY_METAS.law.label, component: LawIcon },
  psychology: { label: SUBJECT_CATEGORY_METAS.psychology.label, component: PsychologyIcon },
  art: { label: SUBJECT_CATEGORY_METAS.art.label, component: ArtIcon },
  music: { label: SUBJECT_CATEGORY_METAS.music.label, component: MusicIcon },
  geography: { label: SUBJECT_CATEGORY_METAS.geography.label, component: GeographyIcon },
  sports: { label: SUBJECT_CATEGORY_METAS.sports.label, component: SportsIcon },
  media: { label: SUBJECT_CATEGORY_METAS.media.label, component: MediaIcon },
  environment: { label: SUBJECT_CATEGORY_METAS.environment.label, component: EnvironmentIcon },
  general: { label: SUBJECT_CATEGORY_METAS.general.label, component: GeneralIcon },
  veterinary: { label: SUBJECT_CATEGORY_METAS.veterinary.label, component: VeterinaryIcon },
  anatomy: { label: SUBJECT_CATEGORY_METAS.anatomy.label, component: AnatomyIcon },
  physiology: { label: SUBJECT_CATEGORY_METAS.physiology.label, component: PhysiologyIcon },
  livestock: { label: SUBJECT_CATEGORY_METAS.livestock.label, component: LivestockIcon },
  pathology: { label: SUBJECT_CATEGORY_METAS.pathology.label, component: PathologyIcon },
  pharmacology: { label: SUBJECT_CATEGORY_METAS.pharmacology.label, component: PharmacologyIcon },
  database: { label: SUBJECT_CATEGORY_METAS.database.label, component: DatabaseIcon },
  architecture: { label: SUBJECT_CATEGORY_METAS.architecture.label, component: ArchitectureIcon },
};

interface SubjectDuotoneIconProps {
  name?: string;
  code?: string;
  category?: SubjectCategoryKey;
  size?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export const SubjectDuotoneIcon: React.FC<SubjectDuotoneIconProps> = ({
  name,
  code,
  category,
  size = 24,
  strokeColor = DEFAULT_STROKE,
  fillColor = DEFAULT_FILL,
  strokeWidth = 2,
}) => {
  const resolvedKey = category || detectSubjectCategory(name, code).key;
  const CategoryComponent = CATEGORY_MAP[resolvedKey]?.component || GeneralIcon;

  return (
    <CategoryComponent
      size={size}
      strokeColor={strokeColor}
      fillColor={fillColor}
      strokeWidth={strokeWidth}
    />
  );
};
