# Singularity Learn — React Native home screen

Developer handoff, 19 October 2026. This is an importable TypeScript screen package, not a compiled APK or a standalone native project.

## Design basis

The user authorized building from the available project screens. `references/landing Page.png` is the visual reference: blue header, branding, search, introductory copy, purple English feature, course cards, and company footer. The prior chat's approved mockup and detailed response were not retrievable. This implementation therefore does not claim an exact match to that unavailable design.

Adaptations: accessible dark blue actions; responsive course grid instead of clipped cards; account personalization; continue-learning cards; help and optional bottom navigation. Course artwork unavailable as separate assets is represented by a category panel rather than cropped from screenshots. System typography requires no font installation. The English promotion uses native text and colors, with no invented illustration.

## Dependencies and integration

Required host packages: React, React Native, and `react-native-safe-area-context`. Version ranges in package.json describe the intended host API baseline, not a certification across every version. Use the versions supported by your existing app; do not upgrade the host solely to install this screen.

1. Copy `src/` and `assets/` together into a folder such as `features/singularity-home/`. Keep the relative directory structure because Metro resolves local image assets statically.
2. In an Expo app, run `npx expo install react-native-safe-area-context`. In a bare React Native app, install the compatible safe-area-context version and run `npx pod-install` on macOS for iOS.
3. Wrap the application root in `SafeAreaProvider` once. Import `HomeScreen` and its exported types from the copied `src/index.ts`.
4. Pass authenticated learner data, catalog data, saved IDs, and action callbacks. Mount the screen in a full-height container. Hide the navigator's own header for this screen. If your navigator owns bottom navigation, set `showBottomNavigation={false}` and ensure safe-area ownership does not add duplicate bottom padding.
5. Use `example/App.tsx` in a React Native host to review guest/registered/enrolled states. Its state selector and alert callbacks are demonstration tools. Import paths assume the example stays alongside `src/` and `assets/`; adjust imports if copying its contents into the host root.

```tsx
import { HomeScreen } from './features/singularity-home/src';
import { mockCourses, mockLearners } from './features/singularity-home/src/data/mockData';

// Inside your existing SafeAreaProvider:
<HomeScreen
  learner={mockLearners.enrolled}
  courses={mockCourses}
  savedCourseIds={savedIds}
  onToggleSaved={toggleSavedCourse}
  onAction={handleHomeAction}
  showBottomNavigation={false}
/>
```

`savedIds`, `toggleSavedCourse`, and `handleHomeAction` belong to the host. The example includes working in-memory versions. Persist saved courses in the app's storage/backend and decide whether guests may save locally.

## State and navigation contract

| State | Home behavior |
| --- | --- |
| Guest | Introductory message, registration and sign-in actions; My learning requests sign-in |
| Registered | Personalized welcome and course discovery; no invented progress |
| Enrolled | Personalized welcome, one progress card per matching enrollment, next lesson and resume/review action |

Enrollment IDs absent from the catalog are omitted. An empty enrollment list displays a clear fallback. Completion is bounded to the course lesson count; completed courses offer review. The backend must provide finite non-negative integer lesson counts and completed counts, unique course IDs and enrollment IDs, and authorized catalog/enrollment data. The screen does not enforce enrollment access or payment authorization.

`HomeAction` is a discriminated union. Route `course` to course details and `resume` to the authorized lesson/review destination using `courseId`. Route `signIn`, `signUp`, `notifications`, `help`, `allCourses`, `profile`, and `myLearning` to host screens. All visible actions invoke a callback; no route names or navigation library are assumed. The demo displays action payloads instead of implementing those destination screens.

Search filters the supplied catalog locally by title, category, and description. For a remote/paginated catalog, move search state and fetching into your host integration. Optional `onRefresh`, `refreshing`, `loading`, and `error` props support refresh, loading, retry and empty states. On retry the host clears `error` and updates the data. Mock lesson counts, durations, names, progress, and copy are illustrative and must be replaced before production.

## Responsive and accessibility behavior

Layout uses current window dimensions: one column below 650 logical pixels, two from 650, three from 1000, maximum content width 1120. Larger system text (font scale over 1.3) forces one column. Cards and controls grow vertically; text scaling is enabled. Buttons have a 48-point minimum height, state announcements, and text labels; progress exposes its numeric value. Safe-area insets handle device edges. Search scrolls with content so a large header does not consume the full viewport in landscape.

The UI is English. The source reference's language-related marketing copy does not constitute implemented localization. Add your app's translation/RTL layer and verified course languages before advertising specific language availability.

## Assets

All branding files were copied unchanged from project sources, including the mobile white logo used by the header. `assets/cdl-banner.jpg` is copied from the project's previously generated CDL course asset set. Other originals are included for the team's choice; filenames with spaces are intentional. `ASSET_MANIFEST.json` records source path, byte size, and SHA-256. No external asset URLs, API keys, fonts, or paid icon packages are required. Confirm rights to supplied brand/course assets in your normal release process.

## Validation and release checks

See `VERIFICATION.md` for checks actually run. To type-check in the package: install dependencies with your package manager, then run `npm run typecheck`. For host verification, also run the host TypeScript check and build both native targets.

- Review widths 320, 375, 430, 768, and 1024; portrait, landscape and split screen.
- Review font scales 1.0, 1.5, and 2.0; VoiceOver/TalkBack; keyboard visibility; notches and Android navigation insets.
- Exercise all three states, no enrollment/catalog matches, 0%/100% progress, search/no results/clear, save/unsave, refresh, loading, error and retry.
- Verify every action reaches the correct destination and that account, saved-course and enrollment state persists correctly after restart/sign-out.
- Verify approved copy, imagery, actual course metadata, localization, auth and lesson authorization in the host.

Official integration references: https://docs.expo.dev/versions/latest/sdk/safe-area-context/ and https://reactnative.dev/docs/usewindowdimensions .
