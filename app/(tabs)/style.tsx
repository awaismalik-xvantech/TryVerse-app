import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiUpload, apiFetch, API_URL } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type Tab = 'stylist' | 'poses';

const poses = [
  { slug: 'confident-standing', name: 'Confident Standing', img: require('@/assets/images/poses/confident-standing.jpg') },
  { slug: 'executive-walk', name: 'Executive Walk', img: require('@/assets/images/poses/executive-walk.jpg') },
  { slug: 'business-portrait', name: 'Business Portrait', img: require('@/assets/images/poses/business-portrait.jpg') },
  { slug: 'over-the-shoulder', name: 'Over the Shoulder', img: require('@/assets/images/poses/over-the-shoulder.jpg') },
  { slug: 'casual-lean', name: 'Casual Lean', img: require('@/assets/images/poses/casual-lean.jpg') },
  { slug: 'relaxed-seated', name: 'Relaxed Seated', img: require('@/assets/images/poses/relaxed-seated.jpg') },
  { slug: 'hands-in-pockets', name: 'Hands in Pockets', img: require('@/assets/images/poses/hands-in-pockets.jpg') },
  { slug: 'street-stroll', name: 'Street Stroll', img: require('@/assets/images/poses/street-stroll.jpg') },
  { slug: 'window-gaze', name: 'Window Gaze', img: require('@/assets/images/poses/window-gaze.jpg') },
  { slug: 'model-turn', name: 'Model Turn', img: require('@/assets/images/poses/model-turn.jpg') },
  { slug: 'dramatic-profile', name: 'Dramatic Profile', img: require('@/assets/images/poses/dramatic-profile.jpg') },
  { slug: 'floor-pose', name: 'Floor Pose', img: require('@/assets/images/poses/floor-pose.jpg') },
  { slug: 'coffee-shop', name: 'Coffee Shop', img: require('@/assets/images/poses/coffee-shop.jpg') },
  { slug: 'urban-background', name: 'Urban Background', img: require('@/assets/images/poses/urban-background.jpg') },
  { slug: 'sunlight-portrait', name: 'Sunlight Portrait', img: require('@/assets/images/poses/sunlight-portrait.jpg') },
  { slug: 'action-stride', name: 'Action Stride', img: require('@/assets/images/poses/action-stride.jpg') },
  { slug: 'wind-blown', name: 'Wind Blown', img: require('@/assets/images/poses/wind-blown.jpg') },
  { slug: 'staircase-pose', name: 'Staircase Pose', img: require('@/assets/images/poses/staircase-pose.jpg') },
  { slug: 'jump-shot', name: 'Jump Shot', img: require('@/assets/images/poses/jump-shot.jpg') },
  { slug: 'dance-move', name: 'Dance Move', img: require('@/assets/images/poses/dance-move.jpg') },
];

const POSE_SIZE = (width - Spacing.xl * 2 - Spacing.md * 2) / 3;

