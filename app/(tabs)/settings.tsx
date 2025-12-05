import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Switch,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeManager } from '@/hooks/use-theme-manager';
import { useRegion } from '@/hooks/use-region';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { DataService } from '@/services/DataService';

export default function SettingsScreen() {
  const { themeMode, colorScheme, setThemeMode, isLoading } = useThemeManager();
  const { regionConfig, currentRegion } = useRegion();
  const colors = Colors[colorScheme];

  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  
  // Initialize dark mode state based on theme manager
  const darkMode = themeMode === 'dark' || (themeMode === 'system' && colorScheme === 'dark');

  const handleDarkModeToggle = (value: boolean) => {
    if (value) {
      // Enable dark mode
      if (colorScheme === 'dark') {
        // System is already dark, use system mode
        setThemeMode('system');
      } else {
        // System is light, force dark mode
        setThemeMode('dark');
      }
    } else {
      // Disable dark mode
      if (colorScheme === 'light') {
        // System is already light, use system mode
        setThemeMode('system');
      } else {
        // System is dark, force light mode
        setThemeMode('light');
      }
    }
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon.fill',
          title: 'Dark Mode',
          subtitle: themeMode === 'system'
            ? 'Follow system theme'
            : `Force ${themeMode === 'dark' ? 'dark' : 'light'} mode`,
          type: 'toggle',
          value: darkMode,
          onToggle: handleDarkModeToggle,
          disabled: isLoading,
        },
        {
          icon: 'globe',
          title: 'Region & Currency',
          subtitle: `${regionConfig.flag} ${regionConfig.currency.name} - ${regionConfig.volume.label}`,
          type: 'action',
          onPress: () => {
            console.log('🌍 Region & Currency clicked');
            console.log('📍 Current region:', currentRegion);
            console.log('🏛️ Region config:', regionConfig);
            console.log('🔄 Navigating to /region-settings');

            try {
              router.push('/region-settings');
              console.log('✅ Navigation initiated successfully');
            } catch (error) {
              console.error('❌ Navigation failed:', error);
              Alert.alert('Error', 'Failed to open region settings');
            }
          },
        },
        {
          icon: 'bell.fill',
          title: 'Notifications',
          subtitle: 'Service reminders and alerts',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: 'icloud.fill',
          title: 'Auto Backup',
          subtitle: 'Sync data to cloud automatically',
          type: 'toggle',
          value: autoBackup,
          onToggle: setAutoBackup,
        },
        {
          icon: 'doc.text.fill',
          title: 'Export Data',
          subtitle: 'Download your vehicle records',
          type: 'action',
          onPress: () => console.log('Export data'),
        },
        {
          icon: 'trash.fill',
          title: 'Clear Cache',
          subtitle: 'Free up app storage space',
          type: 'action',
          onPress: async () => {
            console.log('🗑️ Clear Cache button pressed');

            Alert.alert(
              'Clear All Data?',
              'This will permanently delete ALL your data including:\n\n• All vehicles\n• All fuel entries\n• All service records\n\nThis action cannot be undone. Are you sure?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => {
                    console.log('❌ Cache clearing cancelled by user');
                  },
                },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      console.log('⏳ Starting to clear all cache data...');

                      // Get current data stats before clearing
                      const beforeStats = await DataService.getDataStats();
                      console.log('📊 Data stats before clearing:', beforeStats);

                      // Clear all data
                      await DataService.clearAllData();

                      // Get data stats after clearing to confirm
                      const afterStats = await DataService.getDataStats();
                      console.log('📊 Data stats after clearing:', afterStats);

                      Alert.alert(
                        'Cache Cleared',
                        `All app data has been successfully deleted.\n\nCleared:\n• ${beforeStats.vehiclesCount} vehicles\n• ${beforeStats.fuelEntriesCount} fuel entries\n• ${beforeStats.serviceRecordsCount} service records\n\nYou can start fresh by adding new vehicles.`,
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              console.log('✅ Cache clearing completed successfully');
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      console.error('❌ Error clearing cache:', error);
                      Alert.alert('Error', 'Failed to clear cache. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'info.circle.fill',
          title: 'App Version',
          subtitle: '1.0.0',
          type: 'info',
        },
        {
          icon: 'questionmark.circle.fill',
          title: 'Help & Support',
          subtitle: 'Get help with the app',
          type: 'action',
          onPress: () => console.log('Open help'),
        },
        {
          icon: 'doc.text.fill',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'action',
          onPress: () => Linking.openURL('https://example.com/privacy'),
        },
        {
          icon: 'doc.text.fill',
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          type: 'action',
          onPress: () => Linking.openURL('https://example.com/terms'),
        },
      ],
    },
  ];

  const renderSettingsItem = (item: any, index: number) => {
    const itemContent = (
      <View
        key={index}
        style={[
          styles.settingItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <IconSymbol
              name={item.icon as any}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.settingInfo}>
            <ThemedText
              style={[styles.settingTitle, { color: colors.text }]}
            >
              {item.title}
            </ThemedText>
            <ThemedText
              style={[styles.settingSubtitle, { color: colors.icon }]}
            >
              {item.subtitle}
            </ThemedText>
          </View>
        </View>

        <View style={styles.settingRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.disabled ? undefined : item.onToggle}
              trackColor={{
                false: colors.border,
                true: colors.primary + '40',
              }}
              thumbColor={item.value ? colors.primary : colors.icon}
              ios_backgroundColor={colors.border}
              disabled={item.disabled}
            />
          )}
          {item.type === 'action' && (
            <IconSymbol
              name="chevron.right"
              size={16}
              color={colors.icon}
            />
          )}
        </View>
      </View>
    );

    if (item.type === 'action' && item.onPress) {
      return (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          {itemContent}
        </TouchableOpacity>
      );
    }

    return itemContent;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Settings
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Customize your app experience
          </ThemedText>
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.icon }]}
            >
              {section.title}
            </ThemedText>
            <View style={styles.sectionItems}>
              {section.items.map((item: any, itemIndex: number) =>
                renderSettingsItem(item, itemIndex)
              )}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: colors.icon }]}>
            Vehicle Tracking App v1.0.0
          </ThemedText>
          <ThemedText style={[styles.footerText, { color: colors.icon }]}>
            Made with ❤️ for better vehicle management
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Spacing.navigation.tabBarHeight + Spacing.md,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.normal,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  sectionItems: {
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    minHeight: 60,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs / 2,
  },
  settingSubtitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
  },
  settingRight: {
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.normal,
    textAlign: 'center',
  },
});