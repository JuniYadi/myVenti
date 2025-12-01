// Enhanced IconSymbol component with fallback mechanisms for vehicle tracking app

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Fallback icons for when specific mappings are not available
 */
const FALLBACK_ICONS = {
  primary: 'help', // General fallback for most cases
  action: 'add',   // For action-related icons
  warning: 'warning', // For warning/error icons
  success: 'check-circle', // For success icons
  info: 'info',    // For informational icons
} as const;

/**
 * Extended SF Symbols to Material Icons mappings for the vehicle tracking app
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  // Navigation and basic icons
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',

  // Vehicle tracking app core icons
  'car.fill': 'directions-car',
  'fuelpump.fill': 'local-gas-station',
  'wrench.fill': 'build',
  'gearshape.fill': 'settings',
  'speedometer': 'speed',
  'location': 'location-on',
  'location.fill': 'location-on',
  'calendar': 'event',
  'calendar.fill': 'event',

  // Financial and data icons
  'dollarsign.circle': 'attach-money',
  'dollarsign.circle.fill': 'attach-money',
  'chart.bar.fill': 'bar-chart',
  'chart.bar': 'bar-chart',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'chart.pie.fill': 'pie-chart',

  // Status and notification icons
  'bell.fill': 'notifications',
  'bell': 'notifications-none',
  'moon.fill': 'nightlight-round',
  'moon': 'brightness-3',
  'icloud.fill': 'cloud',
  'icloud': 'cloud',
  'info.circle.fill': 'info',
  'info.circle': 'info-outline',
  'questionmark.circle.fill': 'help',
  'questionmark.circle': 'help-outline',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.circle': 'check-circle-outline',
  'xmark.circle.fill': 'cancel',
  'xmark.circle': 'highlight-off',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning',

  // Action and interaction icons
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'minus': 'remove',
  'minus.circle.fill': 'remove-circle',
  'pencil': 'edit',
  'pencil.fill': 'edit',
  'trash': 'delete',
  'trash.fill': 'delete',
  'square.and.pencil': 'edit-note',
  'square.and.pencil.fill': 'edit-note',

  // Vehicle specific icons
  'car': 'directions-car',
  'electric.car.fill': 'electric-car',
  'electric.car': 'electric-car',
  'bicycle': 'directions-bike',
  'bus.fill': 'directions-bus',
  'truck.box.fill': 'local-shipping',
  'moped.fill': 'moped',

  // Service and maintenance icons
  'oilcan.fill': 'local-gas-station',
  'oilcan': 'local-gas-station',
  'hammer.fill': 'build',
  'hammer': 'build',
  'wrench.and.screwdriver.fill': 'handyman',
  'wrench.and.screwdriver': 'handyman',

  // Energy and efficiency icons
  'bolt.fill': 'flash-on',
  'bolt': 'flash-on',
  'battery.100': 'battery-full',
  'battery.25': 'battery-alert',
  'battery.0': 'battery-0-bar',
  'flame.fill': 'local-fire-department',
  'leaf.fill': 'eco',

  // Map and navigation icons
  'mappin.circle.fill': 'location-on',
  'mappin.circle': 'location-on',
  'map.fill': 'map',
  'map': 'map',
  'safari.fill': 'explore',
  'compass': 'explore',

  // Time and date icons
  'clock.fill': 'schedule',
  'clock': 'schedule',
  'timer': 'timer',
  'hourglass': 'hourglass-empty',

  // Document and file icons
  'doc.fill': 'description',
  'doc': 'description',
  'folder.fill': 'folder',
  'folder': 'folder-outline',
  'bookmark.fill': 'bookmark',
  'bookmark': 'bookmark-border',

  // Communication icons
  'phone.fill': 'phone',
  'phone': 'phone',
  'envelope.fill': 'email',
  'envelope': 'email',
  'message.fill': 'chat',
  'message': 'chat',

  // Media and display icons
  'photo.fill': 'image',
  'photo': 'image',
  'camera.fill': 'photo-camera',
  'camera': 'photo-camera',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',

  // User and profile icons
  'person.fill': 'person',
  'person': 'person-outline',
  'person.2.fill': 'people',
  'person.2': 'people-outline',
  'person.circle.fill': 'account-circle',
  'person.circle': 'account-circle',

  // Settings and controls
  'slider.horizontal.3': 'tune',
  'switch.2': 'settings',
  'gear': 'settings',
  'power': 'power-settings-new',

  // Arrow and navigation aids
  'arrow.up': 'keyboard-arrow-up',
  'arrow.down': 'keyboard-arrow-down',
  'arrow.left': 'keyboard-arrow-left',
  'arrow.right': 'keyboard-arrow-right',
  'arrow.up.circle.fill': 'keyboard-arrow-up',
  'arrow.down.circle.fill': 'keyboard-arrow-down',
  'arrow.left.circle.fill': 'keyboard-arrow-left',
  'arrow.right.circle.fill': 'keyboard-arrow-right',

  // Misc useful icons
  'star.fill': 'star',
  'star': 'star-border',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'tag.fill': 'local-offer',
  'tag': 'local-offer',
  'bag.fill': 'shopping-bag',
  'bag': 'shopping-bag',

  // Form input icons
  'textformat': 'text-fields',
  'number': '123',
  'checklist': 'checklist',
  'list.bullet': 'format-list-bulleted',
  'list.number': 'format-list-numbered',

  // Security and privacy
  'lock.fill': 'lock',
  'lock': 'lock-outline',
  'lock.open.fill': 'lock-open',
  'lock.open': 'lock-open',
  'key.fill': 'vpn-key',
  'key': 'vpn-key',
  'shield.fill': 'security',
  'shield': 'security',

  // Warning and error icons (duplicates for easier finding)
  'exclamationmark.circle.fill': 'error',
  'exclamationmark.circle': 'error-outline',
  'xmark.square.fill': 'cancel',
  'xmark.square': 'highlight-off',
} as const;

/**
 * Safe mapping function with fallback handling
 */
