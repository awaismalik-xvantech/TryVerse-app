import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  Pressable,
  Image,
  ImageSourcePropType,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { Logo } from '@/components/Logo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GRADIENT_OPACITY = 0.55;

const slides: {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  icon: 'shirt' | 'sparkles' | 'storefront' | 'camera';
  gradient: readonly [string, string];
}[] = [
  {
    id: '1',
    title: 'Virtual Try-On',
    description: 'Upload a selfie and see how any outfit looks on you — before you buy',
    image: require('@/assets/images/poses/confident-standing.jpg'),
    icon: 'shirt',
    gradient: [`rgba(201,169,110,${GRADIENT_OPACITY})`, `rgba(176,141,79,${GRADIENT_OPACITY})`] as const,
  },
  {
    id: '2',
    title: 'AI Fashion Stylist',
    description: 'Get personalized style advice, trip packing, and outfit ideas — all in one AI assistant',
    image: require('@/assets/images/poses/business-portrait.jpg'),
    icon: 'sparkles',
    gradient: [`rgba(124,58,237,${GRADIENT_OPACITY})`, `rgba(109,84,163,${GRADIENT_OPACITY})`] as const,
  },
  {
    id: '3',
    title: 'AI Fashion Store',
    description: 'Browse curated items from top brands and virtually try them on your photo instantly',
    image: require('@/assets/images/poses/executive-walk.jpg'),
    icon: 'storefront',
    gradient: [`rgba(232,97,140,${GRADIENT_OPACITY})`, `rgba(192,80,122,${GRADIENT_OPACITY})`] as const,
  },
  {
    id: '4',
    title: 'Pose Studio',
    description: 'Transform your selfies into 20+ professional fashion poses with one tap',
    image: require('@/assets/images/poses/model-turn.jpg'),
    icon: 'camera',
    gradient: [`rgba(13,122,82,${GRADIENT_OPACITY})`, `rgba(22,163,74,${GRADIENT_OPACITY})`] as const,
  },
];

const BUTTON_COLORS: readonly [string, string][] = [
  ['#c9a96e', '#b08d4f'],
  ['#7c3aed', '#6e54a3'],
  ['#e8618c', '#c0507a'],
  ['#0d7a52', '#16a34a'],
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={[styles.slide, { width }]}>
      {/* Logo area at very top */}
      <View style={styles.logoArea}>
        <Logo size="lg" light />
        <Text style={styles.slogan}>Try It Before You Buy It</Text>
      </View>

      {/* Full background image with semi-transparent gradient overlay */}
      <View style={[styles.imageArea, { minHeight: height * 0.45 }]}>
        <Image source={item.image} style={styles.bgImage} />
        <LinearGradient
          colors={item.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        {/* Feature icon in glass-morphism circle */}
        <View style={styles.badgeContainer}>
          <View style={styles.glassBadge}>
            <Ionicons name={item.icon} size={32} color="#fff" />
          </View>
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>

      {/* Privacy note */}
      <Text style={styles.privacyNote}>Your photos are never saved</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <Pressable onPress={handleSkip} style={[styles.skipButton, { top: insets.top + 12 }]}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Bottom area */}
      <View style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex
                  ? [styles.dotActive, { backgroundColor: BUTTON_COLORS[currentIndex][0] }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Pressable onPress={handleNext}>
          <LinearGradient
            colors={BUTTON_COLORS[currentIndex]}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Text style={styles.nextBtnText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentIndex === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'}
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.charcoal },
  skipButton: {
    position: 'absolute',
    right: Spacing.xl,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { fontSize: FontSize.sm, color: '#fff', fontWeight: '600' },
  slide: { flex: 1 },
  logoArea: {
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  slogan: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  imageArea: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  badgeContainer: {
    position: 'absolute',
    top: Spacing['2xl'],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glassBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    position: 'absolute',
    bottom: 72,
    left: Spacing.xl,
    right: Spacing.xl,
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  slideDescription: {
    position: 'absolute',
    bottom: 32,
    left: Spacing.xl,
    right: Spacing.xl,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 22,
  },
  privacyNote: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  bottomArea: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 32 },
  dotInactive: { width: 8, backgroundColor: '#d1d5db' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  nextBtnText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
