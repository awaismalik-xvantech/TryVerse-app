import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { mark: 28, letter: 14, text: 16, gap: 5 },
  md: { mark: 34, letter: 17, text: 20, gap: 6 },
  lg: { mark: 44, letter: 22, text: 28, gap: 8 },
};

export function Logo({ size = 'md', showText = true, light = false, style }: LogoProps) {
  const s = sizeMap[size];
  const r = s.mark / 2;

  return (
    <View style={[styles.container, { gap: s.gap }, style]}>
      <View
        style={[
          styles.markShadow,
          {
            width: s.mark + 4,
            height: s.mark + 4,
            borderRadius: (s.mark + 4) / 2,
          },
        ]}>
        <LinearGradient
          colors={['#c9a96e', '#e8c98a']}
          style={[
            styles.markGradient,
            {
              width: s.mark,
              height: s.mark,
              borderRadius: r,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={[styles.markLetter, { fontSize: s.letter }]}>T</Text>
        </LinearGradient>
      </View>
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
  markShadow: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 169, 110, 0.25)',
    shadowColor: '#8b7355',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  markGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  markLetter: {
    fontWeight: '800',
    color: '#ffffff',
    marginTop: -2,
    letterSpacing: -0.5,
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
