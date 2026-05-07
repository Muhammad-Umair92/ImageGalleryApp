# ImageGalleryApp

A React Native mobile application that displays an image gallery, allows users to view image details, and includes a user registration flow. Built with TypeScript, Apollo GraphQL, Redux Toolkit, and React Navigation.

---

## Features

- Browse a scrollable image gallery
- View full image details
- User registration form with validation
- State management with Redux Toolkit
- GraphQL data fetching with Apollo Client
- Form validation with React Hook Form + Zod
- Navigation with React Navigation (Native Stack)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native 0.85 | Mobile framework |
| TypeScript | Type safety |
| Apollo Client | GraphQL data fetching |
| Redux Toolkit | Global state management |
| React Navigation | Screen navigation |
| React Hook Form | Form handling |
| Zod | Schema validation |
| React Native Reanimated | Animations |

---

## Prerequisites

Make sure the following are installed before running the project:

- **Node.js** >= 22.11.0
- **npm** or **Yarn**
- **React Native CLI** environment set up — follow the [official setup guide](https://reactnative.dev/docs/set-up-your-environment)
- **Xcode** (for iOS) — macOS only
- **Android Studio** (for Android)
- **CocoaPods** (for iOS) — install with `sudo gem install cocoapods`

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Muhammad-Umair92/ImageGalleryApp.git
cd ImageGalleryApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install iOS pods (macOS only)

```bash
bundle install
bundle exec pod install
```

---

## Running the App

### Start the Metro bundler

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

---

## Running Tests

```bash
npm test
```

---

## Linting

```bash
npm run lint
```

---

## Project Structure

```
ImageGalleryApp/
├── src/
│   ├── api/            # API configuration (Apollo Client setup)
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Shared components (buttons, inputs, etc.)
│   │   ├── forms/      # Form components
│   │   └── gallery/    # Gallery-specific components
│   ├── constants/      # App-wide constants
│   ├── hooks/          # Custom React hooks
│   ├── native/         # Native module integrations
│   ├── navigation/     # React Navigation stack configuration
│   ├── redux/          # Redux Toolkit store, slices, selectors
│   ├── screens/        # App screens
│   │   ├── Details/    # Image detail screen
│   │   ├── Gallery/    # Gallery listing screen
│   │   └── Register/   # User registration screen
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility/helper functions
├── android/            # Android native project
├── ios/                # iOS native project
├── __tests__/          # Test files
├── App.tsx             # Root component
└── index.js            # Entry point
```

---

## Troubleshooting

- If Metro doesn't start, try clearing the cache: `npm start -- --reset-cache`
- If iOS build fails, try `bundle exec pod install` again inside the `ios/` folder
- For Android build issues, ensure `ANDROID_HOME` is set correctly in your environment

For more help, visit the [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.
