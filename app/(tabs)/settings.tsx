import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Switch,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [locationTracking, setLocationTracking] = useState(true);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon.fill',
          title: 'Dark Mode',
          subtitle: 'Use dark theme across the app',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: 'bell.fill',
          title: 'Notifications',
          subtitle: 'Service reminders and alerts',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: 'location.fill',
          title: 'Location Tracking',
          subtitle: 'Track vehicle location',
          type: 'toggle',
          value: locationTracking,
          onToggle: setLocationTracking,
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
          onPress: () => console.log('Clear cache'),
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
    return (
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
              onValueChange={item.onToggle}
              trackColor={{
                false: colors.border,
                true: colors.primary + '40',
              }}
              thumbColor={item.value ? colors.primary : colors.icon}
              ios_backgroundColor={colors.border}
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