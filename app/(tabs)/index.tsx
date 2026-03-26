import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Gradients, TAB_BAR_SPACER } from '@/constants/theme';
import { Logo } from '@/components/Logo';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { useAuth } from '@/lib/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const features = [
  {
    id: 'shop',
    title: 'AI Fashion\nStore',
    description: 'Browse & try on curated items',
    icon: 'storefront-outline' as const,
    route: '/(tabs)/shop' as const,
    gradient: Gradients.storeCard,
    bgImage: require('@/assets/images/poses/coffee-shop.jpg'),
  },
  {
    id: 'tryon',
    title: 'Virtual\nTry-On',
    description: 'See any outfit on yourself',
    icon: 'shirt-outline' as const,
    route: '/(tabs)/tryon' as const,
    gradient: Gradients.tryonCard,
    bgImage: require('@/assets/images/poses/confident-standing.jpg'),
  },
  {
    id: 'stylist',
    title: 'AI Fashion\nStylist',
    description: 'Your personal style advisor',
    icon: 'sparkles-outline' as const,
    route: '/(tabs)/style' as const,
    gradient: Gradients.stylistCard,
    bgImage: require('@/assets/images/poses/business-portrait.jpg'),
  },
  {
    id: 'pose',
    title: 'Pose\nStudio',
    description: 'Professional fashion poses',
    icon: 'camera-outline' as const,
    route: '/(tabs)/style' as const,
    gradient: Gradients.poseCard,
    bgImage: require('@/assets/images/poses/model-turn.jpg'),
  },
];

const quickActions = [
  { id: 'upload', icon: 'camera' as const, label: 'Take\nSelfie', color: '#c9a96e' },
  { id: 'url', icon: 'link' as const, label: 'Paste\nURL', color: '#8b6cc7' },
  { id: 'stylist', icon: 'sparkles' as const, label: 'AI\nStylist', color: '#e8618c' },
  { id: 'measure', icon: 'body' as const, label: 'My\nSize', color: '#6b9b7a' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;
  const [showProPopup, setShowProPopup] = useState(false);

  useEffect(() => {
    if (user && !user.is_pro) {
      const timer = setTimeout(() => setShowProPopup(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

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
        {/* Header with logo */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Logo size="sm" />
            <Text style={styles.greeting} numberOfLines={1}>{getGreeting()}, <Text style={styles.userName}>{firstName}</Text></Text>
            <Text style={styles.welcomeSub} numberOfLines={1}>Ready to try something new today?</Text>
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

        {/* Hero Banner with slogan */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <ImageBackground
            source={require('@/assets/images/poses/sunlight-portrait.jpg')}
            style={styles.heroBanner}
            imageStyle={styles.heroBannerImage}>
            <LinearGradient
              colors={['rgba(26,26,46,0.75)', 'rgba(201,169,110,0.6)']}
              style={styles.heroOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Logo size="md" light />
              <Text style={styles.heroSlogan}>Try It Before You Buy It</Text>
              <Text style={styles.heroSub}>AI-powered virtual try-on for every outfit</Text>
              <View style={styles.heroPrivacy}>
                <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroPrivacyText}>Your photos are never saved</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>

        {/* Pro/Free banner */}
        {user?.is_pro ? (
          <Animated.View entering={FadeInDown.delay(200)}>
            <LinearGradient
              colors={['#1a1a2e', '#2d2d3f']}
              style={styles.proBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <View style={styles.proBannerContent}>
                <View style={styles.proMemberIconBg}>
                  <Ionicons name="trophy" size={20} color="#e8c98a" />
                </View>
                <View style={styles.proBannerText}>
                  <Text style={styles.proBannerTitle}>You're a Pro Member</Text>
                  <Text style={styles.proBannerDesc}>Unlimited generations · No watermarks</Text>
                </View>
              </View>
              <View style={styles.proBadges}>
                <View style={styles.proBadgePill}>
                  <Ionicons name="infinite" size={12} color="#e8c98a" />
                  <Text style={styles.proBadgePillText}>Unlimited</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Pressable onPress={() => setShowProPopup(true)}>
              <LinearGradient
                colors={['#1a1a2e', '#2d2d3f']}
                style={styles.proBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <View style={styles.proBannerContent}>
                  <Logo size="sm" light showText={false} />
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
                else if (action.id === 'stylist') router.push('/(tabs)/style');
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
                style={[styles.featureCardWrapper, { width: CARD_WIDTH }]}>
                <ImageBackground
                  source={feature.bgImage}
                  style={[styles.featureCard, { width: CARD_WIDTH, height: CARD_WIDTH * 1.15 }]}
                  imageStyle={styles.featureCardBgImage}>
                  <LinearGradient
                    colors={[feature.gradient[0] + 'DD', feature.gradient[1] + 'EE']}
                    style={styles.featureCardOverlay}
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
                </ImageBackground>
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

        <View style={{ height: TAB_BAR_SPACER }} />
      </ScrollView>
      <ProUpgradeModal visible={showProPopup} onClose={() => setShowProPopup(false)} />
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
    marginBottom: Spacing.base,
  },
  headerLeft: { flex: 1, marginRight: Spacing.md },
  greeting: { fontSize: FontSize.sm, color: Colors.light.textSecondary, fontWeight: '500' },
  welcomeSub: {
    fontSize: FontSize.xs,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  userName: { fontWeight: '800', color: Colors.light.charcoal },
  avatarButton: {},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '700', color: '#1a1a2e' },
  heroBanner: {
    height: 160,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  heroBannerImage: {
    borderRadius: BorderRadius.xl,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  heroSlogan: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: Spacing.sm,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
  },
  heroPrivacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroPrivacyText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  proBannerContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  proBannerText: { flex: 1 },
  proBannerTitle: { fontSize: FontSize.base, fontWeight: '700', color: '#e8c98a' },
  proBannerDesc: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  proMemberIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(232,201,138,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proBadges: { flexDirection: 'row', gap: 4, marginLeft: Spacing.sm },
  proBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(232,201,138,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgePillText: { fontSize: 10, fontWeight: '600', color: '#e8c98a' },
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
  featureCardWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featureCard: {
  },
  featureCardBgImage: {
    borderRadius: BorderRadius.xl,
  },
  featureCardOverlay: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    justifyContent: 'space-between',
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: { fontSize: FontSize.md, fontWeight: '700', color: '#fff', lineHeight: 22 },
  featureDesc: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', lineHeight: 16 },
  featureArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
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
