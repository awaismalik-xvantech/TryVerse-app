import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { Logo } from '@/components/Logo';

const FEATURES = [
  { icon: 'shirt-outline' as const, label: 'Virtual Try-On' },
  { icon: 'sparkles-outline' as const, label: 'AI Styling' },
  { icon: 'shield-checkmark-outline' as const, label: 'Privacy First' },
  { icon: 'diamond-outline' as const, label: 'Quality Results' },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.charcoal} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient
            colors={[Colors.light.gold, Colors.light.goldLight]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Logo size="lg" />
            <Text style={styles.slogan}>Try It Before You Buy It</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150)} style={styles.descriptionCard}>
          <Text style={styles.description}>
            TryVerse is an AI-powered virtual try-on platform. See how clothes look on you before you
            buy. Your photos are processed securely and never stored on our servers.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={feature.label}
                entering={FadeInDown.delay(250 + index * 50)}
                style={styles.featureCard}>
                <View style={styles.featureIconBg}>
                  <Ionicons name={feature.icon} size={24} color={Colors.light.gold} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450)} style={styles.footer}>
          <Ionicons name="heart" size={18} color={Colors.light.gold} />
          <Text style={styles.footerText}>Made with love</Text>
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  slogan: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  versionBadge: {
    backgroundColor: Colors.light.charcoal + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  versionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.light.charcoal,
  },
  descriptionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresSection: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  featureIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.light.charcoal,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
  },
});
