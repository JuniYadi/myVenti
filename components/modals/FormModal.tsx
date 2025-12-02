/**
 * FormModal component for presenting forms in a consistent modal
 * Provides animations, proper overlay handling, and keyboard management
 */

import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
  showCloseButton?: boolean;
}

export function FormModal({
  visible,
  onClose,
  title,
  children,
  maxWidth = 500,
  showCloseButton = true,
}: FormModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayAnim]);

  const handleClose = () => {
    // Animate out first, then call onClose
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleOverlayPress = () => {
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
            backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        />
      </Animated.View>

      {/* Modal Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: overlayAnim,
              maxWidth,
            },
          ]}
        >
          <ThemedView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="xmark" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {children}
            </View>
          </ThemedView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
    marginHorizontal: 20,
    zIndex: 1001,
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});