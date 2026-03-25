import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { sendLocalNotification } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiUpload, apiFetch, API_URL } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { ImageResult } from '@/components/ImageResult';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';
import { useAuth } from '@/lib/auth';

const { width } = Dimensions.get('window');

export default function TryOnScreen() {
  const { user } = useAuth();
  const [showProPopup, setShowProPopup] = useState(false);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [bodyType, setBodyType] = useState<'full_body' | 'upper_body'>('full_body');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;

    if (useCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take a selfie.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to select a photo.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });
    }

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelfieUri(uri);
      setResultImageUrl(null);
      uploadSelfie(uri);
    }
  };

  const uploadSelfie = async (uri: string) => {
    const endpoint = `${API_URL}/api/tryon/upload-user-photo`;
    console.log('[UPLOAD] Virtual Try-On: upload started', { endpoint });
    setIsUploading(true);
    const res = await apiUpload('/api/tryon/upload-user-photo', uri, 'file');
    setIsUploading(false);
    if (res.ok && res.data) {
      console.log('[UPLOAD] Virtual Try-On: upload completed', { endpoint });
      setFileId('uploaded');
    } else {
      console.log('[UPLOAD] Virtual Try-On: upload failed', { endpoint, error: res.error });
      Alert.alert('Upload Failed', (res.error as string) || 'Could not upload image');
    }
  };

  const handleGenerate = async () => {
    if (!fileId) {
      Alert.alert('Upload First', 'Please upload a selfie first.');
      return;
    }
    if (!productUrl.trim()) {
      Alert.alert('Missing URL', 'Please paste a product URL.');
      return;
    }

    setIsGenerating(true);
    setResultImageUrl(null);

    const endpoint = `${API_URL}/api/tryon/fetch-and-tryon`;
    console.log('[GENERATION] Virtual Try-On: generation started', { endpoint, productUrl: productUrl.trim() });

    try {
      const response = await apiFetch('/api/tryon/fetch-and-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl.trim() }),
      });

      console.log('[GENERATION] Virtual Try-On: response received', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('[GENERATION] Virtual Try-On: generation completed', { hasResult: !!data.result_photo_url });
        if (data.result_photo_url) {
          const url = data.result_photo_url.startsWith('http')
            ? data.result_photo_url
            : `${API_URL}${data.result_photo_url}`;
          setResultImageUrl(url);
          setAiFeedback(data.ai_feedback || null);
          sendLocalNotification('Image Ready!', 'Your try-on image has been generated. Open the app to view and save it.');
          Alert.alert(
            'Image Ready!',
            'Your try-on image has been generated. Save it to your gallery before leaving.'
          );
          if (!user?.is_pro) {
            setTimeout(() => setShowProPopup(true), 2000);
          }
        }
      } else {
        const err = await response.json().catch(() => null);
        console.log('[GENERATION] Virtual Try-On: generation failed', { endpoint, status: response.status, err });
        Alert.alert('Generation Failed', err?.detail || 'Could not generate try-on');
      }
    } catch (e) {
      console.log('[GENERATION] Virtual Try-On: generation error', { endpoint, error: e });
      Alert.alert('Error', 'Connection failed');
    }
    setIsGenerating(false);
  };

  const showImagePicker = () => {
    Alert.alert('Upload Photo', 'Choose how to upload your selfie', [
      { text: 'Take Photo', onPress: () => pickImage(true) },
      { text: 'Choose from Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GeneratingOverlay visible={isGenerating} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Virtual Try-On</Text>
        <Text style={styles.subtitle}>See any outfit on yourself with AI</Text>

        {/* Body Type Toggle */}
        <View style={styles.toggleRow}>
          {(['full_body', 'upper_body'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setBodyType(type)}
              style={[styles.toggleButton, bodyType === type && styles.toggleButtonActive]}>
              <Ionicons
                name={type === 'full_body' ? 'body' : 'person'}
                size={18}
                color={bodyType === type ? '#fff' : Colors.light.textSecondary}
              />
              <Text style={[styles.toggleText, bodyType === type && styles.toggleTextActive]}>
                {type === 'full_body' ? 'Full Body' : 'Upper Body'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Selfie Upload */}
        <Pressable onPress={showImagePicker} style={styles.uploadArea}>
          {selfieUri ? (
            <View style={styles.selfieContainer}>
              <Image source={{ uri: selfieUri }} style={styles.selfieImage} />
              {isUploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              <Pressable onPress={showImagePicker} style={styles.changePhotoButton}>
                <Ionicons name="camera" size={16} color="#fff" />
                <Text style={styles.changePhotoText}>Change</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="camera-outline" size={32} color={Colors.light.gold} />
              </View>
              <Text style={styles.uploadTitle}>Upload Your Photo</Text>
              <Text style={styles.uploadDesc}>Take a selfie or choose from gallery</Text>
            </View>
          )}
        </Pressable>

        {/* Product URL */}
        <View style={styles.urlContainer}>
          <Text style={styles.inputLabel}>Product URL</Text>
          <View style={styles.urlInputRow}>
            <Ionicons name="link" size={20} color={Colors.light.textMuted} />
            <TextInput
              style={styles.urlInput}
              placeholder="Paste product URL here..."
              placeholderTextColor={Colors.light.textMuted}
              value={productUrl}
              onChangeText={setProductUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Generate Button */}
        <Pressable
          onPress={handleGenerate}
          disabled={isGenerating || !fileId}
          style={[styles.generateButton, (!fileId || isGenerating) && styles.generateButtonDisabled]}>
          <LinearGradient
            colors={fileId ? ['#c9a96e', '#e8c98a'] : ['#d1d5db', '#e5e7eb']}
            style={styles.generateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            {isGenerating ? (
              <>
                <ActivityIndicator color="#1a1a2e" />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#1a1a2e" />
                <Text style={styles.generateButtonText}>Generate Try-On</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {/* Result */}
        {resultImageUrl && (
          <ImageResult imageUrl={resultImageUrl} title="Your Try-On Result" aiFeedback={aiFeedback} />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
      <ProUpgradeModal visible={showProPopup} onClose={() => setShowProPopup(false)} variant="compact" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
  title: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.light.charcoal },
  subtitle: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 4, marginBottom: Spacing.xl },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  toggleButtonActive: { backgroundColor: Colors.light.charcoal, borderColor: Colors.light.charcoal },
  toggleText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.light.textSecondary },
  toggleTextActive: { color: '#fff' },
  uploadArea: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  uploadTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal },
  uploadDesc: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 4 },
  selfieContainer: { position: 'relative' },
  selfieImage: { width: '100%', height: width - Spacing.xl * 2, resizeMode: 'cover' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: { color: '#fff', fontSize: FontSize.sm, marginTop: Spacing.sm },
  changePhotoButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  changePhotoText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
  urlContainer: { marginBottom: Spacing.xl },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.light.charcoal, marginBottom: Spacing.sm },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  urlInput: { flex: 1, fontSize: FontSize.base, color: Colors.light.text },
  generateButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  generateButtonDisabled: { opacity: 0.6, shadowOpacity: 0 },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  generateButtonText: { fontSize: FontSize.md, fontWeight: '700', color: '#1a1a2e' },
});
