import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceDetailsModule, { DeviceInfo } from '../../native/DeviceDetails';

/**
 * DeviceInfoBanner displays native device info fetched via the native bridge.
 * This component demonstrates the Native Module working end-to-end.
 *
 * Flow:
 * JS (useEffect) → NativeModules.DeviceDetails.getDeviceDetails() →
 * Android Bridge → DeviceDetailsModule.kt → WritableNativeMap → JS Promise → setState
 */
const DeviceInfoBanner = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    DeviceDetailsModule.getDeviceDetails()
      .then(info => setDeviceInfo(info))
      .catch(err => setError(err.message ?? 'Failed to load device info'));
  }, []);

  if (error) return null; // Silently hide on error

  if (!deviceInfo) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.label}>📱 Device</Text>
      <Text style={styles.value}>
        {deviceInfo.manufacturer} {deviceInfo.model}
      </Text>
      <Text style={styles.dot}>·</Text>
      <Text style={styles.value}>
        Android {deviceInfo.androidVersion}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  value: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
  },
  dot: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
});

export default DeviceInfoBanner;
