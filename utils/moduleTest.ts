/**
 * Simple module test utility
 * 
 * Tests if native modules are working correctly
 */

import { Platform } from 'react-native';

export async function testSQLiteModule(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Testing SQLite module...');
    
    // Try to import and use SQLite
    const SQLite = await import('expo-sqlite');
    
    if (!SQLite || (!SQLite.default && !SQLite.openDatabaseAsync)) {
      return { success: false, error: 'SQLite module imported but missing required methods' };
    }
    
    // Try to open a test database
    const openDatabase = SQLite.default?.openDatabaseAsync || SQLite.openDatabaseAsync;
    if (openDatabase) {
      const testDb = await openDatabase(':memory:');
      await testDb.closeAsync();
      console.log('SQLite test successful');
      return { success: true };
    }
    
    return { success: false, error: 'SQLite openDatabaseAsync method not found' };
  } catch (error) {
    console.error('SQLite test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown SQLite error' 
    };
  }
}

export async function testAsyncStorageModule(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Testing AsyncStorage module...');
    
    if (Platform.OS === 'web') {
      // Test localStorage on web
      if (typeof localStorage === 'undefined') {
        return { success: false, error: 'localStorage not available in web environment' };
      }
      
      // Test basic operations
      localStorage.setItem('__test__', 'test');
      const value = localStorage.getItem('__test__');
      localStorage.removeItem('__test__');
      
      if (value !== 'test') {
        return { success: false, error: 'localStorage test failed' };
      }
      
      console.log('AsyncStorage (localStorage) test successful');
      return { success: true };
    } else {
      // Test AsyncStorage on native
      let AsyncStorage;
      try {
        AsyncStorage = await import('@react-native-async-storage/async-storage');
      } catch (importError) {
        AsyncStorage = (require as any)('@react-native-async-storage/async-storage');
      }
      
      const storage = AsyncStorage.default || AsyncStorage;
      
      if (!storage || !storage.setItem || !storage.getItem) {
        return { success: false, error: 'AsyncStorage module missing required methods' };
      }
      
      // Test basic operations
      await storage.setItem('__test__', 'test');
      const value = await storage.getItem('__test__');
      await storage.removeItem('__test__');
      
      if (value !== 'test') {
        return { success: false, error: 'AsyncStorage test failed' };
      }
      
      console.log('AsyncStorage test successful');
      return { success: true };
    }
  } catch (error) {
    console.error('AsyncStorage test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown AsyncStorage error' 
    };
  }
}

export async function runAllModuleTests(): Promise<{
  sqlite: { success: boolean; error?: string };
  asyncStorage: { success: boolean; error?: string };
}> {
  console.log('=== Running Module Tests ===');
  
  const results = {
    sqlite: await testSQLiteModule(),
    asyncStorage: await testAsyncStorageModule()
  };
  
  console.log('SQLite:', results.sqlite.success ? '✅ PASS' : `❌ FAIL: ${results.sqlite.error}`);
  console.log('AsyncStorage:', results.asyncStorage.success ? '✅ PASS' : `❌ FAIL: ${results.asyncStorage.error}`);
  console.log('============================');
  
  return results;
}