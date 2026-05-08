import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

const EmptyState = ({
  title = 'No Photos Found',
  message = 'There are no photos to display right now.',
}: EmptyStateProps) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>🖼️</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState;
