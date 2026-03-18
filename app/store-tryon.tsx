import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiGet, apiUpload, apiFetch, API_URL } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Product {
  id: number;
  name: string;
  brand: string | null;
  image_url: string;
  price: string | null;
  source_url?: string | null;
  store_id?: number;
  sizes?: { size: string; available: boolean }[];
}

export default function StoreTryOnScreen() {
  const { product: productId, store: storeId } = useLocalSearchParams<{
    product: string;
    store: string;
  }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [bodyType, setBodyType] = useState<'full_body' | 'upper_body'>('full_body');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;
    const res = await apiGet<Product>(`/api/store/products/${productId}`);
    if (res.ok && res.data) setProduct(res.data);
    setLoading(false);
  };

  const pickImage = async (useCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;
    if (useCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });
    } else {
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
    setIsUploading(true);
    const res = await apiUpload('/api/store/upload', uri, 'file', {
      body_type: bodyType,
      product_id: String(productId),
    });
    setIsUploading(false);
    if (res.ok && res.data) {
      setFileId((res.data as { file_id: string }).file_id);
    } else {
      Alert.alert('Upload Failed', 'Could not upload image');
    }
  };

  const handleGenerate = async () => {
    if (!fileId || !productId) return;
    setIsGenerating(true);
    try {
      const response = await apiFetch('/api/store/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileId,
          product_id: parseInt(productId),
          body_type: bodyType,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.file_id) {
          setResultImageUrl(`${API_URL}/api/store/result-image/${data.file_id}`);
        }
      } else {
        Alert.alert('Error', 'Generation failed');
      }
    } catch {
      Alert.alert('Error', 'Connection failed');
    }
    setIsGenerating(false);
  };

  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.charcoal} />
          </Pressable>
          <Text style={styles.headerTitle}>Store Try-On</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Product Info */}
        {product && (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.productCard}>
            <Image
              source={{ uri: resolveImageUrl(product.image_url) }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              {product.price && <Text style={styles.productPrice}>{product.price}</Text>}
              {product.sizes && product.sizes.length > 0 && (
                <View style={styles.sizesRow}>
                  {product.sizes.slice(0, 6).map((s) => (
                    <View key={s.size} style={[styles.sizeChip, !s.available && styles.sizeChipUnavailable]}>
                      <Text style={[styles.sizeChipText, !s.available && styles.sizeChipTextUnavailable]}>
                        {s.size}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Upload */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Pressable
            onPress={() =>
              Alert.alert('Upload Photo', '', [
                { text: 'Camera', onPress: () => pickImage(true) },
                { text: 'Gallery', onPress: () => pickImage(false) },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
            style={styles.uploadArea}>
            {selfieUri ? (
              <View>
                <Image source={{ uri: selfieUri }} style={styles.selfiePreview} />
                {isUploading && (
                  <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={Colors.light.gold} />
                <Text style={styles.uploadText}>Upload your photo</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {/* Generate */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Pressable
            onPress={handleGenerate}
            disabled={isGenerating || !fileId}
            style={[styles.generateButton, (!fileId || isGenerating) && { opacity: 0.5 }]}>
            <LinearGradient
              colors={fileId ? ['#c9a96e', '#e8c98a'] : ['#d1d5db', '#e5e7eb']}
              style={styles.generateGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {isGenerating ? (
                <>
                  <ActivityIndicator color="#1a1a2e" />
                  <Text style={styles.generateText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#1a1a2e" />
                  <Text style={styles.generateText}>Try It On</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Result */}
        {resultImageUrl && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.resultSection}>
            <Text style={styles.resultTitle}>Your Try-On</Text>
            <Image source={{ uri: resultImageUrl }} style={styles.resultImage} />
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  productImage: { width: 100, height: 120, resizeMode: 'cover' },
  productInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  productName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.light.charcoal },
  productPrice: { fontSize: FontSize.base, fontWeight: '700', color: Colors.light.gold, marginTop: 4 },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Spacing.sm },
  sizeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sizeChipUnavailable: { opacity: 0.4 },
  sizeChipText: { fontSize: 10, color: Colors.light.charcoal },
  sizeChipTextUnavailable: { textDecorationLine: 'line-through' },
  uploadArea: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
    marginBottom: Spacing.xl,
  },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  uploadText: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: Spacing.sm },
  selfiePreview: { width: '100%', height: 250, resizeMode: 'cover' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  generateText: { fontSize: FontSize.md, fontWeight: '700', color: '#1a1a2e' },
  resultSection: { marginTop: Spacing.xl },
  resultTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal, marginBottom: Spacing.md },
  resultImage: {
    width: '100%',
    height: width - Spacing.xl * 2,
    borderRadius: BorderRadius.xl,
    resizeMode: 'cover',
    backgroundColor: Colors.light.surfaceSecondary,
  },
});
