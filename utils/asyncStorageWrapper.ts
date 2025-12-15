/**
 * AsyncStorage Wrapper
 *
 * A safe wrapper for AsyncStorage operations that handles dynamic loading
 * and provides error handling for native module initialization issues.
 */

import { Platform } from 'react-native';

// Type definition for AsyncStorage module
interface AsyncStorageModule {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  mergeItem: (key: string, value: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  multiGet: (keys: string[]) => Promise<[string, string | null][]>;
  multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
  multiMerge: (keyValuePairs: [string, string][]) => Promise<void>;
}

// Internal reference to the AsyncStorage module
let AsyncStorageInstance: AsyncStorageModule | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize AsyncStorage module with dynamic import
 */
const initializeAsyncStorage = async (): Promise<void> => {
  // Skip initialization on web platform
  if (Platform.OS === 'web') {
    // Use native localStorage as fallback for web
    AsyncStorageInstance = {
      getItem: async (key: string) => localStorage.getItem(key),
      setItem: async (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: async (key: string) => localStorage.removeItem(key),
      mergeItem: async (key: string, value: string) => {
        const existing = localStorage.getItem(key);
        const merged = existing ? JSON.stringify({ ...JSON.parse(existing), ...JSON.parse(value) }) : value;
        localStorage.setItem(key, merged);
      },
      clear: async () => localStorage.clear(),
      getAllKeys: async () => Object.keys(localStorage),
      multiGet: async (keys: string[]) => keys.map(key => [key, localStorage.getItem(key)]),
      multiSet: async (keyValuePairs: [string, string][]) => {
        keyValuePairs.forEach(([key, value]) => localStorage.setItem(key, value));
      },
      multiRemove: async (keys: string[]) => {
        keys.forEach(key => localStorage.removeItem(key));
      },
      multiMerge: async (keyValuePairs: [string, string][]) => {
        keyValuePairs.forEach(([key, value]) => {
          const existing = localStorage.getItem(key);
          const merged = existing ? JSON.stringify({ ...JSON.parse(existing), ...JSON.parse(value) }) : value;
          localStorage.setItem(key, merged);
        });
      },
    };
    isInitialized = true;
    return;
  }

  // For native platforms, try to import AsyncStorage
  try {
    console.log('Initializing AsyncStorage...');
    const AsyncStorage = await import('@react-native-async-storage/async-storage');

    if (AsyncStorage && AsyncStorage.default) {
      AsyncStorageInstance = AsyncStorage.default;
      isInitialized = true;
      console.log('AsyncStorage initialized successfully');
    } else {
      throw new Error('AsyncStorage module is not available');
    }
  } catch (error) {
    console.error('Failed to initialize AsyncStorage:', error);
    // Create a no-op implementation to prevent crashes
    AsyncStorageInstance = {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
      mergeItem: async () => {},
      clear: async () => {},
      getAllKeys: async () => [],
      multiGet: async () => [],
      multiSet: async () => {},
      multiRemove: async () => {},
      multiMerge: async () => {},
    };
    isInitialized = false;
  }
};

/**
 * Ensure AsyncStorage is initialized before use
 */
const ensureInitialized = async (): Promise<void> => {
  if (isInitialized && AsyncStorageInstance) {
    return;
  }

  if (!initPromise) {
    initPromise = initializeAsyncStorage();
  }

  await initPromise;
};

/**
 * Safe wrapper functions for AsyncStorage operations
 */
export const SafeAsyncStorage = {
  /**
   * Get an item from AsyncStorage
   */
  async getItem(key: string): Promise<string | null> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, returning null for key:', key);
      return null;
    }
    try {
      return await AsyncStorageInstance.getItem(key);
    } catch (error) {
      console.error('AsyncStorage.getItem error for key', key, ':', error);
      return null;
    }
  },

  /**
   * Set an item in AsyncStorage
   */
  async setItem(key: string, value: string): Promise<void> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, cannot set key:', key);
      return;
    }
    try {
      await AsyncStorageInstance.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage.setItem error for key', key, ':', error);
      throw error;
    }
  },

  /**
   * Remove an item from AsyncStorage
   */
  async removeItem(key: string): Promise<void> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, cannot remove key:', key);
      return;
    }
    try {
      await AsyncStorageInstance.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage.removeItem error for key', key, ':', error);
      throw error;
    }
  },

  /**
   * Merge an item in AsyncStorage
   */
  async mergeItem(key: string, value: string): Promise<void> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, cannot merge key:', key);
      return;
    }
    try {
      await AsyncStorageInstance.mergeItem(key, value);
    } catch (error) {
      console.error('AsyncStorage.mergeItem error for key', key, ':', error);
      throw error;
    }
  },

  /**
   * Clear all items from AsyncStorage
   */
  async clear(): Promise<void> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, cannot clear');
      return;
    }
    try {
      await AsyncStorageInstance.clear();
    } catch (error) {
      console.error('AsyncStorage.clear error:', error);
      throw error;
    }
  },

  /**
   * Get all keys from AsyncStorage
   */
  async getAllKeys(): Promise<string[]> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, returning empty keys array');
      return [];
    }
    try {
      return await AsyncStorageInstance.getAllKeys();
    } catch (error) {
      console.error('AsyncStorage.getAllKeys error:', error);
      return [];
    }
  },

  /**
   * Get multiple items from AsyncStorage
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, returning empty results for multiGet');
      return keys.map(key => [key, null]);
    }
    try {
      return await AsyncStorageInstance.multiGet(keys);
    } catch (error) {
      console.error('AsyncStorage.multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  },

  /**
   * Set multiple items in AsyncStorage
   */
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, cannot multiSet');
      return;
    }
    try {
      await AsyncStorageInstance.multiSet(keyValuePairs);
    } catch (error) {
      console.error('AsyncStorage.multiSet error:', error);
      throw error;
    }
  },

  /**
   * Remove multiple items from AsyncStorage
   */
  async multiRemove(keys: string[]): Promise<void> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, cannot multiRemove');
      return;
    }
    try {
      await AsyncStorageInstance.multiRemove(keys);
    } catch (error) {
      console.error('AsyncStorage.multiRemove error:', error);
      throw error;
    }
  },

  /**
   * Merge multiple items in AsyncStorage
   */
  async multiMerge(keyValuePairs: [string, string][]): Promise<void> {
    await ensureInitialized();
    if (!AsyncStorageInstance) {
      console.warn('AsyncStorage not available, cannot multiMerge');
      return;
    }
    try {
      await AsyncStorageInstance.multiMerge(keyValuePairs);
    } catch (error) {
      console.error('AsyncStorage.multiMerge error:', error);
      throw error;
    }
  },

  /**
   * Check if AsyncStorage is available and initialized
   */
  isAvailable(): boolean {
    return isInitialized && AsyncStorageInstance !== null;
  }
};

// Export a singleton instance
export default SafeAsyncStorage;