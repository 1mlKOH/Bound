# 004 — Subtle Micro-Scale Feedback for FloatingBottomNav

- **Status**: TODO
- **Commit**: 7d219bb
- **Severity**: LOW
- **Category**: Physicality & Feedback
- **Estimated scope**: 1 file (`src/components/FloatingBottomNav.tsx`)

## Problem

In [`src/components/FloatingBottomNav.tsx:21-65`](file:///storage/emulated/0/bound/src/components/FloatingBottomNav.tsx#L21-L65), tab buttons use `activeOpacity={0.8}` with no spatial or physical press confirmation:

```tsx
/* src/components/FloatingBottomNav.tsx:21-25 — current */
<TouchableOpacity
  activeOpacity={0.8}
  onPress={() => router.replace('/(tabs)')}
  className={`items-center justify-center px-6 py-2 rounded-full ${...}`}
>
```

When switching between Home, Subjects, and Stats, the active capsule instantly teleports without micro-press depth (`scale(0.96)`).

## Target

Subtle physical tap feedback (`scale(0.96)`) on press-in with 140ms ease-out release, plus light selection haptic feedback (`Haptics.selectionAsync()`):

```tsx
/* target */
// Tab press micro-interaction
const scaleVal = useRef(new Animated.Value(1)).current;

const onPressIn = () => {
  Animated.timing(scaleVal, {
    toValue: 0.95,
    duration: 100,
    useNativeDriver: true,
  }).start();
};

const onPressOut = () => {
  Animated.spring(scaleVal, {
    toValue: 1,
    damping: 14,
    stiffness: 220,
    useNativeDriver: true,
  }).start();
};
```

## Repo conventions to follow

- Container: `h-[72px] rounded-full bg-[#15161C]/95 border border-[#282932]`.
- Active tab capsule: `bg-[#252733] px-6 py-2 rounded-full`.

## Steps

1. Wrap each navigation tab in an `<Animated.View style={{ transform: [{ scale }] }}>`.
2. Attach `onPressIn` and `onPressOut` to scale down to `0.95` on press and bounce back smoothly on release.
3. Trigger `Haptics.selectionAsync()` on route change.

## Boundaries

- Do NOT change navigation routes or parameters.
- Do NOT animate layout or width off-GPU (transform scale only).

## Verification

- **Mechanical**: Run `node ./node_modules/typescript/bin/tsc --noEmit` and confirm exit code 0.
- **Feel check**:
  - Tapping any bottom navigation tab gives a springy, physical button feel.
- **Done when**: Nav tabs feel solid, tactile, and responsive under thumb touch.
