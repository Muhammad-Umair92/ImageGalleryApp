import { NativeModules, Platform } from 'react-native';

// TypeScript interface for what the native module returns.
// This must match the WritableNativeMap keys in DeviceDetailsModule.kt exactly.
export interface DeviceInfo {
  model: string;
  manufacturer: string;
  androidVersion: string;
  sdkVersion: number;
  brand: string;
  device: string;
}

// NativeModules is React Native's global registry of all registered native modules.
// 'DeviceDetails' maps to getName() → "DeviceDetails" in DeviceDetailsModule.kt.
// On iOS (where we haven't implemented it), we return a mock so the app doesn't crash.
const { DeviceDetails } = NativeModules;

const DeviceDetailsModule = {
  getDeviceDetails: (): Promise<DeviceInfo> => {
    if (Platform.OS === 'android') {
      // Call the real native module on Android
      return DeviceDetails.getDeviceDetails();
    }
    // iOS fallback — returns mock data since the module is Android-only
    return Promise.resolve({
      model: 'iPhone (iOS)',
      manufacturer: 'Apple',
      androidVersion: 'N/A',
      sdkVersion: 0,
      brand: 'Apple',
      device: 'iPhone',
    });
  },
};

export default DeviceDetailsModule;
