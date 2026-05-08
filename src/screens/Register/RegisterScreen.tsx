import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../../types';
import { registerSchema, RegisterFormValues } from '../../utils/validationSchemas';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  // useForm is the core hook. It returns everything needed to manage the form.
  // zodResolver bridges react-hook-form and Zod:
  //   - On submit, it runs registerSchema.parse(values)
  //   - If Zod throws, it maps the errors to RHF's formState.errors
  const {
    control,      // Used by <Controller> to register each input
    handleSubmit, // Wraps your submit handler with validation logic
    formState: { errors, isSubmitting }, // errors: validation failures, isSubmitting: async flag
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
    // 'onSubmit' mode: only validates when user presses submit.
    // After first submit attempt, switches to validating on every change.
    // This is the best UX — don't yell at the user before they've tried.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // Called by handleSubmit ONLY if Zod validation passes.
  // values is fully typed as RegisterFormValues — TypeScript guarantees it.
  const onSubmit = (values: RegisterFormValues) => {
    // In a real app: API call to register user, store token in Redux, etc.
    // For now: navigate to Gallery on successful registration
    console.log('Registration successful:', values);
    navigation.navigate('Gallery');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*
       * KeyboardAvoidingView pushes content up when keyboard appears on iOS.
       * 'padding' behavior adds bottom padding equal to keyboard height.
       * On Android, the OS handles this via windowSoftInputMode in AndroidManifest.
       */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" // Allows tapping Submit while keyboard is open
          showsVerticalScrollIndicator={false}>

          {/* ─── Header ─────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Fill in your details to get started
            </Text>
          </View>

          {/* ─── Form Fields ─────────────────────────────────────────── */}
          <View style={styles.form}>
            {/*
             * <Controller> is the bridge between react-hook-form and a native input.
             * It passes onChange, onBlur, and value to the input via render prop.
             * This is needed because React Native inputs are not real DOM inputs —
             * RHF can't attach a ref directly without Controller.
             *
             * field.onChange: called when user types — updates RHF's internal store
             * field.onBlur:   called when input loses focus — triggers validation if mode allows
             * field.value:    the current value from RHF's store (for display)
             */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="john@example.com"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="10-digit number"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  maxLength={10}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                  secureTextEntry // Hides password characters
                  returnKeyType="done"
                />
              )}
            />
          </View>

          {/* ─── Submit ──────────────────────────────────────────────── */}
          {/*
           * handleSubmit wraps onSubmit:
           *   1. Calls zodResolver to validate all fields
           *   2. If valid → calls onSubmit(values)
           *   3. If invalid → populates formState.errors, component re-renders
           * isSubmitting is true during the async onSubmit call
           */}
          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          {/* Dev shortcut — in production this would check AsyncStorage for an auth token */}
          <Button
            title="Skip to Gallery (Dev)"
            variant="secondary"
            onPress={() => navigation.navigate('Gallery')}
            style={styles.skipButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink}>Sign In</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 6,
  },
  form: {
    marginBottom: 8,
  },
  skipButton: {
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});

export default RegisterScreen;
