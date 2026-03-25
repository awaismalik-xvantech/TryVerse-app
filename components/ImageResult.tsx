import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system';
import type { DownloadOptions } from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { API_URL, getToken } from '@/lib/api';

const { width } = Dimensions.get('window');

interface ImageResultProps {
  imageUrl: string;
  title?: string;
  aiFeedback?: string | null;
}

export function ImageResult({ imageUrl, title = 'Your Result', aiFeedback }: ImageResultProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

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
        <Text style={styles.title}>{title}</Text>
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

      {aiFeedback && (
        <View style={styles.feedbackSection}>
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackIconBg}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.light.gold} />
            </View>
            <Text style={styles.feedbackTitle}>AI Styling Feedback</Text>
          </View>
          <Text style={styles.feedbackText}>{aiFeedback}</Text>
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
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal },
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
    height: width - Spacing.xl * 2,
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
    lineHeight: 20,
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