function getMappedIcon(name: string): ComponentProps<typeof MaterialIcons>['name'] {
  // Check if exact mapping exists
  if (name in MAPPING) {
    return MAPPING[name as keyof typeof MAPPING];
  }

  // Try partial matching for common patterns
  const lowerName = name.toLowerCase();

  // Fallback logic based on icon name patterns
  if (lowerName.includes('car') || lowerName.includes('vehicle')) {
    return 'directions-car';
  }
  if (lowerName.includes('fuel') || lowerName.includes('gas') || lowerName.includes('pump')) {
    return 'local-gas-station';
  }
  if (lowerName.includes('wrench') || lowerName.includes('service') || lowerName.includes('build')) {
    return 'build';
  }
  if (lowerName.includes('setting') || lowerName.includes('gear')) {
    return 'settings';
  }
  if (lowerName.includes('speed') || lowerName.includes('meter')) {
    return 'speed';
  }
  if (lowerName.includes('location') || lowerName.includes('map') || lowerName.includes('pin')) {
    return 'location-on';
  }
  if (lowerName.includes('calendar') || lowerName.includes('date')) {
    return 'event';
  }
  if (lowerName.includes('dollar') || lowerName.includes('money') || lowerName.includes('cost')) {
    return 'attach-money';
  }
  if (lowerName.includes('bell') || lowerName.includes('notification')) {
    return 'notifications';
  }
  if (lowerName.includes('plus') || lowerName.includes('add')) {
    return 'add';
  }
  if (lowerName.includes('minus') || lowerName.includes('remove')) {
    return 'remove';
  }
  if (lowerName.includes('check') || lowerName.includes('success')) {
    return 'check-circle';
  }
  if (lowerName.includes('x') || lowerName.includes('cancel') || lowerName.includes('close')) {
    return 'cancel';
  }
  if (lowerName.includes('warning') || lowerName.includes('alert') || lowerName.includes('exclamation')) {
    return 'warning';
  }
  if (lowerName.includes('info') || lowerName.includes('question')) {
    return 'info';
  }
  if (lowerName.includes('chart') || lowerName.includes('graph')) {
    return 'bar-chart';
  }
  if (lowerName.includes('electric') || lowerName.includes('bolt') || lowerName.includes('power')) {
    return 'flash-on';
  }
  if (lowerName.includes('edit') || lowerName.includes('pencil')) {
    return 'edit';
  }
  if (lowerName.includes('delete') || lowerName.includes('trash')) {
    return 'delete';
  }
  if (lowerName.includes('person') || lowerName.includes('user')) {
    return 'person';
  }
  if (lowerName.includes('star') || lowerName.includes('favorite')) {
    return 'star';
  }
  if (lowerName.includes('heart')) {
    return 'favorite';
  }

  // Default fallback
  return FALLBACK_ICONS.primary;
}

/**
 * Enhanced IconSymbol component with robust error handling and fallback mechanisms
 *
 * Uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and include automatic fallback handling.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: string; // Changed to string to allow for unmapped icons with fallback
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Get the mapped icon with fallback
  const iconName = getMappedIcon(name);

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={iconName}
      style={[
        {
          // Ensure icons are properly sized and don't overflow
          lineHeight: size,
          textAlign: 'center',
          // Add a small margin to prevent clipping
          margin: 1,
        },
        style,
      ]}
    />
  );
}
