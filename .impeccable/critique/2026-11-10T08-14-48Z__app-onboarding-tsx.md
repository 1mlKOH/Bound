---
target: app/onboarding.tsx
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/storage/emulated/0/bound/app/onboarding.tsx"
target_fingerprint: "sha256:2f8d7dfadaa7e28819ab86470e62d18699c1a9737283a8cff7bb714b0db77958"
target_path: /storage/emulated/0/bound/app/onboarding.tsx
timestamp: 2026-11-10T08-14-48Z
slug: app-onboarding-tsx
---
Method: design review only (detector not applicable, native platform)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Real-time simulation feedback is excellent, but no swipe gesture feedback on pages |
| 2 | Match System / Real World | 4 | College cutoff and bunk margin math speaks student language fluently |
| 3 | User Control and Freedom | 2 | Skipping or finishing from Settings replay wipes existing user database without warning |
| 4 | Consistency and Standards | 3 | Follows Samsung Health tokens, but contains hardcoded text-white in light mode |
| 5 | Error Prevention | 4 | Steppers prevent out-of-range targets (50%–95%), button double-tap protected |
| 6 | Recognition Rather Than Recall | 4 | Live dynamic semester impact calculation eliminates mental math |
| 7 | Flexibility and Efficiency of Use | 3 | Preset chips + steppers are great, but no gesture-based horizontal swiping |
| 8 | Aesthetic and Minimalist Design | 3 | Clean 28px squircles, but Screen 1 is dense on compact device heights |
| 9 | Error Recovery | 3 | Async completeOnboarding handles failures cleanly, but replay state has no cancel |
| 10 | Help and Documentation | 4 | Contextual hints (💡, 📌) clearly explain attendance dynamics |
| **Total** | | **33/40** | **Good** |

### Design Specificity Verdict

**LLM assessment**: Highly authored for Bound. This is not an interchangeable SaaS or fintech onboarding template; it immediately teaches the core product value ("Can miss 2 classes" vs "Attend next 1 class") through an interactive simulation, establishes the university attendance threshold, and offers an instant sample timetable test drive.

**Deterministic scan**: not applicable (native platform)

**Visual overlays**: not applicable (native platform)

### Overall Impression

The onboarding flow delivers an instant "aha!" moment on Screen 1 through live simulation rather than static bullet points. However, two critical defects hold it back from benchmark quality: replaying the tour from Settings will catastrophically overwrite existing user data on "Skip", and a hardcoded white text class breaks legibility in Light Theme on Screen 2. Adding horizontal swipe navigation and review-mode safety will elevate it from good to impeccable.

### What's Working

1. **Interactive Simulation Hero (Screen 1)**: The interactive toggle between "78.4% Safe" and "74.8% Below Target" with live buffer calculation ("Can miss 2" → "Attend next 1") communicates the entire reason Bound exists in under 5 seconds.
2. **Tabular Typography & Squircles**: Continuous 28px card corners, bold tabular numerals, and high-contrast status badges firmly match the app's Samsung Health-inspired design system.
3. **Dual Pathway Selection (Screen 3)**: Allowing users to choose between an immediate preloaded university timetable and a blank canvas eliminates the "empty room" dread without forcing sample data on users who want to start clean.

### Priority Issues

- **[P1] Tour Replay in Settings Destructively Wipes Existing User Data**:
  - *Why it matters*: When an existing user opens "Review Welcome Tour" from Settings and taps "Skip" or "Enter Bound", `completeOnboarding` executes `DELETE FROM sessions; DELETE FROM subjects;` or resets their courses to demo data. This causes irreversible data loss for active students.
  - *Fix*: Detect if onboarding is in review mode (`settings.hasOnboarded === true`). In review mode, show a "Close" (✕) button instead of "Skip", and change the primary CTA to "Done" / "Save Preferences", updating only `globalTargetPct` and notification settings without modifying sessions or subjects.
  - *Suggested command*: `/impeccable harden app/onboarding.tsx`

- **[P1] Contrast Violation in Light Theme on Screen 2**:
  - *Why it matters*: Line 791 uses `text-white dark:text-white` inside the impact callout card (`rgba(0, 0, 0, 0.03)` background in light mode). In Light Theme, this renders white text on a near-white background (contrast ratio < 1.2:1), making the target percentage invisible to users.
  - *Fix*: Replace `text-white dark:text-white` with `{ color: colors.text }` or `text-neutral-900 dark:text-white`.
  - *Suggested command*: `/impeccable polish app/onboarding.tsx`

- **[P2] Missing Horizontal Swipe Gesture on Onboarding Carousel**:
  - *Why it matters*: Mobile users reflexively swipe sideways on multi-screen carousels. Because the screens are positioned with programmatic `Animated.View` `translateX`, swipe gestures are completely ignored, creating a jarring, unresponsive feel until the user hunts for the bottom button.
  - *Fix*: Wire horizontal pan gestures or wrap in an Expo/RN horizontal `ScrollView` with `pagingEnabled={true}` and `onMomentumScrollEnd` synchronized with the dot indicators.
  - *Suggested command*: `/impeccable animate app/onboarding.tsx`

- **[P2] Vertical Overcrowding on Compact Screen Viewports**:
  - *Why it matters*: On smaller phone screens (under 6 inches or with larger system display scaling), Screen 1's combination of category badge, title, subtitle, simulated card, helper text, and bottom sticky button overflows the viewport, pushing the interactive "Simulate" button below the fold.
  - *Fix*: Tighten vertical margins (`mb-4` to `mb-2`), make the subject simulation card slightly more compact, and optimize padding so the interactive card is fully visible without scrolling on standard screens.
  - *Suggested command*: `/impeccable layout app/onboarding.tsx`

### Persona Red Flags

- **Riley (Stress Tester / Active Student)**: Has 4 weeks of meticulously tracked attendance in the app. Decides to inspect the welcome tour from Settings. Taps "Skip" to leave. Returns to Home to discover all their subjects and attendance records wiped clean and replaced with demo data. High severity churn risk.
- **Jordan (First-Timer in Light Theme)**: Launches Bound for the first time outdoors in bright daylight. Reaches Screen 2 to set their cutoff. The text reading "At 75%..." has an invisible target number due to white-on-white text styling, causing confusion about what the card is calculating.
- **Casey (Distracted Mobile User)**: Using the app one-handed on the subway. Tries to swipe across Screen 1 to see the next screen. The carousel does not move. Assumes the app is frozen before noticing the button at the bottom.

### Minor Observations

- The bottom button text "Configuring..." during async setup is a bit robotic; "Preparing your semester..." or "Setting up Bound..." feels warmer and more personal.
- On Screen 2, the 3-dot progress indicators at the top are not tappable jump targets; making them tap targets allows users to navigate back and forth quickly.
- When `simulatedMissed` is toggled on Screen 1, the progress bar animation duration (350ms) is slightly sluggish; a 200ms spring with `Haptics.impactAsync` makes the transition feel snappier.

### Questions to Consider

- What if Screen 1 allowed tapping the "Present" and "Absent" pills directly on the mock ClassCard, rather than a separate "Simulate Missing Today's Class" button below it?
- Could Screen 2 allow students to select their college/university from a quick template (e.g. "VTU / AKTU 75%", "Anna Univ 80%") to auto-set the cutoff?
- In review mode from Settings, should Screen 3 be omitted entirely, since timetable and notifications are already configured?
