import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { apiGet, API_URL } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - Spacing.xl * 2 - Spacing.md) / 2;

interface Store {
  id: number;
  name: string;
  logo_url: string | null;
  product_count: number;
}

interface Product {
  id: number;
  name: string;
  brand: string | null;
  image_url: string;
  price: string | null;
  gender: string;
  source_url?: string | null;
  store_name?: string | null;
  store_id?: number;
}

export default function ShopScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gender, setGender] = useState<'all' | 'men' | 'women'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 10;

  const loadData = async (reset = true) => {
    if (reset) {
      setPage(0);
      setHasMore(true);
    }
    const currentPage = reset ? 0 : page;

    console.log('[SHOP] Loading store data...');
    const storeRes = await apiGet<Store[]>('/api/store/brands');
    const brandList = storeRes.ok && storeRes.data ? storeRes.data : [];
    console.log('[SHOP] Brands loaded:', brandList.length);
    setStores(brandList);

    let newProducts: Product[] = [];

    if (selectedStore) {
      let url = `/api/store/brands/${selectedStore}/products?limit=${PAGE_SIZE}&offset=${currentPage * PAGE_SIZE}`;
      if (gender !== 'all') url += `&gender=${gender}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const prodRes = await apiGet<Product[]>(url);
      if (prodRes.ok && prodRes.data) {
        newProducts = prodRes.data;
        if (prodRes.data.length < PAGE_SIZE) setHasMore(false);
      }
    } else if (brandList.length > 0) {
      const fetches = brandList.map(async (store) => {
        let url = `/api/store/brands/${store.id}/products?limit=${PAGE_SIZE}&offset=${currentPage * PAGE_SIZE}`;
        if (gender !== 'all') url += `&gender=${gender}`;
        if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
        const res = await apiGet<Product[]>(url);
        return res.ok && res.data ? res.data : [];
      });
      const results = await Promise.all(fetches);
      newProducts = results.flat();
      if (newProducts.length < PAGE_SIZE) setHasMore(false);
    }

    console.log('[SHOP] Products loaded:', newProducts.length, 'page:', currentPage);

    if (reset) {
      setProducts(newProducts);
    } else {
      setProducts((prev) => [...prev, ...newProducts]);
    }

    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    loadData(true);
  }, [selectedStore, gender]);

  useEffect(() => {
    if (page > 0) loadData(false);
  }, [page]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [selectedStore, gender, search]);

  const handleSearch = () => {
    setLoading(true);
    loadData(true);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    setPage((prev) => prev + 1);
  };

  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 50, 400))}>
      <Pressable
        onPress={() => router.push(`/store-tryon?product=${item.id}&store=${item.store_id || ''}`)}
        style={styles.productCard}>
        <Image
          source={{ uri: resolveImageUrl(item.image_url) }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          {item.store_name && (
            <Text style={styles.productBrand} numberOfLines={1}>{item.store_name}</Text>
          )}
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.productBottom}>
            {item.price ? (
              <Text style={styles.productPrice}>{item.price}</Text>
            ) : <View />}
            <View style={styles.tryOnBadge}>
              <Ionicons name="shirt-outline" size={12} color={Colors.light.gold} />
              <Text style={styles.tryOnBadgeText}>Try On</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Fashion Store</Text>
            <Text style={styles.headerSub}>{products.length} products from {stores.length} brands</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="storefront" size={20} color={Colors.light.gold} />
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.light.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => { setSearch(''); handleSearch(); }}>
            <Ionicons name="close-circle" size={20} color={Colors.light.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Gender Filter */}
      <View style={styles.filterRow}>
        {(['all', 'women', 'men'] as const).map((g) => (
          <Pressable
            key={g}
            onPress={() => setGender(g)}
            style={[styles.filterChip, gender === g && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, gender === g && styles.filterChipTextActive]}>
              {g === 'all' ? 'All' : g === 'women' ? 'Women' : 'Men'}
            </Text>
          </Pressable>
        ))}
      </View>

      {!selectedStore && (
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={styles.brandSection}>
            <Text style={styles.brandSectionTitle}>Shop by Brand</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandCardScroll}>
              {stores.map((store) => (
                <Pressable
                  key={store.id}
                  onPress={() => setSelectedStore(store.id)}
                  style={styles.brandCard}>
                  {store.logo_url ? (
                    <Image
                      source={{ uri: resolveImageUrl(store.logo_url) }}
                      style={styles.brandCardLogo}
                    />
                  ) : (
                    <View style={styles.brandCardLogoPlaceholder}>
                      <Ionicons name="storefront" size={28} color={Colors.light.gold} />
                    </View>
                  )}
                  <Text style={styles.brandCardName} numberOfLines={1}>
                    {store.name}
                  </Text>
                  <Text style={styles.brandCardCount}>{store.product_count} products</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {selectedStore && (
        <View style={styles.selectedBrandBar}>
          <Text style={styles.selectedBrandName}>
            {stores.find((s) => s.id === selectedStore)?.name || 'Store'}
          </Text>
          <Pressable onPress={() => setSelectedStore(null)} style={styles.selectedBrandClose}>
            <Ionicons name="close-circle" size={22} color={Colors.light.textMuted} />
            <Text style={styles.selectedBrandCloseText}>All Brands</Text>
          </Pressable>
        </View>
      )}

      {/* Product Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.gold} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={Colors.light.gold} />
                <Text style={styles.loadMoreText}>Loading more products...</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.gold} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={48} color={Colors.light.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.light.charcoal },
  headerSub: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 2 },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    paddingHorizontal: Spacing.md,
    height: 46,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.light.text },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: { backgroundColor: Colors.light.charcoal, borderColor: Colors.light.charcoal },
  filterChipText: { fontSize: FontSize.sm, color: Colors.light.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  brandSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  brandSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.light.charcoal,
    marginBottom: Spacing.md,
  },
  brandCardScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },
  brandCard: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  brandCardLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  brandCardLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  brandCardName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.light.charcoal,
    textAlign: 'center',
  },
  brandCardCount: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  selectedBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.gold + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  selectedBrandName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.light.charcoal,
  },
  selectedBrandClose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedBrandCloseText: {
    fontSize: FontSize.sm,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  loadMoreContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadMoreText: {
    fontSize: FontSize.xs,
    color: Colors.light.textMuted,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  productList: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: 120 },
  productRow: { gap: Spacing.md, marginBottom: Spacing.base },
  productCard: {
    width: PRODUCT_WIDTH,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: PRODUCT_WIDTH * 1.2,
    resizeMode: 'cover',
    backgroundColor: Colors.light.surfaceSecondary,
  },
  productInfo: { padding: Spacing.sm },
  productBrand: { fontSize: FontSize.xs, color: Colors.light.gold, fontWeight: '600', marginBottom: 2 },
  productName: { fontSize: FontSize.sm, color: Colors.light.charcoal, fontWeight: '500', lineHeight: 18 },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productPrice: { fontSize: FontSize.sm, color: Colors.light.charcoal, fontWeight: '700' },
  tryOnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.light.gold + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tryOnBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.light.gold },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: FontSize.base, color: Colors.light.textMuted, marginTop: Spacing.md },
});
