/**
 * Region Settings Screen
 * Allows users to select their preferred region (US or Indonesia)
 */

import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRegion } from '@/hooks/use-region';
import { RegionCode, REGION_CONFIGS, ALL_REGIONS } from '@/types/region';
import { useThemeManager } from '@/hooks/use-theme-manager';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

export default function RegionSettingsScreen() {
  console.log('🌍 RegionSettingsScreen component loaded');

  const { currentRegion, regionConfig, setRegion } = useRegion();
  const { colorScheme } = useThemeManager();
  const colors = Colors[colorScheme];

  console.log('📍 Current region in RegionSettingsScreen:', currentRegion);
  console.log('🏛️ Region config in RegionSettingsScreen:', regionConfig);

  const handleRegionSelect = (region: RegionCode) => {
    console.log(`🔄 Region selected: ${region} (${REGION_CONFIGS[region].name})`);

    // Skip confirmation if selecting the same region
    if (currentRegion === region) {
      Alert.alert('Region Already Selected', `Your region is already set to ${REGION_CONFIGS[region].name}.`);
      return;
    }

    const selectedRegionName = REGION_CONFIGS[region].name;
    const currentRegionName = REGION_CONFIGS[currentRegion].name;

    Alert.alert(
      '⚠️ Warning: Region Change Will Delete Data',
      `Changing your region from ${currentRegionName} to ${selectedRegionName} will:\n\n• 🗑️ Delete ALL existing vehicle records\n• 🗑️ Delete ALL service history\n• 🗑️ Delete ALL fuel tracking data\n• 🗑️ Reset ALL app settings and preferences\n\nThis action cannot be undone. All your data will be permanently lost.\n\nAre you absolutely sure you want to continue?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('❌ Region change cancelled by user');
          },
        },
        {
          text: 'Delete All Data & Continue',
          style: 'destructive',
          onPress: async () => {
            // Double confirmation for destructive action
            Alert.alert(
              '🚨 Final Confirmation Required',
              `This is your FINAL WARNING.\n\nAfter changing to ${selectedRegionName}:\n\n• All vehicles will be deleted\n• All service records will be deleted\n• All fuel logs will be deleted\n• There is NO WAY to recover this data\n\nType "DELETE" to confirm or press Cancel to abort.`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => {
                    console.log('❌ Region change cancelled at final confirmation');
                  },
                },
                {
                  text: 'I Understand - Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      console.log('⏳ Setting region after confirmation...');
                      await setRegion(region);
                      console.log('✅ Region set successfully');

                      Alert.alert(
                        'Region Updated',
                        `Your region has been set to ${selectedRegionName}.\n\nCurrency and units will now be displayed in ${region === 'ID' ? 'Indonesian Rupiah and metric units' : 'US Dollars and imperial units'}.\n\nAll previous data has been permanently deleted.`,
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              console.log('⬅️ Navigating back to settings');
                              router.back();
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      console.error('❌ Error updating region:', error);
                      Alert.alert('Error', 'Failed to update region setting');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Region Settings
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Select your preferred currency and measurement units
          </ThemedText>
        </View>

        <View style={styles.warningSection}>
          <View style={[styles.warningCard, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1 }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#DC2626" />
            <View style={styles.warningContent}>
              <ThemedText style={[styles.warningTitle, { color: '#DC2626' }]}>
                ⚠️ Important Warning
              </ThemedText>
              <ThemedText style={[styles.warningText, { color: '#991B1B' }]}>
                Changing regions will PERMANENTLY DELETE all your data including vehicles, service history, and fuel records. This action CANNOT be undone.
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="info.circle" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <ThemedText style={[styles.infoTitle, { color: colors.text }]}>
                Why select a region?
              </ThemedText>
              <ThemedText style={[styles.infoText, { color: colors.icon }]}>
                Your selection determines currency format and measurement units throughout the app.
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.icon }]}>
            Select Region
          </ThemedText>
          <View style={styles.sectionItems}>
            {ALL_REGIONS.map((regionCode) => {
              const config = REGION_CONFIGS[regionCode];
              const isSelected = currentRegion === regionCode;

              return (
                <TouchableOpacity
                  key={regionCode}
                  style={[
                    styles.regionOption,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleRegionSelect(regionCode)}
                >
                  <View style={styles.regionLeft}>
                    <ThemedText style={styles.flag}>{config.flag}</ThemedText>
                    <View style={styles.regionInfo}>
                      <ThemedText style={[styles.regionName, { color: colors.text }]}>
                        {config.name}
                      </ThemedText>
                      <ThemedText style={[styles.regionDetails, { color: colors.icon }]}>
                        {config.currency.symbol} {config.currency.name} • {config.volume.label} • {config.distance.label}
                      </ThemedText>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                      <IconSymbol name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.currentSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.icon }]}>
            Current Selection
          </ThemedText>
          <View style={[styles.currentCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <View style={styles.currentInfo}>
              <ThemedText style={styles.currentFlag}>{regionConfig.flag}</ThemedText>
              <View style={styles.currentDetails}>
                <ThemedText style={[styles.currentName, { color: colors.text }]}>
                  {regionConfig.name}
                </ThemedText>
                <ThemedText style={[styles.currentSpecs, { color: colors.icon }]}>
                  Currency: {regionConfig.currency.symbol} {regionConfig.currency.code}
                </ThemedText>
                <ThemedText style={[styles.currentSpecs, { color: colors.icon }]}>
                  Volume: {regionConfig.volume.label} ({regionConfig.volume.abbreviation})
                </ThemedText>
                <ThemedText style={[styles.currentSpecs, { color: colors.icon }]}>
                  Distance: {regionConfig.distance.label} ({regionConfig.distance.abbreviation})
                </ThemedText>
                <ThemedText style={[styles.currentSpecs, { color: colors.icon }]}>
                  Efficiency: {regionConfig.efficiency.label}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  warningSection: {
    marginBottom: Spacing.lg,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    gap: Spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs / 2,
  },
  warningText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
    lineHeight: 18,
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs / 2,
  },
  infoText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
    lineHeight: 18,
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
  regionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    minHeight: 80,
  },
  regionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  flag: {
    fontSize: 32,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs / 2,
  },
  regionDetails: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentSection: {
    marginBottom: Spacing.xl,
  },
  currentCard: {
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 2,
  },
  currentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  currentFlag: {
    fontSize: 40,
  },
  currentDetails: {
    flex: 1,
  },
  currentName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  currentSpecs: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.normal,
    marginBottom: Spacing.xs / 2,
  },
});