import AsyncStorageService from './asyncStorage';
import { UserProfile, RegionalSettings, NotificationPreferences, AppPreferences } from '@/types/user';
import { STORAGE_KEYS } from '@/constants/storage';

export const userProfileStorage = {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profile = await AsyncStorageService.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const updatedProfile = {
        ...profile,
        updatedAt: new Date(),
      };
      await AsyncStorageService.set(STORAGE_KEYS.USER_PROFILE, updatedProfile);
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  async updateRegionalSettings(settings: Partial<RegionalSettings>): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) {
        throw new Error('User profile not found');
      }

      const updatedProfile = {
        ...profile,
        regionalSettings: {
          ...profile.regionalSettings,
          ...settings,
        },
        updatedAt: new Date(),
      };

      await this.saveUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating regional settings:', error);
      throw error;
    }
  },

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) {
        throw new Error('User profile not found');
      }

      const updatedProfile = {
        ...profile,
        notificationPreferences: {
          ...profile.notificationPreferences,
          ...preferences,
        },
        updatedAt: new Date(),
      };

      await this.saveUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  async updateAppPreferences(preferences: Partial<AppPreferences>): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) {
        throw new Error('User profile not found');
      }

      const updatedProfile = {
        ...profile,
        appPreferences: {
          ...profile.appPreferences,
          ...preferences,
        },
        updatedAt: new Date(),
      };

      await this.saveUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating app preferences:', error);
      throw error;
    }
  }
};