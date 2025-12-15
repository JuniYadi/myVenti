/**
 * App initialization component that handles migration from AsyncStorage to SQLite
 */

import React, { useEffect, useState } from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MigrationService } from '@/services/MigrationService';
import { DatabaseManager } from '@/services/DatabaseManager';
import SafeAsyncStorage from '@/utils/asyncStorageWrapper';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [migrationProgress, setMigrationProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setMigrationProgress('Initializing storage...');

      // First, test SafeAsyncStorage availability on native platforms
      if (Platform.OS !== 'web') {
        try {
          const isAvailable = SafeAsyncStorage.isAvailable();
          if (isAvailable) {
            // Test with a simple operation
            await SafeAsyncStorage.getItem('__test_storage__');
            console.log('SafeAsyncStorage is available');
          } else {
            console.log('SafeAsyncStorage not available, continuing without it');
          }
        } catch (storageError) {
          console.warn('SafeAsyncStorage test failed, continuing without it:', storageError);
          // Continue with app initialization even without AsyncStorage
        }
      }

      setMigrationProgress('Initializing database...');

      // Initialize database first
      await DatabaseManager.getInstance().initDatabase();

      setMigrationProgress('Checking migration status...');

      // Check if migration is needed - wrap in try-catch
      let isMigrated = false;
      try {
        isMigrated = await MigrationService.isMigrated();
      } catch (migrationCheckError) {
        console.warn('Migration check failed, assuming fresh install:', migrationCheckError);
        isMigrated = false;
      }

      if (!isMigrated) {
        setMigrationProgress('Migrating data to new storage system...');

        try {
          // Perform migration
          await MigrationService.migrateFromAsyncStorage();

          setMigrationProgress('Migration completed successfully!');

          // Wait a moment to show success message
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Clear backup after successful migration
          await MigrationService.clearBackup();
        } catch (migrationError) {
          console.error('Migration failed, continuing with fresh install:', migrationError);
          setMigrationProgress('Setting up fresh installation...');
          // Continue with app even if migration fails
        }
      }

      setIsInitializing(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setError(`Failed to initialize app: ${error instanceof Error ? error.message : 'Unknown error'}. Please restart the app.`);
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.title}>myVenti</Text>
          <Text style={styles.message}>{migrationProgress}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorTitle}>Initialization Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});