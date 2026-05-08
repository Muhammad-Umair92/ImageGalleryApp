import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

// ─── Props ────────────────────────────────────────────────────────────────────
// We extend TextInputProps so this component accepts ALL native TextInput props
// (keyboardType, secureTextEntry, autoCapitalize, etc.) plus our custom ones.
// This is a common senior pattern — never re-define props that already exist.
interface InputProps extends TextInputProps {
  label: string;
  error?: string; // Optional — only shown when validation fails
  variant?: 'light' | 'dark';
}

// React.forwardRef lets react-hook-form attach its internal ref to this input.
// Without forwardRef, RHF can't register the input and the form won't work.
// This is why reusable inputs MUST use forwardRef when used with RHF.
const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, variant = 'light', ...rest }, ref) => {
    const isDark = variant === 'dark';

    return (
      <View style={styles.container}>
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            isDark && styles.inputDark,
            // Dynamically add error border when validation fails
            error ? styles.inputError : null,
          ]}
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          autoCapitalize="none"
          {...rest} // Spread all TextInputProps (keyboardType, secureTextEntry, etc.)
        />
        {/* Only render error text when there's an error — avoids empty space */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  labelDark: {
    color: '#d1d5db',
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  inputDark: {
    borderColor: '#374151',
    color: '#f9fafb',
    backgroundColor: '#111827',
  },
  inputError: {
    borderColor: '#ef4444', // Red border on validation error
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});

export default Input;
