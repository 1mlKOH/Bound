# 005 — Fluid, Cohesive Month and Week Transitions for CalendarCard

- **Status**: DONE
- **Commit**: 9784f92
- **Severity**: HIGH
- **Category**: Physicality, Cohesion & Interruptibility
- **Estimated scope**: 1 file (`src/components/CalendarCard.tsx`), ~70 lines modified

## Problem

When navigating between different months or weeks on the Statistics screen, the current motion creates four distinct feel-breaking flaws:

1. **Uncoordinated Header and Grid in Month View (`src/components/CalendarCard.tsx:377-407`)**:
   When tapping previous or next month, the header text (`{MONTH_NAMES[currentMonth]} {currentYear}`) abruptly teleports to the new string with zero transition, while the grid below slides with a spring. The top of the card is visually disconnected from the body.

   ```tsx
   /* src/components/CalendarCard.tsx:377-385 — current */
   <Text
     style={[styles.sfText, { color: colors.text }]}
     className="text-base font-bold tracking-wide"
   >
     {MONTH_NAMES[currentMonth]} {currentYear}
   </Text>
   ```

2. **Abrupt Stack Pop on 7 Daily Agenda Cards in Week View (`src/components/CalendarCard.tsx:502-587`)**:
   In Week View, the date range label and the 7-pill date strip animate horizontally (`weekFade` + `weekTranslateX`). However, the 7 `CollapsibleDayCard` agenda items beneath the divider have no transition at all. They instantly unmount and snap to the new week's dates, causing the bottom 70% of the card to jarringly flash while the top 30% slides.

   ```tsx
   /* src/components/CalendarCard.tsx:585-615 — current */
   {/* 7 Daily Agenda Cards — instantly snaps with no transition */}
   <View>
     {weekDates.map((dateStr) => { ... })}
   </View>
   ```

3. **Hard `setValue` Snap on Rapid Taps (Interruptibility failure) (`src/components/CalendarCard.tsx:192-252`)**:
   `triggerMonthTransition` and `triggerWeekTransition` forcibly reset `fade.setValue(0.68)` and `translateX.setValue(±14)`. When the user rapidly steps through months or weeks, this hard snap terminates running velocity and causes visual flickering/teleportation.

   ```tsx
   /* src/components/CalendarCard.tsx:192-196 — current */
   const triggerMonthTransition = (direction: 'left' | 'right') => {
     Haptics.selectionAsync();
     gridFade.setValue(0.68);
     gridTranslateX.setValue(direction === 'left' ? 14 : -14);
     ...
   ```

4. **Excessive Scale on Navigation Chevrons (`src/components/CalendarCard.tsx:101-116`)**:
   `TactileChevronButton` compresses the chevron icon to `scale: 0.92` with linear timing (`Animated.timing(scale, { toValue: 0.92, duration: 100 })`). For small 16px navigation icons, `0.92` creates noticeable optical squishing rather than a crisp tactile press. Target standard is subtle `0.96` with `140ms ease-out` on release.

## Target

1. **Synchronized Month Header & Grid Transition**:
   Both the month header label (`November 2026`) and the date grid animate in lockstep using shared `monthFade` and directional `monthTranslateX`. When stepping forward, the new month enters from `+16px` with opacity rising from `0` to `1` over `180ms cubic-bezier(0.23, 1, 0.32, 1)`.

2. **Unified Week View Transition (Header, Strip & Agenda Cards)**:
   The entire week body — week range label, 7-pill strip, and the 7 daily agenda cards — animates together inside a single `Animated.View` driven by `weekFade` and `weekTranslateX`. Changing weeks feels like sweeping a unified physical page rather than a fragmented layout split.

3. **Smooth Interruptibility Without Hard Snaps**:
   If a transition is triggered while an animation is already in flight, stop running animations smoothly using `Animated.spring` towards the new target with velocity preservation, avoiding abrupt `setValue(0.68)` teleports.

4. **Refined Tactile Press on Chevrons**:
   Pressing in scales to `0.96` over 80ms (`ease-out`); releasing springs back with `damping: 18, stiffness: 300, mass: 0.6`.

5. **Accessibility / Reduced Motion**:
   When reduced motion is enabled, set horizontal translation to `0` and use an instantaneous/100ms crossfade only.

## Repo Conventions to Follow

