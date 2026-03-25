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
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiUpload, apiFetch, API_URL } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeneratingOverlay } from '@/components/GeneratingOverlay';
import { ImageResult } from '@/components/ImageResult';

const { width } = Dimensions.get('window');

type Tab = 'stylist' | 'poses';

const poses = [
  { slug: 'confident-standing', name: 'Confident Standing', prompt: 'Confident standing pose, weight on one hip, shoulders back, professional fashion photography', img: require('@/assets/images/poses/confident-standing.jpg') },
  { slug: 'executive-walk', name: 'Executive Walk', prompt: 'Walking confidently mid-stride, one leg forward, arms swinging naturally, executive fashion photography', img: require('@/assets/images/poses/executive-walk.jpg') },
  { slug: 'business-portrait', name: 'Business Portrait', prompt: 'Professional business portrait, slight head tilt, direct eye contact, upper body composition', img: require('@/assets/images/poses/business-portrait.jpg') },
  { slug: 'over-the-shoulder', name: 'Over the Shoulder', prompt: 'Looking over the shoulder, body turned 45 degrees from camera, head turned back towards lens', img: require('@/assets/images/poses/over-the-shoulder.jpg') },
  { slug: 'casual-lean', name: 'Casual Lean', prompt: 'Casually leaning against a wall, one foot up, arms relaxed, natural effortless vibe', img: require('@/assets/images/poses/casual-lean.jpg') },
  { slug: 'relaxed-seated', name: 'Relaxed Seated', prompt: 'Seated on a chair or bench, one leg crossed, relaxed sophisticated look', img: require('@/assets/images/poses/relaxed-seated.jpg') },
  { slug: 'hands-in-pockets', name: 'Hands in Pockets', prompt: 'Hands in pockets, relaxed confident stance, slight head tilt, casual cool fashion look', img: require('@/assets/images/poses/hands-in-pockets.jpg') },
  { slug: 'street-stroll', name: 'Street Stroll', prompt: 'Walking on a city street, natural stride, looking slightly away from camera, street style fashion', img: require('@/assets/images/poses/street-stroll.jpg') },
  { slug: 'window-gaze', name: 'Window Gaze', prompt: 'Standing by a window gazing out, soft natural light illuminating face, contemplative elegant pose', img: require('@/assets/images/poses/window-gaze.jpg') },
  { slug: 'model-turn', name: 'Model Turn', prompt: 'Fashion model turn pose, body at 3/4 angle, head facing camera, runway-style confidence', img: require('@/assets/images/poses/model-turn.jpg') },
  { slug: 'dramatic-profile', name: 'Dramatic Profile', prompt: 'Dramatic side profile shot, strong jawline visible, moody artistic fashion photography', img: require('@/assets/images/poses/dramatic-profile.jpg') },
  { slug: 'floor-pose', name: 'Floor Pose', prompt: 'Seated on the floor, legs extended, leaning on one arm, editorial fashion photography', img: require('@/assets/images/poses/floor-pose.jpg') },
  { slug: 'coffee-shop', name: 'Coffee Shop', prompt: 'Sitting in a coffee shop, holding a cup, warm ambient lighting, lifestyle fashion photography', img: require('@/assets/images/poses/coffee-shop.jpg') },
  { slug: 'urban-background', name: 'Urban Background', prompt: 'Standing against urban graffiti wall background, streetwear fashion, edgy confident pose', img: require('@/assets/images/poses/urban-background.jpg') },
  { slug: 'sunlight-portrait', name: 'Sunlight Portrait', prompt: 'Golden hour sunlight portrait, warm tones, soft backlighting, natural beauty fashion photo', img: require('@/assets/images/poses/sunlight-portrait.jpg') },
  { slug: 'action-stride', name: 'Action Stride', prompt: 'Dynamic walking action shot, coat or hair flowing with movement, energetic confident stride', img: require('@/assets/images/poses/action-stride.jpg') },
  { slug: 'wind-blown', name: 'Wind Blown', prompt: 'Wind-blown hair and clothes, natural movement, outdoor fashion photography, dynamic energy', img: require('@/assets/images/poses/wind-blown.jpg') },
  { slug: 'staircase-pose', name: 'Staircase Pose', prompt: 'Posed on a staircase, one step higher, looking down at camera, elegant architectural setting', img: require('@/assets/images/poses/staircase-pose.jpg') },
  { slug: 'jump-shot', name: 'Jump Shot', prompt: 'Mid-air jump shot, arms and legs dynamic, joyful energetic expression, fashion photography', img: require('@/assets/images/poses/jump-shot.jpg') },
  { slug: 'dance-move', name: 'Dance Move', prompt: 'Dynamic dance pose, one arm extended, body in elegant motion, artistic fashion photography', img: require('@/assets/images/poses/dance-move.jpg') },
];

