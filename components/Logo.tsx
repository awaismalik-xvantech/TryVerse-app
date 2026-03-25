import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { icon: 20, iconBox: 28, text: 16, gap: 5 },
  md: { icon: 24, iconBox: 34, text: 20, gap: 6 },
  lg: { icon: 32, iconBox: 44, text: 28, gap: 8 },
};

export function Logo({ size = 'md', showText = true, light = false, style }: LogoProps) {
  const s = sizeMap[size];

  return (
    <View style={[styles.container, { gap: s.gap }, style]}>
      <LinearGradient
        colors={['#c9a96e', '#e8c98a']}
        style={[
          styles.iconBox,
          { width: s.iconBox, height: s.iconBox, borderRadius: s.iconBox / 2 },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Ionicons name="diamond" size={s.icon * 0.7} color="#fff" />
      </LinearGradient>
      {showText && (
        <Text style={[styles.brandText, { fontSize: s.text }]}>
          <Text style={styles.brandGold}>Try</Text>
          <Text style={[styles.brandDark, light && styles.brandLight]}>Verse</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandGold: {
    color: '#c9a96e',
  },
  brandDark: {
    color: '#1a1a2e',
  },
  brandLight: {
    color: '#ffffff',
  },
});
