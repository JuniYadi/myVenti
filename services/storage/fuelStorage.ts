import AsyncStorageService from './asyncStorage';
import { FuelRecord } from '@/types/fuel';
import { STORAGE_KEYS, VALIDATION_LIMITS } from '@/constants/storage';

export const fuelStorage = {
  async getFuelRecords(): Promise<FuelRecord[]> {
    try {
      const records = await AsyncStorageService.get<FuelRecord[]>(STORAGE_KEYS.FUEL_RECORDS);
      return records || [];
    } catch (error) {
      console.error('Error getting fuel records:', error);
      return [];
    }
  },

  async getFuelRecordsForVehicle(vehicleId: string): Promise<FuelRecord[]> {
    try {
      const records = await this.getFuelRecords();
      return records
        .filter(r => r.vehicleId === vehicleId)
        .sort((a, b) => b.fillDate.getTime() - a.fillDate.getTime());
    } catch (error) {
      console.error('Error getting fuel records for vehicle:', error);
      return [];
    }
  },

  async saveFuelRecord(fuel: FuelRecord): Promise<void> {
    try {
      const records = await this.getFuelRecords();
      const existingIndex = records.findIndex(r => r.id === fuel.id);

      const updatedFuel = {
        ...fuel,
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        records[existingIndex] = updatedFuel;
      } else {
        records.push(updatedFuel);
      }

      await AsyncStorageService.set(STORAGE_KEYS.FUEL_RECORDS, records);
    } catch (error) {
      console.error('Error saving fuel record:', error);
      throw error;
    }
  },

  async deleteFuelRecord(id: string): Promise<void> {
    try {
      const records = await this.getFuelRecords();
      const filtered = records.filter(r => r.id !== id);
      await AsyncStorageService.set(STORAGE_KEYS.FUEL_RECORDS, filtered);
    } catch (error) {
      console.error('Error deleting fuel record:', error);
      throw error;
    }
  }
};