import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system';
import type { DownloadOptions } from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { API_URL, getToken } from '@/lib/api';

interface ImageResultProps {
  imageUrl: string;
  title?: string;
  aiFeedback?: string | null;
}

function extractStyleScore(text: string): { score: number | null; cleanText: string } {
  const match = text.match(/\*\*Style Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10\*\*/i);
  if (!match) return { score: null, cleanText: text };
  const score = parseFloat(match[1]);
  const startIdx = text.indexOf(match[0]);
  const scoreLine = text.substring(startIdx);
  const endOfLine = scoreLine.indexOf('\n');
  const fullLine = endOfLine > -1 ? text.substring(startIdx, startIdx + endOfLine) : match[0];
  const cleanText = text.replace(fullLine, '').replace(/^\s*\n/, '').trim();
  return { score: isNaN(score) ? null : score, cleanText };
}

function getScoreTheme(score: number) {
  if (score >= 8) return { label: 'Excellent Match', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', gradient: ['#16a34a', '#22c55e'] as [string, string] };
  if (score >= 6) return { label: 'Good Match', color: '#c9a96e', bg: '#faf6ef', border: '#e8c98a', gradient: ['#c9a96e', '#e8c98a'] as [string, string] };
  if (score >= 4) return { label: 'Fair Match', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', gradient: ['#ea580c', '#f97316'] as [string, string] };
  return { label: 'Poor Match', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', gradient: ['#dc2626', '#ef4444'] as [string, string] };
}

function StyleScoreCard({ score }: { score: number }) {
  const theme = getScoreTheme(score);
  const fullStars = Math.floor(score / 2);
  const halfStar = (score % 2) >= 1;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <View style={[scoreStyles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <LinearGradient
        colors={theme.gradient}
        style={scoreStyles.scoreBox}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Text style={scoreStyles.scoreNumber}>{score}</Text>
        <Text style={scoreStyles.scoreDenom}>/10</Text>
      </LinearGradient>
      <View style={scoreStyles.info}>
        <View style={scoreStyles.starsRow}>
          {Array.from({ length: fullStars }, (_, i) => (
            <Ionicons key={`f${i}`} name="star" size={16} color={theme.color} />
          ))}
          {halfStar && <Ionicons name="star-half" size={16} color={theme.color} />}
          {Array.from({ length: emptyStars }, (_, i) => (
            <Ionicons key={`e${i}`} name="star-outline" size={16} color="#d1d5db" />
          ))}
        </View>
        <Text style={[scoreStyles.label, { color: theme.color }]}>{theme.label}</Text>
        <Text style={scoreStyles.desc}>How well this product suits you</Text>
      </View>
    </View>
  );
}

function RichFeedbackText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={styles.feedbackText}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={styles.feedbackBold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export function ImageResult({ imageUrl, title = 'Your Result', aiFeedback }: ImageResultProps) {
  const { width } = useWindowDimensions();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const parsedFeedback = useMemo(() => {
    if (!aiFeedback) return null;
    return extractStyleScore(aiFeedback);
  }, [aiFeedback]);

  useEffect(() => {
    let cancelled = false;
    const loadImage = async () => {
      try {
        setLoadingImage(true);
        setLoadError(false);
        const filename = `tryverse_preview_${Date.now()}.jpg`;
        const destination = new File(Paths.cache, filename);
        const downloadOpts: DownloadOptions = {};
        if (imageUrl.startsWith(API_URL)) {
          const token = await getToken();
          if (token) downloadOpts.headers = { Authorization: `Bearer ${token}` };
        }
        const file = await File.downloadFileAsync(imageUrl, destination, downloadOpts);
        if (!cancelled) {
          setLocalUri(file.uri);
          setLoadingImage(false);
        }
      } catch (error) {
        console.log('[ImageResult] Failed to load image:', error);
        if (!cancelled) {
          setLoadError(true);
          setLoadingImage(false);
        }
      }
    };
    loadImage();
    return () => {
      cancelled = true;
    };
  }, [imageUrl, retryKey]);

  const saveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your gallery.');
        return;
      }
      setSaving(true);

      let saveUri = localUri;
      if (!saveUri) {
        const filename = `tryverse_${Date.now()}.jpg`;
        const destination = new File(Paths.cache, filename);
        const downloadOpts: DownloadOptions = {};
        if (imageUrl.startsWith(API_URL)) {
          const token = await getToken();
          if (token) downloadOpts.headers = { Authorization: `Bearer ${token}` };
        }
        const file = await File.downloadFileAsync(imageUrl, destination, downloadOpts);
        saveUri = file.uri;
      }

      await MediaLibrary.saveToLibraryAsync(saveUri);
      setSaved(true);
      Alert.alert('Saved!', 'Image has been saved to your gallery.');
    } catch (error) {
      console.log('[SAVE] Error saving to gallery:', error);
      Alert.alert('Error', 'Could not save the image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
          <Text style={styles.badgeText}>Generated</Text>
        </View>
      </View>

      <View style={styles.imageWrapper}>
        {loadingImage ? (
          <View style={[styles.image, styles.imageLoading]}>
            <ActivityIndicator size="large" color={Colors.light.gold} />
            <Text style={styles.loadingText}>Loading image...</Text>
          </View>
        ) : loadError ? (
          <View style={[styles.image, styles.imageLoading]}>
            <Ionicons name="image-outline" size={48} color={Colors.light.textMuted} />
            <Text style={styles.loadingText}>Could not load image</Text>
            <Pressable
              onPress={() => {
                setLoadError(false);
                setLocalUri(null);
                setRetryKey((k) => k + 1);
              }}
              style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : localUri ? (
          <ExpoImage
            source={{ uri: localUri }}
            style={styles.image}
            contentFit="contain"
            transition={300}
          />
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={saveToGallery} disabled={saving} style={styles.saveButton}>
          <LinearGradient
            colors={saved ? [Colors.light.success, '#16a34a'] : ['#c9a96e', '#e8c98a']}
            style={styles.saveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Ionicons
              name={saved ? 'checkmark-circle' : 'download-outline'}
              size={20}
              color={saved ? '#fff' : '#1a1a2e'}
            />
            <Text style={[styles.saveText, saved && { color: '#fff' }]}>
              {saving ? 'Saving...' : saved ? 'Saved to Gallery' : 'Save to Gallery'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {parsedFeedback && (
        <View style={styles.feedbackSection}>
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackIconBg}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.light.gold} />
            </View>
            <Text style={styles.feedbackTitle}>AI Styling Feedback</Text>
          </View>
          {parsedFeedback.score !== null && (
            <StyleScoreCard score={parsedFeedback.score} />
          )}
          <RichFeedbackText text={parsedFeedback.cleanText} />
        </View>
      )}

      <Text style={styles.hint}>
        Download your image before leaving — it won't be stored on our servers
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal, flex: 1, marginRight: Spacing.sm },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.success + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.light.success },
  imageWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 500,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
    marginTop: Spacing.sm,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.gold + '20',
    borderRadius: BorderRadius.md,
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.light.gold,
  },
  feedbackSection: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feedbackIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.light.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.light.charcoal,
  },
  feedbackText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  feedbackBold: {
    fontWeight: '700',
    color: Colors.light.charcoal,
  },
  actions: { marginTop: Spacing.md },
  saveButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  saveText: { fontSize: FontSize.base, fontWeight: '700', color: '#1a1a2e' },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});

const scoreStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.base,
    gap: Spacing.base,
    marginBottom: Spacing.md,
  },
  scoreBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  scoreDenom: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: -2,
  },
  info: {
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  desc: {
    fontSize: FontSize.xs,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
});
