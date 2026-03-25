import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
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
}

export function ImageResult({ imageUrl, title = 'Your Result' }: ImageResultProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your gallery.');
        return;
      }

      setSaving(true);
      const filename = `tryverse_${Date.now()}.jpg`;
      const destination = new File(Paths.cache, filename);
      const downloadOpts: DownloadOptions = {};
      if (imageUrl.startsWith(API_URL)) {
        const token = await getToken();
        if (token) downloadOpts.headers = { Authorization: `Bearer ${token}` };
      }
      const file = await File.downloadFileAsync(imageUrl, destination, downloadOpts);
      await MediaLibrary.saveToLibraryAsync(file.uri);
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
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
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
