/**
 * App initialization component that handles migration from AsyncStorage to SQLite
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MigrationService } from '@/services/MigrationService';
import { DatabaseManager } from '@/services/DatabaseManager';

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
      setMigrationProgress('Initializing database...');

      // Initialize database first
      await DatabaseManager.getInstance().initDatabase();

      setMigrationProgress('Checking migration status...');

      // Check if migration is needed
      const isMigrated = await MigrationService.isMigrated();

      if (!isMigrated) {
        setMigrationProgress('Migrating data to new storage system...');

        // Perform migration
        await MigrationService.migrateFromAsyncStorage();

        setMigrationProgress('Migration completed successfully!');

        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Clear backup after successful migration
        await MigrationService.clearBackup();
      }

      setIsInitializing(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setError('Failed to initialize app. Please restart the app.');
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