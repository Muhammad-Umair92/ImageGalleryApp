import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoaderProps {
  backgroundColor?: string;
  spinnerColor?: string;
  label?: string;
}

const Loader = ({
  backgroundColor = '#ffffff',
  spinnerColor = '#4f46e5',
  label,
}: LoaderProps) => (
  <View style={[styles.container, { backgroundColor }]}>
    <ActivityIndicator size="large" color={spinnerColor} />
    {label ? <Text style={styles.label}>{label}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
});

export default Loader;
