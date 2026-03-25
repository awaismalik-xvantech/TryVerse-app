import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiGet, API_URL, getToken } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryItem {
  id: number;
  created_at: string;
  result_photo_url?: string | null;
  product_name?: string | null;
  product_image_url?: string | null;
  status?: string | null;
  /** Store tab: image only while ephemeral file exists */
  has_download?: boolean;
  source: 'tryon' | 'store';
}

interface TryOnHistoryApi {
  id: number;
  created_at: string;
  result_photo_url?: string | null;
  status: string;
  product?: {
    title?: string | null;
    main_image_url?: string | null;
    image_urls?: string[] | null;
  } | null;
}

interface StoreHistoryApi {
  id: number;
  product_name: string;
  status: string;
  has_download: boolean;
  created_at: string;
}

function StoreHistoryThumb({
  resultId,
  hasDownload,
  style,
  placeholderStyle,
}: {
  resultId: number;
  hasDownload: boolean;
  style: object;
  placeholderStyle: object[];
}) {
  const [headers, setHeaders] = useState<Record<string, string> | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!cancelled && token) {
        setHeaders({ Authorization: `Bearer ${token}` });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hasDownload) {
    return (
      <View style={[style, ...placeholderStyle]}>
        <Ionicons name="image-outline" size={32} color={Colors.light.textMuted} />
      </View>
    );
  }

  if (!headers) {
    return (
      <View style={[style, ...placeholderStyle]}>
        <ActivityIndicator color={Colors.light.gold} />
      </View>
    );
  }

  const uri = `${API_URL}/api/store/download-by-result/${resultId}`;
  return (
    <Image
      source={{ uri, headers }}
      style={style}
      contentFit="cover"
      transition={200}
    />
  );
}

export default function TryOnHistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tryon' | 'store'>('tryon');

  const loadHistory = useCallback(async () => {
    try {
      const endpoint = activeTab === 'tryon' ? '/api/tryon/history' : '/api/store/history';
      console.log('[HISTORY] Loading from:', endpoint);
      const res = await apiGet<TryOnHistoryApi[] | StoreHistoryApi[]>(endpoint);
      if (res.ok && res.data && Array.isArray(res.data)) {
        if (activeTab === 'tryon') {
          const mapped: HistoryItem[] = (res.data as TryOnHistoryApi[]).map((row) => {
            const firstImg = row.product?.image_urls?.[0];
            const productImage = row.product?.main_image_url || firstImg || undefined;
            return {
              id: row.id,
              created_at: typeof row.created_at === 'string' ? row.created_at : String(row.created_at),
              result_photo_url: row.result_photo_url,
              product_name: row.product?.title || undefined,
              product_image_url: productImage,
              status: row.status,
              source: 'tryon',
            };
          });
          setItems(mapped);
        } else {
          const mapped: HistoryItem[] = (res.data as StoreHistoryApi[]).map((row) => ({
            id: row.id,
            created_at: row.created_at,
            product_name: row.product_name,
            status: row.status,
            has_download: row.has_download,
            source: 'store',
          }));
          setItems(mapped);
        }
      } else {
        setItems([]);
      }
    } catch (e) {
      console.log('[HISTORY] Error loading:', e);
      setItems([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    loadHistory();
  }, [loadHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  const resolveUrl = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const tryonImageUrl = item.source === 'tryon' ? resolveUrl(item.result_photo_url) : null;

    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 60, 300))}>
        <View style={styles.historyCard}>
          {item.source === 'store' ? (
            <StoreHistoryThumb
              resultId={item.id}
              hasDownload={item.has_download === true}
              style={styles.historyImage}
              placeholderStyle={[styles.historyImagePlaceholder]}
            />
          ) : tryonImageUrl ? (
            <Image source={{ uri: tryonImageUrl }} style={styles.historyImage} contentFit="cover" transition={200} />
          ) : (
            <View style={[styles.historyImage, styles.historyImagePlaceholder]}>
              <Ionicons name="image-outline" size={32} color={Colors.light.textMuted} />
            </View>
          )}
          <View style={styles.historyInfo}>
            <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
            {item.product_name ? (
              <Text style={styles.historyProduct} numberOfLines={2}>
                {item.product_name}
              </Text>
            ) : null}
            <View
              style={[
                styles.statusBadge,
                item.status === 'completed' ? styles.statusCompleted : styles.statusPending,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  item.status === 'completed' ? styles.statusTextCompleted : styles.statusTextPending,
                ]}>
                {item.status === 'completed' ? 'Completed' : item.status || 'Generated'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.charcoal} />
        </Pressable>
        <Text style={styles.headerTitle}>Try-On History</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabRow}>
        {(['tryon', 'store'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'tryon' ? 'Virtual Try-On' : 'Store Try-On'}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.gold} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.source}-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.gold} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={48} color={Colors.light.textMuted} />
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptyDesc}>
                Your try-on results will appear here after you generate them.
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/tryon')} style={styles.emptyButton}>
                <LinearGradient
                  colors={['#c9a96e', '#e8c98a']}
                  style={styles.emptyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.emptyButtonText}>Try Something On</Text>
                </LinearGradient>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
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
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.light.charcoal },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.light.charcoal, borderColor: Colors.light.charcoal },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.light.textSecondary },
  tabTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyImage: {
    width: 100,
    height: 120,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  historyImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  historyDate: {
    fontSize: FontSize.xs,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  historyProduct: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.light.charcoal,
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusCompleted: { backgroundColor: Colors.light.success + '15' },
  statusPending: { backgroundColor: Colors.light.warning + '15' },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  statusTextCompleted: { color: Colors.light.success },
  statusTextPending: { color: Colors.light.warning },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.light.charcoal,
    marginTop: Spacing.base,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.xl,
    width: '100%',
  },
  emptyButtonGradient: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  emptyButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#1a1a2e',
  },
});
