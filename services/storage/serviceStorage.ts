import AsyncStorageService from './asyncStorage';
import { ServiceRecord } from '@/types/service';
import { STORAGE_KEYS, VALIDATION_LIMITS } from '@/constants/storage';

export const serviceStorage = {
  async getServiceRecords(): Promise<ServiceRecord[]> {
    try {
      const records = await AsyncStorageService.get<ServiceRecord[]>(STORAGE_KEYS.SERVICE_RECORDS);
      return records || [];
    } catch (error) {
      console.error('Error getting service records:', error);
      return [];
    }
  },

  async getServicesForVehicle(vehicleId: string): Promise<ServiceRecord[]> {
    try {
      const records = await this.getServiceRecords();
      return records
        .filter(r => r.vehicleId === vehicleId)
        .sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime());
    } catch (error) {
      console.error('Error getting services for vehicle:', error);
      return [];
    }
  },

  async saveServiceRecord(service: ServiceRecord): Promise<void> {
    try {
      const records = await this.getServiceRecords();
      const existingIndex = records.findIndex(r => r.id === service.id);

      const updatedService = {
        ...service,
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        records[existingIndex] = updatedService;
      } else {
        records.push(updatedService);
      }

      await AsyncStorageService.set(STORAGE_KEYS.SERVICE_RECORDS, records);
    } catch (error) {
      console.error('Error saving service record:', error);
      throw error;
    }
  },

  async deleteServiceRecord(id: string): Promise<void> {
    try {
      const records = await this.getServiceRecords();
      const filtered = records.filter(r => r.id !== id);
      await AsyncStorageService.set(STORAGE_KEYS.SERVICE_RECORDS, filtered);
    } catch (error) {
      console.error('Error deleting service record:', error);
      throw error;
    }
  }
};