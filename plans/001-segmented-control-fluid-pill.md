# 001 — Fluid Animated Indicator for SegmentedControl

- **Status**: TODO
- **Commit**: 7d219bb
- **Severity**: HIGH
- **Category**: Performance & Physicality
- **Estimated scope**: 1 file (`src/components/SegmentedControl.tsx`)

## Problem

In [`src/components/SegmentedControl.tsx:80`](file:///storage/emulated/0/bound/src/components/SegmentedControl.tsx#L80), the style contains an invalid CSS web property:

```tsx
/* src/components/SegmentedControl.tsx:79-81 — current */
segment: {
  transitionProperty: 'all',
},
```

In React Native, `transitionProperty: 'all'` does not execute on mobile (it is a web-only CSS attribute) and violates the anti-pattern rule against unbounded property transitions. Furthermore, when toggling between "Month" and "Week", the active capsule indicator snaps abruptly without spatial continuity or physical feedback across the two segments.

## Target

A continuous, sliding indicator pill that glides between tabs using React Native's native-driven `Animated.spring` or `Animated.timing` with `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`:

```tsx
/* target */
// Animated sliding pill background under active tab
const translateX = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.spring(translateX, {
    toValue: selectedIndex * segmentWidth,
    damping: 18,
    stiffness: 180,
    mass: 0.8,
    useNativeDriver: true,
  }).start();
}, [selectedIndex]);
```

## Repo conventions to follow

- Component styles reside in `StyleSheet.create` alongside NativeWind utility classes.
- Continuous rounded corners use `borderRadius` with `borderCurve: 'continuous'`.
- Haptic feedback is triggered via `Haptics.selectionAsync()`.

## Steps

1. In `src/components/SegmentedControl.tsx`, remove the invalid `segment: { transitionProperty: 'all' }` property from `StyleSheet.create`.
2. Introduce an active indicator `<Animated.View>` positioned absolute inside the trough container with `useNativeDriver: true` transform animation.
3. Compute segment width on container layout via `onLayout` (`(width - padding * 2) / options.length`).
4. Add subtle press-in scaling `transform: scale(0.97)` on touch using `Animated.Value`.

## Boundaries

- Do NOT change the options schema (`{ label: string; value: string }[]`).
- Do NOT touch `src/components/CalendarCard.tsx` or parent `app/(tabs)/stats.tsx`.
- Do NOT add external dependencies (use React Native core `Animated`).

## Verification

- **Mechanical**: Run `node ./node_modules/typescript/bin/tsc --noEmit` and confirm exit code 0.
- **Feel check**:
  - Tapping between "Month" and "Week" slides the glowing indicator smoothly across the trough instead of teleporting.
  - Rapid double-tapping retargets the spring mid-flight without snapping to 0.
- **Done when**: The invalid `transitionProperty` is eliminated and the segmented pill glides smoothly with zero layout jumps.
