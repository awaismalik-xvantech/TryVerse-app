import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/lib/auth';
import { registerForPushNotifications } from '@/lib/notifications';
import 'react-native-reanimated';

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="store-tryon" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="privacy-policy" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="contact-us" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="about" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="tryon-history" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
