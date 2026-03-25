import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { apiGet, apiFetch } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

type Section = 'main' | 'measurements' | 'settings' | 'notifications';

interface Measurements {
  height: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  shoulder_cm: number | null;
  unit: 'cm' | 'in';
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<Section>('main');
  const [measurements, setMeasurements] = useState<Measurements>({
    height: null,
    chest_cm: null,
    waist_cm: null,
    shoulder_cm: null,
    unit: 'cm',
  });
  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [promoNotifications, setPromoNotifications] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    const res = await apiGet<Measurements>('/api/user/measurements');
    if (res.ok && res.data) {
      setMeasurements(res.data);
    }
  };

  const saveMeasurements = async () => {
    setSavingMeasurements(true);
    const response = await apiFetch('/api/user/measurements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(measurements),
    });
    setSavingMeasurements(false);
    if (response.ok) {
      Alert.alert('Saved', 'Measurements updated successfully.');
      setSection('main');
    } else {
      Alert.alert('Error', 'Could not save measurements.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'User';

  if (section === 'measurements') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setSection('main')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.charcoal} />
          </Pressable>
          <Text style={styles.sectionTitle}>Body Measurements</Text>
          <Text style={styles.sectionDesc}>Used for size recommendations</Text>

          {/* Unit toggle */}
          <View style={styles.unitRow}>
            {(['cm', 'in'] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => setMeasurements({ ...measurements, unit: u })}
                style={[styles.unitButton, measurements.unit === u && styles.unitButtonActive]}>
                <Text style={[styles.unitText, measurements.unit === u && styles.unitTextActive]}>
                  {u === 'cm' ? 'Centimeters' : 'Inches'}
                </Text>
              </Pressable>
            ))}
          </View>

          {[
            { key: 'height' as const, label: 'Height', icon: 'resize-outline' as const },
            { key: 'chest_cm' as const, label: 'Chest', icon: 'body-outline' as const },
            { key: 'waist_cm' as const, label: 'Waist', icon: 'ellipse-outline' as const },
            { key: 'shoulder_cm' as const, label: 'Shoulder', icon: 'arrow-expand-outline' as const },
          ].map(({ key, label, icon }) => (
            <View key={key} style={styles.measureField}>
              <View style={styles.measureLabelRow}>
                <Ionicons name={icon as any} size={18} color={Colors.light.gold} />
                <Text style={styles.measureLabel}>{label}</Text>
              </View>
              <View style={styles.measureInputRow}>
                <TextInput
                  style={styles.measureInput}
                  placeholder="0"
                  placeholderTextColor={Colors.light.textMuted}
                  value={measurements[key] != null ? String(measurements[key]) : ''}
                  onChangeText={(t) =>
                    setMeasurements({ ...measurements, [key]: t ? parseFloat(t) : null })
                  }
                  keyboardType="numeric"
                />
                <Text style={styles.measureUnit}>{measurements.unit}</Text>
              </View>
            </View>
          ))}

          <Pressable onPress={saveMeasurements} disabled={savingMeasurements} style={styles.saveButton}>
            <LinearGradient
              colors={['#c9a96e', '#e8c98a']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {savingMeasurements ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.saveButtonText}>Save Measurements</Text>
              )}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (section === 'notifications') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setSection('main')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.charcoal} />
          </Pressable>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionDesc}>Manage your notification preferences</Text>

          <View style={styles.notifRow}>
            <View style={styles.notifInfo}>
              <View style={[styles.menuItemIconBg, { marginRight: Spacing.md }]}>
                <Ionicons name="notifications-outline" size={20} color={Colors.light.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifLabel}>Push Notifications</Text>
                <Text style={styles.notifDesc}>Enable all push notifications</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.gold + '60' }}
              thumbColor={notificationsEnabled ? Colors.light.gold : '#f4f3f4'}
            />
          </View>

          <View style={styles.notifRow}>
            <View style={styles.notifInfo}>
              <View style={[styles.menuItemIconBg, { marginRight: Spacing.md }]}>
                <Ionicons name="image-outline" size={20} color={Colors.light.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifLabel}>Generation Complete</Text>
                <Text style={styles.notifDesc}>Notify when try-on images are ready</Text>
              </View>
            </View>
            <Switch
              value={resultNotifications}
              onValueChange={setResultNotifications}
              trackColor={{ false: Colors.light.border, true: Colors.light.gold + '60' }}
              thumbColor={resultNotifications ? Colors.light.gold : '#f4f3f4'}
            />
          </View>

          <View style={styles.notifRow}>
            <View style={styles.notifInfo}>
              <View style={[styles.menuItemIconBg, { marginRight: Spacing.md }]}>
                <Ionicons name="megaphone-outline" size={20} color={Colors.light.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifLabel}>Promotions & Tips</Text>
                <Text style={styles.notifDesc}>Style tips and special offers</Text>
              </View>
            </View>
            <Switch
              value={promoNotifications}
              onValueChange={setPromoNotifications}
              trackColor={{ false: Colors.light.border, true: Colors.light.gold + '60' }}
              thumbColor={promoNotifications ? Colors.light.gold : '#f4f3f4'}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.profileHeader}>
          <LinearGradient colors={['#c9a96e', '#e8c98a']} style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{firstName.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          {user?.is_pro ? (
            <View style={styles.proBadge}>
              <Ionicons name="diamond" size={14} color="#e8c98a" />
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          ) : (
            <Pressable style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>Free Plan</Text>
              <Text style={styles.upgradeText}>Upgrade</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Menu Items */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>

          <MenuItem
            icon="body-outline"
            label="Body Measurements"
            desc="Size recommendations"
            onPress={() => setSection('measurements')}
          />
          <MenuItem
            icon="time-outline"
            label="Try-On History"
            desc="Your past generations"
            onPress={() => router.push('/tryon-history')}
          />
          <MenuItem
            icon="card-outline"
            label="Subscription"
            desc={user?.is_pro ? 'Pro Plan' : 'Free Plan'}
            onPress={() => Alert.alert('Subscription', user?.is_pro ? 'You are on the Pro Plan with unlimited try-ons and HD quality.' : 'Upgrade to Pro for unlimited try-ons, HD quality, and exclusive features.')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Preferences</Text>

          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            desc="Manage push notifications"
            onPress={() => setSection('notifications')}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacy"
            desc="Data & privacy settings"
            onPress={() => router.push('/privacy-policy')}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            desc="FAQ and contact us"
            onPress={() => router.push('/contact-us')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About"
            desc="App info and version"
            onPress={() => router.push('/about')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={Colors.light.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  desc,
  onPress,
}: {
  icon: string;
  label: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuItemIconBg}>
        <Ionicons name={icon as any} size={20} color={Colors.light.gold} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemLabel}>{label}</Text>
        <Text style={styles.menuItemDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.light.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.light.charcoal },
  sectionDesc: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 4, marginBottom: Spacing.xl },
  unitRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  unitButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  unitButtonActive: { backgroundColor: Colors.light.charcoal, borderColor: Colors.light.charcoal },
  unitText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.light.textSecondary },
  unitTextActive: { color: '#fff' },
  measureField: { marginBottom: Spacing.lg },
  measureLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  measureLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.light.charcoal },
  measureInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  measureInput: { flex: 1, fontSize: FontSize.md, color: Colors.light.text },
  measureUnit: { fontSize: FontSize.sm, color: Colors.light.textMuted, fontWeight: '500' },
  saveButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.lg,
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonGradient: { paddingVertical: Spacing.base, alignItems: 'center' },
  saveButtonText: { fontSize: FontSize.md, fontWeight: '700', color: '#1a1a2e' },
  profileHeader: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarLargeText: { fontSize: FontSize['2xl'], fontWeight: '800', color: '#1a1a2e' },
  profileName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.light.charcoal },
  profileEmail: { fontSize: FontSize.sm, color: Colors.light.textSecondary, marginTop: 2 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: Colors.light.charcoal,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  proBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: '#e8c98a' },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  freeBadgeText: { fontSize: FontSize.xs, color: Colors.light.textSecondary },
  upgradeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.light.gold },
  menuSection: { marginBottom: Spacing.xl },
  menuSectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuItemIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.gold + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: { flex: 1 },
  menuItemLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.light.charcoal },
  menuItemDesc: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.danger + '30',
    marginTop: Spacing.base,
  },
  logoutText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.light.danger },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  notifInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notifLabel: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.light.charcoal,
  },
  notifDesc: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
