import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PROGRESS_MESSAGES = [
  'Analyzing your photo...',
  'Finding the perfect fit...',
  'AI is working its magic...',
  'Almost there...',
  'Finalizing your look...',
];

interface GeneratingOverlayProps {
  visible: boolean;
  message?: string;
}

export function GeneratingOverlay({ visible, message }: GeneratingOverlayProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!visible || message) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % PROGRESS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible, message]);

  useEffect(() => {
    if (!visible) return;

    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.9,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    spinAnimation.start();
    pulseAnimation.start();
    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [visible, spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const displayMessage = message ?? PROGRESS_MESSAGES[messageIndex];

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <LinearGradient
        colors={['rgba(26, 26, 46, 0.95)', 'rgba(40, 35, 30, 0.95)']}
        style={styles.overlay}>
        <View style={styles.content}>
          {/* Rotating ring */}
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]} />
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseValue }] }]}>
              <Ionicons name="diamond" size={48} color="#e8c98a" />
            </Animated.View>
          </View>

          <Text style={styles.title}>{displayMessage}</Text>
          <Text style={styles.subtitle}>This usually takes 15-30 seconds</Text>
          <Text style={styles.privacyNote}>
            Your photos are processed securely and never saved
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: width * 0.15,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#c9a96e',
    borderRightColor: '#e8c98a',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  privacyNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
