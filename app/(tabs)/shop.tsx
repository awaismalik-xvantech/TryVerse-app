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
} from 'react-native';
import { useRouter } from 'expo-router';
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

  const loadData = async () => {
    const storeRes = await apiGet<Store[]>('/api/store/stores');
    if (storeRes.ok && storeRes.data) setStores(storeRes.data);

    let url = '/api/store/products?page=1&per_page=50';
    if (selectedStore) url += `&store_id=${selectedStore}`;
    if (gender !== 'all') url += `&gender=${gender}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    const prodRes = await apiGet<{ products: Product[] }>(url);
    if (prodRes.ok && prodRes.data) setProducts(prodRes.data.products || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, [selectedStore, gender]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [selectedStore, gender, search]);

  const handleSearch = () => {
    setLoading(true);
    loadData();
  };

  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50)}>
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
          {item.price && (
            <Text style={styles.productPrice}>{item.price}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fashion Store</Text>
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

      {/* Store filter */}
      <FlatList
        data={[{ id: 0, name: 'All Stores', logo_url: null, product_count: 0 }, ...stores]}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedStore(item.id === 0 ? null : item.id)}
            style={[
              styles.storeChip,
              (item.id === 0 && !selectedStore) || selectedStore === item.id
                ? styles.storeChipActive
                : null,
            ]}>
            <Text
              style={[
                styles.storeChipText,
                (item.id === 0 && !selectedStore) || selectedStore === item.id
                  ? styles.storeChipTextActive
                  : null,
              ]}
              numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        )}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storeFilterRow}
        style={styles.storeFilterList}
      />

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
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.light.charcoal },
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
  storeFilterList: { maxHeight: 44, marginTop: Spacing.md },
  storeFilterRow: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  storeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  storeChipActive: { backgroundColor: Colors.light.gold, borderColor: Colors.light.gold },
  storeChipText: { fontSize: FontSize.xs, color: Colors.light.textSecondary, fontWeight: '500' },
  storeChipTextActive: { color: Colors.light.charcoal, fontWeight: '700' },
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
  productPrice: { fontSize: FontSize.sm, color: Colors.light.charcoal, fontWeight: '700', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: FontSize.base, color: Colors.light.textMuted, marginTop: Spacing.md },
});
