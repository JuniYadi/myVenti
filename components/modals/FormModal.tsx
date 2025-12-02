/**
 * Simple FormModal component that works consistently across platforms
 */

import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Text,
} from 'react-native';

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
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in from bottom
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate out to bottom
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    // Animate out first, then call onClose
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      {/* Semi-transparent backdrop */}
      <View style={styles.backdrop}>
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              maxWidth,
            },
          ]}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {children}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
    marginHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    lineHeight: 24,
  },
  contentContainer: {
    flex: 1,
  },
});