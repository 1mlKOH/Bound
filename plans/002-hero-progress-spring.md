# 002 — Spring-Driven Attendance Hero Progress Bar

- **Status**: TODO
- **Commit**: 7d219bb
- **Severity**: MEDIUM
- **Category**: Easing & Duration
- **Estimated scope**: 1 file (`src/components/HeroAttendanceCard.tsx`)

## Problem

In [`src/components/HeroAttendanceCard.tsx:39`](file:///storage/emulated/0/bound/src/components/HeroAttendanceCard.tsx#L39), the progress bar fill width is tied directly to a raw string width percentage:

```tsx
/* src/components/HeroAttendanceCard.tsx:39, 107-115 — current */
const progressWidth = `${Math.min(100, Math.max(0, stats.pooledPercentage))}%`;

<View className="h-2 rounded-full bg-white/[0.08] overflow-hidden mb-3">
  <View
    style={{
      width: progressWidth,
      backgroundColor: progressColor,
    }}
    className="h-full rounded-full"
  />
</View>
```

When marking a class as Present or Absent, the progress bar jumps instantly to the new percentage without any spatial transition. For a central health-style dashboard metric, this feels brittle and disconnected.

## Target

A spring-interpolated progress bar using a sub-300ms responsive easing (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`) or gentle spring physics:

```tsx
/* target */
const animatedPercent = useRef(new Animated.Value(stats.pooledPercentage)).current;

useEffect(() => {
  Animated.spring(animatedPercent, {
    toValue: Math.min(100, Math.max(0, stats.pooledPercentage)),
    damping: 20,
    stiffness: 150,
    mass: 0.6,
    useNativeDriver: false, // width/flex interpolation
  }).start();
}, [stats.pooledPercentage]);
```

## Repo conventions to follow

- Visual style: dark emerald glow `#00BF63` with `rgba(0, 191, 99, 0.2)` shadow.
- Border radius: continuous squircle styling (`borderCurve: 'continuous'`).

## Steps

1. In `src/components/HeroAttendanceCard.tsx`, import `Animated` from `'react-native'`.
2. Store `animatedPercent` as an `Animated.Value`.
3. In a `useEffect`, spring-animate to the new `stats.pooledPercentage` whenever it changes.
4. Interpolate `animatedPercent.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })` onto `<Animated.View style={{ width: interpolatedWidth }}>`.

## Boundaries

- Do NOT alter the underlying calculation in `src/domain/attendance.ts`.
- Do NOT animate the numeric percentage text with high-frequency re-renders (keep text crisp).
- Do NOT alter card padding or exterior layout.

## Verification

- **Mechanical**: Run `node ./node_modules/typescript/bin/tsc --noEmit` and confirm exit code 0.
- **Feel check**:
  - Marking a class changes the progress bar with a calm, organic 220ms spring fill.
  - Toggling classes back and forth retargets smoothly without jerking.
- **Done when**: Progress bar transitions smoothly on state updates without dropping frames.
