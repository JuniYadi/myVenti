import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '../hooks/use-auth';
import { RegionProvider } from '../hooks/use-region';
import { ThemeProvider, useColorScheme } from '../hooks/use-theme-manager';
import { AppInitializer } from '../components/AppInitializer';
import { ProviderErrorBoundary } from '../components/ErrorBoundary';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'welcome' || segments[0] === 'login' || segments[0] === 'signup';

    if (user && inAuthGroup) {
      // User is signed in but on auth screen, redirect to main app
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      // User is not signed in but trying to access protected route
      router.replace('/welcome');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff' }]}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#007AFF'} />
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="region-settings" options={{ title: 'Region Settings', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppInitializer>
        <ProviderErrorBoundary
          onError={(error, errorInfo) => {
            console.error('ThemeProvider error:', error, errorInfo);
          }}
        >
          <ThemeProvider>
            <ProviderErrorBoundary
              onError={(error, errorInfo) => {
                console.error('RegionProvider error:', error, errorInfo);
              }}
            >
              <RegionProvider>
                <ProviderErrorBoundary
                  onError={(error, errorInfo) => {
                    console.error('AuthProvider error:', error, errorInfo);
                  }}
                >
                  <AuthProvider>
                    <RootLayoutContent />
                  </AuthProvider>
                </ProviderErrorBoundary>
              </RegionProvider>
            </ProviderErrorBoundary>
          </ThemeProvider>
        </ProviderErrorBoundary>
        <StatusBar style="auto" />
      </AppInitializer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
