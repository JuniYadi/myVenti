import { Stack } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomTabNavigator } from '@/components/navigation/custom-tab-navigator';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors[colorScheme].background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="vehicle" options={{ title: 'Vehicles' }} />
        <Stack.Screen name="fuel" options={{ title: 'Fuel' }} />
        <Stack.Screen name="service" options={{ title: 'Service' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      </Stack>

      <CustomTabNavigator />
    </>
  );
}
