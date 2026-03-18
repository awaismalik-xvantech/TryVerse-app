import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/lib/auth';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tryon" options={{ presentation: 'modal' }} />
        <Stack.Screen name="store-tryon" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
