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

export default function TermsOfServiceScreen() {
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
          Terms of Service
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
            Terms of Service for MyVenti
          </ThemedText>

          <ThemedText style={[styles.sectionSubtitle, { color: colors.icon }]}>
            Last updated: {new Date().toLocaleDateString()}
          </ThemedText>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Acceptance of Terms
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              By downloading, installing, or using MyVenti ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Description of Service
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              MyVenti is a mobile application designed to help you track your vehicle's fuel consumption, maintenance records, and related expenses. The App allows you to:
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Track fuel purchases and expenses
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Monitor vehicle maintenance schedules
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Scan and process fuel receipts
              </ThemedText>
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Use of the App
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              You agree to use the App only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the accuracy of the information you enter into the App.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Privacy and Data Protection
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information. By using the App, you consent to the collection and use of information as described in our Privacy Policy.
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              Key points:
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                All data is stored locally on your device
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                No personal data is collected or shared with third parties
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                Scanner images are processed locally and not transmitted
              </ThemedText>
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Permissions and Device Access
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              The App requires certain permissions to function properly:
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                <ThemedText style={[styles.bold, { color: colors.text }]}>Camera Access:</ThemedText> Required to scan fuel receipts for automatic data entry
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                <ThemedText style={[styles.bold, { color: colors.text }]}>Storage Access:</ThemedText> Required to save your vehicle data and scanned images locally
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              <ThemedText style={[styles.bullet, { color: colors.text }]}>• </ThemedText>
              <ThemedText style={[styles.bulletText, { color: colors.text }]}>
                <ThemedText style={[styles.bold, { color: colors.text }]}>Internet Access:</ThemedText> Only used for app updates and optional features
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              You grant permission for these features to be used solely for the purposes described.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Intellectual Property
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              The App and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Limitation of Liability
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the App.
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              The App is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Data Accuracy
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              While we strive to provide accurate OCR processing for scanned receipts, we cannot guarantee 100% accuracy. You are responsible for verifying and correcting any data extracted from scanned images.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Termination
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              We may terminate or suspend your access to the App immediately, without prior notice, for any reason whatsoever, including breach of these Terms.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Changes to Terms
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you within the App or by other means. Your continued use of the App after such modifications constitutes acceptance of the updated Terms.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Governing Law
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which you reside, without regard to its conflict of law provisions.
            </ThemedText>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.heading, { color: colors.text }]}>
              Contact Information
            </ThemedText>
            <ThemedText style={[styles.content, { color: colors.text }]}>
              If you have any questions about these Terms of Service, please contact us through the app's support section.
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