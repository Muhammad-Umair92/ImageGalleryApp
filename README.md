


# ImageGalleryApp

A production-level React Native Image Gallery application built for a Senior React Native Developer technical assessment.

---

## Setup & Run

```bash
# 1. Clone the repo
git clone https://github.com/Muhammad-Umair92/ImageGalleryApp.git
cd ImageGalleryApp

# 2. Install JS dependencies
npm install

# 3. iOS — install native pods
cd ios && pod install && cd ..

# 4. Start Metro bundler (with cache reset after any babel config change)
npx react-native start --reset-cache

# 5. Run on iOS simulator
npx react-native run-ios

# 6. Run on Android emulator/device
npx react-native run-android
```

---

## Folder Structure

```
src/
├── api/
│   ├── apollo/          # ApolloClient setup with InMemoryCache
│   └── queries/         # GraphQL query definitions (GET_PHOTOS, GET_PHOTO)
├── components/
│   ├── common/          # Input, Button, Loader, EmptyState, DeviceInfoBanner
│   └── gallery/         # ImageCard (memoized grid card)
├── hooks/               # useAppSelector, useAppDispatch (typed Redux hooks)
├── native/              # DeviceDetails.ts (JS bridge to Android native module)
├── navigation/          # RootNavigator (Native Stack, type-safe)
├── redux/
│   ├── slices/          # imagesSlice (images, likedImages, loading, error)
│   └── store.ts         # configureStore + RootState + AppDispatch types
├── screens/
│   ├── Register/        # Registration form screen
│   ├── Gallery/         # Photo grid screen
│   └── Details/         # Photo detail screen
├── types/               # Global TypeScript interfaces (Photo, RootStackParamList)
└── utils/               # validationSchemas.ts (Zod), photoUtils.ts
```

---

## Libraries & Why

| Library | Purpose | Why Chosen |
|---|---|---|
| `@reduxjs/toolkit` | Global state management | Eliminates boilerplate, includes Immer for safe mutations, auto-configures DevTools |
| `@apollo/client` | GraphQL data fetching | InMemoryCache normalizes data, cache-and-network gives instant + fresh UX |
| `react-hook-form` | Form state | Uncontrolled inputs = zero re-renders while typing (vs useState which re-renders every keystroke) |
| `zod` | Schema validation | Single schema gives both runtime validation AND TypeScript types via `z.infer<>` |
| `react-native-reanimated` | Animations | Runs on UI thread via worklets — 60fps even when JS thread is busy |
| `react-native-linear-gradient` | Gradient overlays | Native gradient rendering, no Canvas overhead |
| `@react-navigation/native-stack` | Navigation | Uses native UINavigationController/Fragment — fastest possible transitions |

---

## Architecture Decisions

### Why Redux Toolkit over Context API?
Context API re-renders every consumer when any value changes — no selector optimization. Redux with `useSelector` only re-renders components when their specific slice of state changes.

### Why Apollo over REST + fetch?
- **No over-fetching**: request only the fields you need
- **InMemoryCache**: same object fetched by two queries shares one cache entry
- **cache-and-network**: shows cached data instantly, refetches silently in background

### Why react-hook-form over useState?
`useState` re-renders the entire form on every keystroke. `react-hook-form` uses uncontrolled inputs (refs) — zero re-renders while typing, only re-renders on validation state changes.

---

## Performance Optimizations

| Optimization | Implementation | Why |
|---|---|---|
| `React.memo` on ImageCard | Wraps component in shallow prop comparison | When you like photo #5, only card #5 re-renders, not all 30 |
| `useCallback` on handlers | Stable function references across renders | Prevents React.memo from being bypassed by new function references |
| `getItemLayout` | Pre-calculates item positions for FlatList | Eliminates layout measurement on scroll — no thrashing |
| `windowSize={15}` | Keeps 15x viewport of items rendered | Reduces blank flashes from item unmount/remount |
| Module-level animation Set | Tracks which cards have already animated | Cards that scroll off and back skip stagger delay — no blank on return |
| `removeClippedSubviews` | Detaches off-screen views from render tree | Frees GPU memory on Android |
| Reanimated UI thread animations | `useSharedValue` + `useAnimatedStyle` | Animations never drop frames even when JS thread is busy |

---

## Animations

### 1. Heart Pop Animation (Like Button)
- Library: Reanimated v4
- Mechanism: `withSequence(withSpring(1.5), withSpring(1.0))` on `useSharedValue`
- Thread: UI thread — zero JS involvement during animation

### 2. Shared Element Transition (Gallery → Details)
- Library: Reanimated v4 `sharedTransitionTag`
- Mechanism: Thumbnail and hero image share tag `photo-image-{id}`, Reanimated morphs between bounding boxes
- Config: Details screen uses `animation: 'fade'` to prevent native push from conflicting

### 3. Staggered Card Entrance
- Mechanism: `withDelay(index * 70, withSpring(0))` for translateY, opacity fade-in
- Guard: module-level `Set<string>` prevents re-animation on FlatList item remount

### 4. Parallax Hero Image
- Mechanism: `useAnimatedScrollHandler` + `interpolate(scrollY, [0, H], [0, H * -0.4])`
- Effect: Image moves at 40% of scroll speed — creates depth illusion

### 5. Collapsing Gallery Header
- Mechanism: `interpolate(scrollY, [0, 80], [90, 52])` for height, font size, opacity
- All on UI thread via `useAnimatedScrollHandler`

---

## Native Module — DeviceDetails (Android)

**File**: `android/app/src/main/java/com/imagegalleryapp/DeviceDetailsModule.kt`

Returns device hardware information via the React Native bridge:
- `model` — device model (e.g. "Pixel 7")
- `manufacturer` — hardware manufacturer (e.g. "Google")
- `androidVersion` — OS version string (e.g. "14")
- `sdkVersion` — API level integer (e.g. 34)
- `brand` — brand name
- `device` — device codename

**How it works:**
```
JS: DeviceDetailsModule.getDeviceDetails()
    ↓ NativeModules.DeviceDetails (bridge call)
Android: DeviceDetailsModule.kt → @ReactMethod → WritableNativeMap
    ↓ Promise.resolve(map)
JS: .then(info => setState(info))
```

**Registration**: `DeviceDetailsPackage.kt` implements `ReactPackage`, registered in `MainApplication.kt` via `add(DeviceDetailsPackage())`.

---

## GraphQL API

**Endpoint**: `https://graphqlzero.almansi.me/api`

A public GraphQL API wrapping JSONPlaceholder fake data (5000 photos, 100 albums, 10 users). Used for demonstration purposes. In production, this would be your own GraphQL server backed by a real database (PostgreSQL, MongoDB, etc.).

**Query used**:
```graphql
query GetPhotos($options: PageQueryOptions) {
  photos(options: $options) {
    data {
      id title url thumbnailUrl
      album { id title user { name username } }
    }
  }
}
```
