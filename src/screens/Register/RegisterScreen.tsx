import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { RootStackParamList } from '../../types';
import { registerSchema, RegisterFormValues } from '../../utils/validationSchemas';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = (_values: RegisterFormValues) => {
    navigation.navigate('Gallery');
  };

  return (
    // edges={['bottom']} — only add bottom safe area.
    // Top safe area is handled by the gradient which extends under the status bar.
    // Setting backgroundColor to match gradient start so status bar blends in.
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>

          {/* ─── Full Gradient Hero ───────────────────────────────────── */}
          <LinearGradient
            colors={['#3730a3', '#4f46e5', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}>

            {/* Camera icon made from Text — no extra library needed */}
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>📷</Text>
            </View>

            <Text style={styles.appName}>Image Gallery</Text>
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSubtitle}>
              Register to browse and curate{'\n'}your photo collection
            </Text>
          </LinearGradient>

          {/* ─── White Form Card ─────────────────────────────────────── */}
          <View style={styles.card}>

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
                  secureTextEntry
                  returnKeyType="done"
                />
              )}
            />

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('Gallery')}>
                Sign In
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3730a3', // Match gradient start — status bar blends in
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    minHeight: SCREEN_HEIGHT * 0.38,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 52,
    justifyContent: 'flex-end',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconEmoji: {
    fontSize: 30,
  },
  appName: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 10,
    lineHeight: 23,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    // Upward shadow onto gradient
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  footerLink: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '700',
  },
});

export default RegisterScreen;
