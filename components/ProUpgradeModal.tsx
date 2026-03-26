import { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions, ActivityIndicator, Linking, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiFetch } from '@/lib/api';

interface ProUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  variant?: 'full' | 'compact';
}

const FEATURES = [
  { label: 'Unlimited AI generations' },
  { label: 'No watermarks on images' },
  { label: 'Priority AI processing' },
];

export function ProUpgradeModal({ visible, onClose, variant = 'full' }: ProUpgradeModalProps) {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const modalWidth = Math.min(width - Spacing.xl * 2, 400);

  if (!visible) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/subscription/create-checkout', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          onClose();
          await Linking.openURL(data.checkout_url);
          return;
        }
      }
      const err = await res.json().catch(() => null);
      Alert.alert('Error', err?.detail || 'Could not start checkout. Please try again.');
    } catch {
      Alert.alert('Error', 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.container, { width: modalWidth }, variant === 'compact' && styles.containerCompact]} onPress={(e) => e.stopPropagation()}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={Colors.light.textMuted} />
          </Pressable>

          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Ionicons name="sparkles" size={variant === 'compact' ? 24 : 32} color="#fff" />
          </LinearGradient>

          <Text style={[styles.title, variant === 'compact' && styles.titleCompact]}>
            {variant === 'compact' ? "You've used your free credits" : 'Unlock Unlimited Creativity'}
          </Text>
          <Text style={styles.subtitle}>Upgrade to TryVerse Pro for unlimited access</Text>

          <LinearGradient
            colors={['#1a1a2e', '#2d2d3f']}
            style={styles.proCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <View style={styles.proCardHeader}>
              <Text style={styles.proCardName}>TryVerse Pro</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceAmount}>$10</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
            </View>

            {FEATURES.map((feature) => (
              <View key={feature.label} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.light.gold} />
                <Text style={styles.featureText}>{feature.label}</Text>
              </View>
            ))}
          </LinearGradient>

          <Pressable style={styles.ctaButton} onPress={handleUpgrade} disabled={loading}>
            <LinearGradient
              colors={['#c9a96e', '#e8c98a']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {loading ? (
                <>
                  <ActivityIndicator color="#1a1a2e" size="small" />
                  <Text style={styles.ctaText}>Redirecting...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.ctaText}>Upgrade to Pro</Text>
                  <Ionicons name="arrow-forward" size={18} color="#1a1a2e" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onClose} style={styles.laterButton}>
            <Text style={styles.laterText}>Maybe Later</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  containerCompact: {
    padding: Spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.light.charcoal,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: FontSize.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  proCard: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  proCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  proCardName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.light.goldLight,
  },
  pricePeriod: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  ctaButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  ctaText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  laterButton: {
    marginTop: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  laterText: {
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
  },
});