const POSE_SIZE = (width - Spacing.xl * 2 - Spacing.md * 2) / 3;

type StylistCategoryId = 'ai_stylist' | 'travel' | 'search';

const STYLIST_CATEGORY_META: {
  id: StylistCategoryId;
  title: string;
  subtitle: string;
  icon: 'sparkles' | 'location-outline' | 'search';
  cardBg: string;
}[] = [
  {
    id: 'ai_stylist',
    title: 'AI Stylist',
    subtitle: 'Style scores, color analysis, outfit ideas',
    icon: 'sparkles',
    cardBg: '#faf6ef',
  },
  {
    id: 'travel',
    title: 'Travel & Packing',
    subtitle: 'Trip outfits, packing lists & destination tips',
    icon: 'location-outline',
    cardBg: '#fdf2f7',
  },
  {
    id: 'search',
    title: 'Search Products',
    subtitle: 'Find fashion items with AI recommendations',
    icon: 'search',
    cardBg: Colors.light.surfaceSecondary,
  },
];

const STYLIST_CATEGORY_WELCOME: Record<StylistCategoryId, string> = {
  ai_stylist:
    "I'm ready to analyze your style! Ask me about color matching, outfit ideas, or style scores.",
  travel: "Planning a trip? Tell me your destination and I'll help with outfit packing lists!",
  search: "What kind of fashion items are you looking for? I'll find the best matches.",
};

