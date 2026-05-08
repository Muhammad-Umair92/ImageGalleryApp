module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Zod v4 uses `export * as namespace` syntax which Metro doesn't
    // understand natively. This plugin transforms it to CommonJS-compatible
    // output that Metro's bundler can process.
    '@babel/plugin-transform-export-namespace-from',
    // Must be LAST — Reanimated plugin transforms worklet functions
    // so they can run on the UI thread (native side), not JS thread
    'react-native-reanimated/plugin',
  ],
};