export default function StyleScreen() {
  const [tab, setTab] = useState<Tab>('stylist');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [selectedPose, setSelectedPose] = useState<string | null>(null);
  const [posePhotoUri, setPosePhotoUri] = useState<string | null>(null);
  const [poseResult, setPoseResult] = useState<string | null>(null);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const response = await apiFetch('/api/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: 'ai', text: data.response || data.message || 'No response' }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I could not process that.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    }
    setIsSending(false);
  };

  const pickPosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      setPosePhotoUri(result.assets[0].uri);
      setPoseResult(null);
    }
  };

  const generatePose = async () => {
    if (!posePhotoUri || !selectedPose) {
      Alert.alert('Missing', 'Please select a photo and a pose.');
      return;
    }
    setIsGeneratingPose(true);
    const res = await apiUpload('/api/pose/generate', posePhotoUri, 'file', { pose: selectedPose });
    setIsGeneratingPose(false);
    if (res.ok && res.data) {
      const data = res.data as { file_id?: string };
      if (data.file_id) setPoseResult(`${API_URL}/api/pose/image/${data.file_id}`);
    } else {
      Alert.alert('Error', (res.error as string) || 'Generation failed');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Style</Text>
      </View>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab('stylist')}
          style={[styles.tabButton, tab === 'stylist' && styles.tabButtonActive]}>
          <Ionicons name="sparkles" size={18} color={tab === 'stylist' ? '#fff' : Colors.light.textSecondary} />
          <Text style={[styles.tabText, tab === 'stylist' && styles.tabTextActive]}>AI Stylist</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('poses')}
          style={[styles.tabButton, tab === 'poses' && styles.tabButtonActive]}>
          <Ionicons name="camera" size={18} color={tab === 'poses' ? '#fff' : Colors.light.textSecondary} />
          <Text style={[styles.tabText, tab === 'poses' && styles.tabTextActive]}>Pose Studio</Text>
        </Pressable>
      </View>

      {tab === 'stylist' ? (
        /* AI Stylist Chat */
        <View style={styles.chatContainer}>
          <ScrollView style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
            {messages.length === 0 && (
              <Animated.View entering={FadeIn} style={styles.chatEmptyState}>
                <Ionicons name="sparkles" size={48} color={Colors.light.gold} />
                <Text style={styles.chatEmptyTitle}>AI Fashion Stylist</Text>
                <Text style={styles.chatEmptyDesc}>
                  Ask me for style advice, outfit ideas, trip packing suggestions, or anything fashion!
                </Text>
              </Animated.View>
            )}
            {messages.map((msg, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 50)}
                style={[styles.chatBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.chatBubbleText, msg.role === 'user' && styles.userBubbleText]}>
                  {msg.text}
                </Text>
              </Animated.View>
            ))}
            {isSending && (
              <View style={[styles.chatBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color={Colors.light.gold} />
              </View>
            )}
          </ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Ask me anything about style..."
              placeholderTextColor={Colors.light.textMuted}
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
            />
            <Pressable onPress={sendMessage} disabled={isSending || !chatInput.trim()} style={styles.sendButton}>
              <Ionicons name="send" size={20} color={chatInput.trim() ? Colors.light.gold : Colors.light.textMuted} />
            </Pressable>
          </View>
        </View>
      ) : (
        /* Pose Studio */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.poseContent}>
          {/* Upload */}
          <Pressable onPress={pickPosePhoto} style={styles.poseUpload}>
            {posePhotoUri ? (
              <Image source={{ uri: posePhotoUri }} style={styles.poseUploadImage} />
            ) : (
              <View style={styles.poseUploadPlaceholder}>
                <Ionicons name="image-outline" size={32} color={Colors.light.gold} />
                <Text style={styles.poseUploadText}>Select your photo</Text>
              </View>
            )}
          </Pressable>

          {/* Pose Grid */}
          <Text style={styles.poseGridTitle}>Choose a Pose</Text>
          <View style={styles.poseGrid}>
            {poses.map((pose, i) => (
              <Pressable
                key={pose.slug}
                onPress={() => setSelectedPose(pose.slug)}
                style={[styles.poseGridItem, selectedPose === pose.slug && styles.poseGridItemSelected]}>
                <Image source={pose.img} style={styles.poseGridImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.poseGridOverlay}>
                  <Text style={styles.poseGridName} numberOfLines={1}>{pose.name}</Text>
                </LinearGradient>
                {selectedPose === pose.slug && (
                  <View style={styles.poseCheck}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.light.gold} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Generate */}
          <Pressable
            onPress={generatePose}
            disabled={isGeneratingPose || !posePhotoUri || !selectedPose}
            style={[styles.generatePoseButton, (!posePhotoUri || !selectedPose) && { opacity: 0.5 }]}>
            <LinearGradient
              colors={['#c9a96e', '#e8c98a']}
              style={styles.generatePoseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {isGeneratingPose ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#1a1a2e" />
                  <Text style={styles.generatePoseText}>Generate Pose</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {poseResult && (
            <Animated.View entering={FadeIn} style={styles.poseResultContainer}>
              <Text style={styles.poseResultTitle}>Result</Text>
              <Image source={{ uri: poseResult }} style={styles.poseResultImage} />
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.light.charcoal },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabButtonActive: { backgroundColor: Colors.light.charcoal, borderColor: Colors.light.charcoal },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.light.textSecondary },
  tabTextActive: { color: '#fff' },
  chatContainer: { flex: 1 },
  chatMessages: { flex: 1, paddingHorizontal: Spacing.xl },
  chatMessagesContent: { paddingTop: Spacing.base, paddingBottom: Spacing.base },
  chatEmptyState: { alignItems: 'center', paddingTop: 60 },
  chatEmptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.light.charcoal, marginTop: Spacing.base },
  chatEmptyDesc: { fontSize: FontSize.sm, color: Colors.light.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20, paddingHorizontal: Spacing.xl },
  chatBubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.light.charcoal },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: Colors.light.surfaceSecondary },
  chatBubbleText: { fontSize: FontSize.base, color: Colors.light.charcoal, lineHeight: 22 },
  userBubbleText: { color: '#fff' },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  chatInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.light.text,
    maxHeight: 100,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sendButton: { padding: Spacing.md },
  poseContent: { paddingHorizontal: Spacing.xl },
  poseUpload: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
    marginBottom: Spacing.xl,
  },
  poseUploadPlaceholder: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  poseUploadText: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: Spacing.sm },
  poseUploadImage: { width: '100%', height: 200, resizeMode: 'cover' },
  poseGridTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal, marginBottom: Spacing.md },
  poseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  poseGridItem: {
    width: POSE_SIZE,
    height: POSE_SIZE * 1.3,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  poseGridItemSelected: { borderWidth: 3, borderColor: Colors.light.gold },
  poseGridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  poseGridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingBottom: 6,
    paddingTop: 20,
  },
  poseGridName: { fontSize: 10, fontWeight: '600', color: '#fff' },
  poseCheck: { position: 'absolute', top: 6, right: 6 },
  generatePoseButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  generatePoseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  generatePoseText: { fontSize: FontSize.md, fontWeight: '700', color: '#1a1a2e' },
  poseResultContainer: { marginTop: Spacing.xl },
  poseResultTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.light.charcoal, marginBottom: Spacing.md },
  poseResultImage: {
    width: '100%',
    height: width - Spacing.xl * 2,
    borderRadius: BorderRadius.xl,
    resizeMode: 'cover',
    backgroundColor: Colors.light.surfaceSecondary,
  },
});
