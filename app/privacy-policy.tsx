import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={18} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          Privacy Policy
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Privacy Policy for MyVenti
          </ThemedText>

          <ThemedText style={[styles.sectionSubtitle, { color: colors.icon }]}>
            Last updated: {new Date().toLocaleDateString()}
          </ThemedText>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Data Collection and Usage
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              MyVenti is designed with your privacy in mind. We are committed to protecting your personal information and being transparent about our data practices.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Information We Collect
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Vehicle information (make, model, year, license plate)
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Fuel records (date, amount, cost, location)
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Service and maintenance records
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Scanner images for fuel receipts (processed locally)
              </ThemedText>
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              How We Use Your Information
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Track your vehicle's fuel consumption and expenses
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Provide maintenance reminders and service history
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Generate expense reports and usage statistics
              </ThemedText>
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Data Storage and Security
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              All your data is stored locally on your device and is not transmitted to external servers unless you explicitly choose to export or backup your data.
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              Scanner images are processed locally on your device using optical character recognition (OCR) to extract fuel receipt information. The images and extracted data remain on your device.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Permissions Required
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                <ThemedText style={[styles.bold, { color: colors.text }]}>Camera:</ThemedText> To scan fuel receipts
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                <ThemedText style={[styles.bold, { color: colors.text }]}>Storage:</ThemedText> To save vehicle data and scanned images locally
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                <ThemedText style={[styles.bold, { color: colors.text }]}>Internet:</ThemedText> Only used for app updates and optional features
              </ThemedText>
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              No Third-Party Data Collection
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              We do not collect, store, or share your personal information with third parties for advertising or marketing purposes. We do not use analytics services that track your usage patterns.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Logging
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              The app may collect basic logging information for debugging purposes, such as crash reports and performance metrics. This information is anonymous and does not contain any personal or vehicle data.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Your Rights
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Access: You can view all your data within the app
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Export: You can export your data at any time
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Delete: You can delete all your data from the app settings
              </ThemedText>
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Contact Us
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              If you have any questions about this Privacy Policy or how we handle your data, please contact us through the app's support section.
            </ThemedText>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.small,
    fontWeight: Typography.weights.normal,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  section: {
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    marginBottom: Spacing.md,
  },
  heading: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
  },
  content: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.normal,
    lineHeight: 22,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
  },
  bullet: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.normal,
    marginRight: Spacing.xs,
  },
  bulletText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.normal,
    lineHeight: 22,
    flex: 1,
  },
  bold: {
    fontWeight: Typography.weights.semibold,
  },
});