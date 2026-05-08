import { NativeModules } from 'react-native';

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
// This module is Android-only — the navigation icon is hidden on iOS so this
// will never be called on a non-Android device.
const { DeviceDetails } = NativeModules;

const DeviceDetailsModule = {
  // Directly invokes the native Android bridge method.
  // Returns a Promise that resolves with the device hardware/software info.
  getDeviceDetails: (): Promise<DeviceInfo> => DeviceDetails.getDeviceDetails(),
};

export default DeviceDetailsModule;
