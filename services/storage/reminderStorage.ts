import AsyncStorageService from './asyncStorage';
import { Reminder } from '@/types/user';
import { STORAGE_KEYS } from '@/constants/storage';

export const reminderStorage = {
  async getReminders(): Promise<Reminder[]> {
    try {
      const reminders = await AsyncStorageService.get<Reminder[]>(STORAGE_KEYS.REMINDERS);
      return reminders || [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  },

  async getRemindersForVehicle(vehicleId: string): Promise<Reminder[]> {
    try {
      const reminders = await this.getReminders();
      return reminders
        .filter(r => r.vehicleId === vehicleId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting reminders for vehicle:', error);
      return [];
    }
  },

  async getActiveReminders(): Promise<Reminder[]> {
    try {
      const reminders = await this.getReminders();
      return reminders.filter(r => r.isActive && !r.isCompleted);
    } catch (error) {
      console.error('Error getting active reminders:', error);
      return [];
    }
  },

  async saveReminder(reminder: Reminder): Promise<void> {
    try {
      const reminders = await this.getReminders();
      const existingIndex = reminders.findIndex(r => r.id === reminder.id);

      const updatedReminder = {
        ...reminder,
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        reminders[existingIndex] = updatedReminder;
      } else {
        reminders.push(updatedReminder);
      }

      await AsyncStorageService.set(STORAGE_KEYS.REMINDERS, reminders);
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw error;
    }
  },

  async deleteReminder(id: string): Promise<void> {
    try {
      const reminders = await this.getReminders();
      const filtered = reminders.filter(r => r.id !== id);
      await AsyncStorageService.set(STORAGE_KEYS.REMINDERS, filtered);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
};