export default function StyleScreen() {
  const [tab, setTab] = useState<Tab>('stylist');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedPose, setSelectedPose] = useState<string | null>(null);
  const [posePhotoUri, setPosePhotoUri] = useState<string | null>(null);
  const [poseResult, setPoseResult] = useState<string | null>(null);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);
  const [stylistPhotoUri, setStylistPhotoUri] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const clearStylistSession = () => {
    setStylistPhotoUri(null);
    setSelectedCategory(null);
    setConversationId(null);
    setMessages([]);
    setChatInput('');
  };

  const pickStylistPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setStylistPhotoUri(uri);
      const res = await apiUpload('/api/stylist/upload-photo', uri, 'file');
      if (res.ok && res.data) {
        const data = res.data as { id?: number };
        if (data.id) setConversationId(data.id);
        setSelectedCategory(null);
        setMessages([]);
      } else {
        Alert.alert('Upload failed', (res.error as string) || 'Could not upload your photo.');
        setStylistPhotoUri(null);
        setConversationId(null);
      }
    }
  };

  const selectStylistCategory = (id: StylistCategoryId) => {
    setSelectedCategory(id);
    setMessages([{ role: 'ai', text: STYLIST_CATEGORY_WELCOME[id] }]);
    setChatInput('');
  };

  const stylistCategoryTitle =
    selectedCategory === 'ai_stylist'
      ? 'AI Stylist'
      : selectedCategory === 'travel'
        ? 'Travel & Packing'
        : selectedCategory === 'search'
          ? 'Search Products'
          : '';

  const ensureConversation = async (): Promise<number | null> => {
    if (conversationId) return conversationId;
    console.log('[STYLIST] Creating conversation: trying start-from-tryon');
    try {
      const response = await apiFetch('/api/stylist/start-from-tryon', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        console.log('[STYLIST] Conversation created via start-from-tryon', { id: data.id });
        setConversationId(data.id);
        return data.id;
      }
      console.log('[STYLIST] start-from-tryon failed, trying upload-photo');
      const uploadRes = await apiFetch('/api/stylist/upload-photo', { method: 'POST' });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        console.log('[STYLIST] Conversation created via upload-photo', { id: data.id });
        setConversationId(data.id);
        return data.id;
      }
      console.log('[STYLIST] No conversation created', { startStatus: response.status, uploadStatus: uploadRes.status });
    } catch (e) {
      console.log('[STYLIST] ensureConversation error', e);
    }
    return null;
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const convId = await ensureConversation();
      if (!convId) {
        const noConvMessage =
          'I could not start a session. Please tap "Choose Photo" to upload your photo again, or use a photo from Virtual Try-On.';
        console.log('[STYLIST] No conversation available, showing message to user');
        setMessages((prev) => [...prev, { role: 'ai', text: noConvMessage }]);
        setIsSending(false);
        return;
      }

      console.log('[STYLIST] Sending message', { conversationId: convId, message: userMsg });
      const response = await apiFetch('/api/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: convId, message: userMsg }),
      });
      if (response.ok) {
        const data = await response.json();
        const botText = data.bot_message?.content || data.response || data.message || 'No response';
        console.log('[STYLIST] Response received', { hasBotMessage: !!data.bot_message });
        setMessages((prev) => [...prev, { role: 'ai', text: botText }]);
      } else {
        const err = await response.json().catch(() => null);
        console.log('[STYLIST] Chat error', { status: response.status, err });
        setMessages((prev) => [...prev, { role: 'ai', text: err?.detail || 'Sorry, I could not process that.' }]);
      }
    } catch (e) {
      console.log('[STYLIST] Chat connection error', e);
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
    const endpoint = `${API_URL}/api/pose/generate`;
    console.log('[POSE] Generation started', { endpoint, selectedPose });
    setIsGeneratingPose(true);
    const selected = poses.find((p) => p.slug === selectedPose);
    const prompt1 = selected?.prompt || `${selected?.name || selectedPose} fashion photography pose`;
    const secondPose = poses.find((p) => p.slug !== selectedPose);
    const prompt2 = secondPose?.prompt || 'Professional fashion portrait with confident posture';
    const posesJson = JSON.stringify([prompt1, prompt2]);
    const res = await apiUpload('/api/pose/generate', posePhotoUri, 'file', { poses: posesJson });
    setIsGeneratingPose(false);
    console.log('[POSE] Generation response', { ok: res.ok, status: res.status, hasData: !!res.data });
    if (res.ok && res.data) {
      const data = res.data as { generated_image_urls?: string[] };
      if (data.generated_image_urls && data.generated_image_urls.length > 0) {
        const url = data.generated_image_urls[0];
        setPoseResult(url.startsWith('http') ? url : `${API_URL}${url}`);
        console.log('[POSE] Generation completed', { resultCount: data.generated_image_urls.length });
        Alert.alert(
          'Image Ready!',
          'Your pose image has been generated. Save it to your gallery before leaving.'
        );
      }
    } else {
      console.log('[POSE] Generation failed', { endpoint, error: res.error });
      Alert.alert('Error', (res.error as string) || 'Generation failed');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GeneratingOverlay visible={isGeneratingPose} message="Transforming your pose..." />
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
        stylistPhotoUri === null ? (
          <ScrollView
            style={styles.stylistOnboardingScroll}
            contentContainerStyle={styles.stylistOnboardingContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeIn} style={styles.stylistOnboardingInner}>
              <Text style={styles.stylistHeroTitle}>Your AI Fashion Stylist</Text>
              <Text style={styles.stylistHeroSubtitle}>
                Get personalized styling advice, trip packing lists, and product recommendations
              </Text>
              <Pressable onPress={pickStylistPhoto} style={styles.stylistUploadArea}>
                <Ionicons name="camera" size={40} color={Colors.light.gold} />
                <Text style={styles.stylistUploadAreaText}>Upload Your Photo First</Text>
              </Pressable>
              <Pressable onPress={pickStylistPhoto} style={styles.stylistChoosePhotoWrap}>
                <LinearGradient
                  colors={['#c9a96e', '#e8c98a']}
                  style={styles.stylistChoosePhotoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.stylistChoosePhotoText}>Choose Photo</Text>
                </LinearGradient>
              </Pressable>
              <Text style={styles.stylistPrivacyNote}>
                Your photo is used only for styling analysis and is never shared.
              </Text>
            </Animated.View>
          </ScrollView>
        ) : selectedCategory === null ? (
          <ScrollView
            style={styles.stylistOnboardingScroll}
            contentContainerStyle={styles.stylistCategoryScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.stylistPhotoRow}>
              <Image source={{ uri: stylistPhotoUri }} style={styles.stylistPhotoThumb} />
              <View style={styles.stylistPhotoRowText}>
                <Text style={styles.stylistPhotoReady}>Photo uploaded - Ready for personalized advice</Text>
                <Pressable onPress={clearStylistSession} style={styles.stylistChangeBtn}>
                  <Text style={styles.stylistChangeBtnText}>Change</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.stylistCategoryGrid}>
              {STYLIST_CATEGORY_META.map((cat, i) => (
                <Pressable
                  key={cat.id}
                  onPress={() => selectStylistCategory(cat.id)}
                  style={[styles.stylistCategoryCard, { backgroundColor: cat.cardBg }]}>
                  <Animated.View entering={FadeInDown.delay(i * 60)}>
                    <Ionicons name={cat.icon} size={28} color={Colors.light.charcoal} />
                    <Text style={styles.stylistCategoryCardTitle}>{cat.title}</Text>
                    <Text style={styles.stylistCategoryCardSubtitle}>{cat.subtitle}</Text>
                  </Animated.View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <KeyboardAvoidingView
            style={styles.stylistChatKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
            <View style={styles.chatContainer}>
              <View style={styles.stylistChatHeader}>
                <Pressable
                  onPress={() => {
                    setSelectedCategory(null);
                    setMessages([]);
                    setChatInput('');
                  }}
                  style={styles.stylistChatBack}
                  hitSlop={8}>
                  <Ionicons name="chevron-back" size={22} color={Colors.light.charcoal} />
                  <Text style={styles.stylistChatBackText}>Back</Text>
                </Pressable>
                <Text style={styles.stylistChatHeaderTitle} numberOfLines={1}>
                  {stylistCategoryTitle}
                </Text>
                <View style={styles.stylistChatHeaderSpacer} />
              </View>
              <ScrollView
                style={styles.chatMessages}
                contentContainerStyle={styles.chatMessagesContent}
                keyboardShouldPersistTaps="handled">
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
                  <Ionicons
                    name="send"
                    size={20}
                    color={chatInput.trim() ? Colors.light.gold : Colors.light.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        )
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
            <ImageResult imageUrl={poseResult} title="Your Pose Result" />
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
  chatBubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.light.charcoal },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: Colors.light.surfaceSecondary },
  chatBubbleText: { fontSize: FontSize.base, color: Colors.light.charcoal, lineHeight: 22 },
  userBubbleText: { color: '#fff' },
  stylistChatKeyboard: { flex: 1 },
  stylistOnboardingScroll: { flex: 1 },
  stylistOnboardingContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  stylistOnboardingInner: { paddingTop: Spacing.lg, alignItems: 'center' },
  stylistHeroTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.light.charcoal,
    textAlign: 'center',
  },
  stylistHeroSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  stylistUploadArea: {
    marginTop: Spacing['2xl'],
    width: '100%',
    minHeight: 160,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    paddingVertical: Spacing.xl,
  },
  stylistUploadAreaText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.light.charcoal,
    marginTop: Spacing.md,
  },
  stylistChoosePhotoWrap: {
    marginTop: Spacing.lg,
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stylistChoosePhotoGradient: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stylistChoosePhotoText: { fontSize: FontSize.md, fontWeight: '700', color: '#1a1a2e' },
  stylistPrivacyNote: {
    fontSize: FontSize.xs,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    lineHeight: 18,
  },
  stylistCategoryScrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  stylistPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  stylistPhotoThumb: {
    width: 72,
    height: 96,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  stylistPhotoRowText: { flex: 1 },
  stylistPhotoReady: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.light.charcoal,
    lineHeight: 20,
  },
  stylistChangeBtn: { alignSelf: 'flex-start', marginTop: Spacing.sm },
  stylistChangeBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.light.gold },
  stylistCategoryGrid: { gap: Spacing.md },
  stylistCategoryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  stylistCategoryCardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.light.charcoal,
    marginTop: Spacing.sm,
  },
  stylistCategoryCardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  stylistChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  stylistChatBack: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  stylistChatBackText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.light.charcoal },
  stylistChatHeaderTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.light.charcoal,
    textAlign: 'center',
  },
  stylistChatHeaderSpacer: { width: 56 },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    gap: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
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
});