- Use React Native's built-in `Animated` API with `useNativeDriver: true` (established across `CalendarCard.tsx`, `SegmentedControl.tsx`, and `HeroAttendanceCard.tsx`).
- Easing for UI entry uses `Easing.bezier(0.23, 1, 0.32, 1)` (Emil Kowalski's recommended UI ease-out curve).
- Springs use `mass: 0.7`, `stiffness: 240`, `damping: 18` as the established fluid spring archetype in `src/components/CalendarCard.tsx:205-207`.

## Steps

1. **Coordinate Month Title with Grid in `renderMonthView` (`src/components/CalendarCard.tsx`)**:
   Wrap both the month title text and the month calendar grid in the animated container, or apply `gridFade` and `gridTranslateX` to the title view so title and dates transition in spatial unity:
   ```tsx
   {/* Month Header with Navigation */}
   <View className="flex-row items-center justify-between mb-4">
     <TactileChevronButton onPress={prevMonth}>
       <ChevronLeftIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
     </TactileChevronButton>
     <Animated.View
       style={{
         opacity: gridFade,
         transform: [{ translateX: gridTranslateX }],
       }}
     >
       <Text
         style={[styles.sfText, { color: colors.text }]}
         className="text-base font-bold tracking-wide"
       >
         {MONTH_NAMES[currentMonth]} {currentYear}
       </Text>
     </Animated.View>
     <TactileChevronButton onPress={nextMonth}>
       <ChevronRightIcon size={16} color={colors.textSecondary} strokeWidth={2.4} />
     </TactileChevronButton>
   </View>
   ```

2. **Wrap Agenda Cards into the Week Animation Container (`src/components/CalendarCard.tsx`)**:
   Move the 7 `CollapsibleDayCard` items inside the existing `Animated.View` (or a synchronized parent container) so the cards slide and fade harmoniously with the week header and date strip:
   ```tsx
   {/* Coordinated Week Body Transition */}
   <Animated.View
     style={{
       opacity: weekFade,
       transform: [{ translateX: weekTranslateX }],
     }}
   >
     {/* Weekday Date Strip */}
     <View className="flex-row mb-4">
       {weekDates.map((dateStr, idx) => ( ... ))}
     </View>

     {/* Subtle Divider */}
     <View className="h-[1px] bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.08)] mb-4" />

     {/* 7 Daily Agenda Cards */}
     <View>
       {weekDates.map((dateStr) => ( ... ))}
     </View>
   </Animated.View>
   ```

3. **Tune Transition Parameters & Retargeting in `triggerMonthTransition` and `triggerWeekTransition`**:
   Replace the abrupt `0.68` initial opacity with an entrance starting from `opacity: 0.35` and subtle `±18px` translation, driven by `Easing.bezier(0.23, 1, 0.32, 1)` over 200ms with spring damping `20` and stiffness `260`:
   ```tsx
   const triggerMonthTransition = (direction: 'left' | 'right') => {
     Haptics.selectionAsync();
     gridFade.stopAnimation();
     gridTranslateX.stopAnimation();
     gridFade.setValue(0.35);
     gridTranslateX.setValue(direction === 'left' ? 18 : -18);
     Animated.parallel([
       Animated.timing(gridFade, {
         toValue: 1,
         duration: 200,
         easing: Easing.bezier(0.23, 1, 0.32, 1),
         useNativeDriver: true,
       }),
       Animated.spring(gridTranslateX, {
         toValue: 0,
         damping: 20,
         stiffness: 260,
         mass: 0.65,
         useNativeDriver: true,
       }),
     ]).start();
   };
   ```

4. **Refine `TactileChevronButton` Scale and Curve (`src/components/CalendarCard.tsx:101-116`)**:
   Adjust `toValue` to `0.96` on press down, with an `80ms` ease-out entrance and a snappy `damping: 16, stiffness: 320` spring on release:
   ```tsx
   const onPressIn = () => {
     Animated.timing(scale, {
       toValue: 0.96,
       duration: 80,
       easing: Easing.out(Easing.cubic),
       useNativeDriver: true,
     }).start();
   };

   const onPressOut = () => {
     Animated.spring(scale, {
       toValue: 1,
       damping: 16,
       stiffness: 320,
       mass: 0.5,
       useNativeDriver: true,
     }).start();
   };
   ```

## Boundaries

- Do NOT touch `src/domain/attendance.ts` or database queries.
- Do NOT change date calculation logic (`getWeekDates`, `getMondayOfDate`, `cells`).
- Do NOT alter the visual token styling or colors (`#FF6B72`, `colors.card`, etc.).
- Do NOT introduce third-party libraries (keep pure React Native `Animated`).

## Verification

- **Mechanical**:
  - `npm test`: all 20 tests pass.
  - `node node_modules/typescript/bin/tsc --noEmit`: 0 type errors.
- **Feel check**:
  1. In Month View, tap `>` to advance month: month name ("November 2026" → "December 2026") and calendar grid slide together seamlessly in the same direction.
  2. In Week View, tap `>` to advance week: the week header, the 7-day pill strip, and the 7 agenda cards sweep across as one coherent physical surface without content blinking.
  3. Rapidly tap `>` five times: no visual teleportation, flashing, or glitching.
  4. Tap the chevron buttons: micro-feedback feels responsive and subtle (`scale: 0.96`) without distorting the icon glyph.
- **Done when**:
  Month and week navigation feels unified, fluid, and interruptible with zero layout snaps.
