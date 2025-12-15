/**
 * Module availability checker
 * 
 * Checks if required native modules are available before the app tries to use them
 */

import { Platform } from 'react-native';

export interface ModuleAvailability {
  sqlite: boolean;
  asyncStorage: boolean;
  errors: string[];
}

/**
 * Check if all required modules are available
 */
export async function checkModuleAvailability(): Promise<ModuleAvailability> {
  const result: ModuleAvailability = {
    sqlite: false,
    asyncStorage: false,
    errors: []
  };

  // Check SQLite availability
  try {
    const SQLiteModule = await import('expo-sqlite');
    if (SQLiteModule && (SQLiteModule.default || (SQLiteModule as any).openDatabaseAsync)) {
      result.sqlite = true;
    } else {
      result.errors.push('SQLite module imported but missing required methods');
    }
  } catch (error) {
    result.errors.push(`SQLite module not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Check AsyncStorage availability
  if (Platform.OS === 'web') {
    // Web platform uses localStorage
    result.asyncStorage = typeof localStorage !== 'undefined';
    if (!result.asyncStorage) {
      result.errors.push('localStorage not available in web environment');
    }
  } else {
    // Native platforms use AsyncStorage
    try {
      let AsyncStorage;
      try {
        AsyncStorage = await import('@react-native-async-storage/async-storage');
      } catch (importError) {
        // Fallback to require
        AsyncStorage = (require as any)('@react-native-async-storage/async-storage');
      }

      if (AsyncStorage && (AsyncStorage.default || (AsyncStorage as any).getItem)) {
        result.asyncStorage = true;
      } else {
        result.errors.push('AsyncStorage module imported but missing required methods');
      }
    } catch (error) {
      result.errors.push(`AsyncStorage module not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return result;
}

/**
 * Log module availability status
 */
export function logModuleStatus(availability: ModuleAvailability): void {
  console.log('=== Module Availability Check ===');
  console.log(`SQLite: ${availability.sqlite ? '✅ Available' : '❌ Not Available'}`);
  console.log(`AsyncStorage: ${availability.asyncStorage ? '✅ Available' : '❌ Not Available'}`);
  
  if (availability.errors.length > 0) {
    console.log('Errors:');
    availability.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('================================');
}