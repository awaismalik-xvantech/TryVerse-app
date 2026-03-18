import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'shirt-outline' as const,
    title: 'Virtual Try-On',
    description: 'See how any outfit looks on you before buying — powered by AI',
    gradient: ['#c9a96e', '#e8c98a'] as const,
  },
  {
    id: '2',
    icon: 'sparkles-outline' as const,
    title: 'AI Fashion Stylist',
    description: 'Get personalized style advice, trip packing help, and outfit recommendations',
    gradient: ['#8b6cc7', '#b19cd9'] as const,
  },
  {
    id: '3',
    icon: 'resize-outline' as const,
    title: 'Perfect Size, Every Time',
    description: 'AI analyzes size charts and your measurements to recommend your best fit',
    gradient: ['#e8618c', '#f4a3b8'] as const,
  },
  {
    id: '4',
    icon: 'camera-outline' as const,
    title: 'Pose Studio',
    description: 'Transform selfies into professional fashion poses with one tap',
    gradient: ['#6b9b7a', '#8fc4a0'] as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

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

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={[styles.slide, { width }]}>
      <LinearGradient
        colors={item.gradient}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Ionicons name={item.icon} size={64} color="#fff" />
      </LinearGradient>
      <Animated.Text entering={FadeIn.delay(200)} style={styles.slideTitle}>
        {item.title}
      </Animated.Text>
      <Animated.Text entering={FadeIn.delay(400)} style={styles.slideDescription}>
        {item.description}
      </Animated.Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

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
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>

      {/* Bottom button */}
      <View style={styles.bottomContainer}>
        <Pressable onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['#c9a96e', '#e8c98a']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentIndex === slides.length - 1 ? 'arrow-forward' : 'chevron-forward'}
              size={20}
              color="#1a1a2e"
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.base,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  slideTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.light.charcoal,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  slideDescription: {
    fontSize: FontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.light.gold,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.light.border,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 50,
  },
  nextButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.light.charcoal,
  },
});
