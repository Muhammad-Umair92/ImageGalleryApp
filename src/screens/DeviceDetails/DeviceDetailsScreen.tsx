import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types';
import DeviceDetailsModule, { DeviceInfo } from '../../native/DeviceDetails';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

const DeviceDetailsScreen = ({ navigation }: Props) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Call the native module bridge on mount
    DeviceDetailsModule.getDeviceDetails()
      .then(info => {
        setDeviceInfo(info);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message ?? 'Failed to retrieve device info');
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device Details</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Native Module explanation card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚙️</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Native Bridge Module</Text>
            <Text style={styles.infoDesc}>
              This data is fetched via a custom Android native module
              (DeviceDetailsModule.kt) using React Native's bridge.
              JS calls the native method via{' '}
              <Text style={styles.code}>NativeModules.DeviceDetails</Text>.
            </Text>
          </View>
        </View>

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loaderText}>Reading device hardware…</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Bridge Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {deviceInfo && !loading && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Hardware Information</Text>

            <InfoRow icon="📱" label="Device Model" value={deviceInfo.model} />
            <InfoRow icon="🏭" label="Manufacturer" value={deviceInfo.manufacturer} />
            <InfoRow icon="🏷️" label="Brand" value={deviceInfo.brand} />
            <InfoRow icon="🔧" label="Device Code" value={deviceInfo.device} />

            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Software Information</Text>

            <InfoRow
              icon="🤖"
              label="Android Version"
              value={`Android ${deviceInfo.androidVersion}`}
            />
            <InfoRow
              icon="🔢"
              label="API Level"
              value={`SDK ${deviceInfo.sdkVersion}`}
            />
          </View>
        )}

        {/* Bridge explanation */}
        <View style={styles.bridgeCard}>
          <Text style={styles.bridgeTitle}>How the Bridge Works</Text>
          <Text style={styles.bridgeStep}>
            <Text style={styles.bridgeStepNum}>1. </Text>
            JS calls{' '}
            <Text style={styles.code}>DeviceDetailsModule.getDeviceDetails()</Text>
          </Text>
          <Text style={styles.bridgeStep}>
            <Text style={styles.bridgeStepNum}>2. </Text>
            React Native serializes the call and sends it over the bridge
          </Text>
          <Text style={styles.bridgeStep}>
            <Text style={styles.bridgeStepNum}>3. </Text>
            Android executes{' '}
            <Text style={styles.code}>@ReactMethod getDeviceDetails()</Text> in Kotlin
          </Text>
          <Text style={styles.bridgeStep}>
            <Text style={styles.bridgeStepNum}>4. </Text>
            Kotlin builds a{' '}
            <Text style={styles.code}>WritableNativeMap</Text> and resolves the Promise
          </Text>
          <Text style={styles.bridgeStep}>
            <Text style={styles.bridgeStepNum}>5. </Text>
            JS receives the result as a plain object in{' '}
            <Text style={styles.code}>.then()</Text>
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

// Small presentational sub-component for each detail row
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <View style={styles.rowContent}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  headerSafeArea: { backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 22, color: '#ffffff' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  // Native module explanation
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#4f46e5',
  },
  infoIcon: { fontSize: 24 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#3730a3', marginBottom: 4 },
  infoDesc: { fontSize: 13, color: '#4338ca', lineHeight: 19 },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'rgba(79,70,229,0.1)',
    color: '#4f46e5',
    fontSize: 12,
  },
  // Loader
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loaderText: { fontSize: 14, color: '#6b7280' },
  // Error
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#dc2626', marginBottom: 6 },
  errorMessage: { fontSize: 13, color: '#ef4444' },
  // Details card
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '500', marginBottom: 2 },
  rowValue: { fontSize: 15, color: '#111827', fontWeight: '700' },
  // Bridge explanation
  bridgeCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bridgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  bridgeStep: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  bridgeStepNum: { color: '#818cf8', fontWeight: '700' },
});

export default DeviceDetailsScreen;
