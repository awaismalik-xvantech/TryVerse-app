import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiPost } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    setIsLoading(true);
    const result = await apiPost('/api/auth/forgot-password', { email: email.trim() });
    setIsLoading(false);
    if (result.ok) {
      setSent(true);
    } else {
      Alert.alert('Error', result.error || 'Could not send reset email');
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Animated.View entering={FadeInDown} style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.light.gold} />
          </Animated.View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successDesc}>
            We've sent a password reset link to {email}
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(50)}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.charcoal} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.light.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.light.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable onPress={handleReset} disabled={isLoading} style={styles.resetButton}>
            <LinearGradient
              colors={['#c9a96e', '#e8c98a']}
              style={styles.resetButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {isLoading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  header: { marginBottom: Spacing['2xl'] },
  title: { fontSize: FontSize['2xl'], fontWeight: '800', color: Colors.light.charcoal },
  subtitle: { fontSize: FontSize.base, color: Colors.light.textSecondary, marginTop: Spacing.sm, lineHeight: 22 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    paddingHorizontal: Spacing.base,
    height: 54,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.light.text },
  resetButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.lg,
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  resetButtonGradient: { paddingVertical: Spacing.base, alignItems: 'center' },
  resetButtonText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal },
  successIcon: { marginBottom: Spacing.xl },
  successTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.light.charcoal, marginBottom: Spacing.sm },
  successDesc: { fontSize: FontSize.base, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 22 },
  backToLogin: { marginTop: Spacing['2xl'] },
  backToLoginText: { fontSize: FontSize.base, color: Colors.light.gold, fontWeight: '700' },
});
