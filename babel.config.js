module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Must be LAST — Reanimated plugin transforms worklet functions
    // so they can run on the UI thread (native side), not JS thread
    'react-native-reanimated/plugin',
  ],
};
