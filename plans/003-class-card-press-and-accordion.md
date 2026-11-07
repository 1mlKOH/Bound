# 003 — Physical Press Feedback & Layout Transition on ClassCard

- **Status**: TODO
- **Commit**: 7d219bb
- **Severity**: HIGH
- **Category**: Physicality & Interruptibility
- **Estimated scope**: 1 file (`src/components/ClassCard.tsx`)

## Problem

In [`src/components/ClassCard.tsx:96-100`](file:///storage/emulated/0/bound/src/components/ClassCard.tsx#L96-L100), toggling a card between expanded and collapsed states alters `isExpanded` instantly:

```tsx
/* src/components/ClassCard.tsx:96-100 — current */
<TouchableOpacity
  activeOpacity={0.7}
  onPress={() => {
    Haptics.selectionAsync();
    setIsExpanded(!isExpanded);
  }}
>
```

When tapped, the action buttons (`Present`, `Absent`, `Cancelled`) abruptly teleport into the DOM. Furthermore, the action buttons only have a flat `activeOpacity={0.7}` without physical press depth (`transform: scale(0.97)`), making attendance recording feel hollow.

## Target

1. Smooth 200ms ease-out expand/collapse layout transition using `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` or spring height interpolation.
2. Physical press feedback (`transform: scale(0.97)` with 160ms ease-out release) on the three attendance action buttons:

```tsx
/* target */
const toggleExpand = () => {
  Haptics.selectionAsync();
  LayoutAnimation.configureNext({
    duration: 200,
    update: { type: LayoutAnimation.Types.easeOut },
    create: { type: LayoutAnimation.Types.easeOut, property: LayoutAnimation.Properties.opacity },
    delete: { type: LayoutAnimation.Types.easeOut, property: LayoutAnimation.Properties.opacity },
  });
  setIsExpanded(!isExpanded);
};
```

## Repo conventions to follow

- Color coding: Present `#3DDC84`, Absent `#D6336C`, Cancelled `#4A4D5C`.
- Tactile feedback: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.

## Steps

1. Enable experimental `UIManager.setLayoutAnimationEnabledExperimental(true)` on Android platform check.
2. Wrap card expand/collapse toggle in `LayoutAnimation.configureNext`.
3. Provide subtle press micro-scaling (`scale(0.97)`) on action button press-in / press-out.

## Boundaries

- Do NOT change the session schema or store methods (`markSession`).
- Keep collapse/expand duration strictly <= 220ms (never sluggish).

## Verification

- **Mechanical**: Run `node ./node_modules/typescript/bin/tsc --noEmit` and confirm exit code 0.
- **Feel check**:
  - Expanding a card gently unfolds the attendance pill buttons instead of a hard layout jump.
  - Tapping "Present" provides a crisp, tactile push-down feel matching Apple/Samsung Health.
- **Done when**: Class cards expand, collapse, and accept action presses with organic physical responsiveness.
