import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Gradients } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;

const features = [
  {
    id: 'shop',
    title: 'AI Fashion\nStore',
    description: 'Browse & try on curated items',
    icon: 'storefront-outline' as const,
    route: '/(tabs)/shop' as const,
    gradient: Gradients.storeCard,
  },
  {
    id: 'tryon',
    title: 'Virtual\nTry-On',
    description: 'See any outfit on yourself',
    icon: 'shirt-outline' as const,
    route: '/(tabs)/tryon' as const,
    gradient: Gradients.tryonCard,
  },
  {
    id: 'stylist',
    title: 'AI Fashion\nStylist',
    description: 'Your personal style advisor',
    icon: 'sparkles-outline' as const,
    route: '/(tabs)/style' as const,
    gradient: Gradients.stylistCard,
  },
  {
    id: 'pose',
    title: 'Pose\nStudio',
    description: 'Professional fashion poses',
    icon: 'camera-outline' as const,
    route: '/(tabs)/style' as const,
    gradient: Gradients.poseCard,
  },
];

const quickActions = [
  { id: 'upload', icon: 'camera' as const, label: 'Take\nSelfie', color: '#c9a96e' },
  { id: 'url', icon: 'link' as const, label: 'Paste\nURL', color: '#8b6cc7' },
  { id: 'history', icon: 'time' as const, label: 'Try-On\nHistory', color: '#e8618c' },
  { id: 'measure', icon: 'body' as const, label: 'My\nSize', color: '#6b9b7a' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.avatarButton}>
            <LinearGradient
              colors={['#c9a96e', '#e8c98a']}
              style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Pro banner for free users */}
        {!user?.is_pro && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <LinearGradient
                colors={['#1a1a2e', '#2d2d3f']}
                style={styles.proBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <View style={styles.proBannerContent}>
                  <Ionicons name="diamond" size={24} color="#e8c98a" />
                  <View style={styles.proBannerText}>
                    <Text style={styles.proBannerTitle}>Upgrade to Pro</Text>
                    <Text style={styles.proBannerDesc}>Unlimited try-ons, no watermarks</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#e8c98a" />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => {
                if (action.id === 'upload' || action.id === 'url') router.push('/(tabs)/tryon');
                else if (action.id === 'history') router.push('/(tabs)/profile');
                else if (action.id === 'measure') router.push('/(tabs)/profile');
              }}
              style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Feature Cards */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Features</Text>
        </Animated.View>

        <View style={styles.featureGrid}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.id}
              entering={FadeInDown.delay(450 + index * 80)}>
              <Pressable
                onPress={() => router.push(feature.route)}
                style={styles.featureCardWrapper}>
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <View style={styles.featureIconBg}>
                    <Ionicons name={feature.icon} size={24} color="#fff" />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                  <View style={styles.featureArrow}>
                    <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Pose Previews */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pose Studio</Text>
          <Pressable onPress={() => router.push('/(tabs)/style')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.poseScroll}>
          {[
            { name: 'Confident\nStanding', img: require('@/assets/images/poses/confident-standing.jpg') },
            { name: 'Executive\nWalk', img: require('@/assets/images/poses/executive-walk.jpg') },
            { name: 'Casual\nLean', img: require('@/assets/images/poses/casual-lean.jpg') },
            { name: 'Model\nTurn', img: require('@/assets/images/poses/model-turn.jpg') },
            { name: 'Street\nStroll', img: require('@/assets/images/poses/street-stroll.jpg') },
          ].map((pose, i) => (
            <Animated.View key={i} entering={FadeInRight.delay(750 + i * 80)}>
              <Pressable
                onPress={() => router.push('/(tabs)/style')}
                style={styles.poseCard}>
                <Image source={pose.img} style={styles.poseImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.poseOverlay}>
                  <Text style={styles.poseName}>{pose.name}</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: Spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.light.textSecondary, fontWeight: '500' },
  userName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.light.charcoal, marginTop: 2 },
  avatarButton: {},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '700', color: '#1a1a2e' },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  proBannerContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  proBannerText: {},
  proBannerTitle: { fontSize: FontSize.base, fontWeight: '700', color: '#e8c98a' },
  proBannerDesc: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.light.charcoal },
  seeAll: { fontSize: FontSize.sm, color: Colors.light.gold, fontWeight: '600' },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCardWrapper: { width: CARD_WIDTH },
  featureCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.15,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    justifyContent: 'space-between',
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: { fontSize: FontSize.md, fontWeight: '700', color: '#fff', lineHeight: 22 },
  featureDesc: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', lineHeight: 16 },
  featureArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  poseScroll: { paddingRight: Spacing.xl, gap: Spacing.md },
  poseCard: {
    width: 130,
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  poseImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  poseOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing['2xl'],
  },
  poseName: { fontSize: FontSize.xs, fontWeight: '600', color: '#fff', lineHeight: 14 },
});
