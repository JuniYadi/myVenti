import AsyncStorageService from './asyncStorage';
import { Vehicle } from '@/types/vehicle';
import { STORAGE_KEYS, STORAGE_LIMITS, VALIDATION_LIMITS } from '@/constants/storage';

export const vehicleStorage = {
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const vehicles = await AsyncStorageService.get<Vehicle[]>(STORAGE_KEYS.VEHICLES);
      return vehicles || [];
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return [];
    }
  },

  async getVehicle(id: string): Promise<Vehicle | null> {
    try {
      const vehicles = await this.getVehicles();
      return vehicles.find(v => v.id === id) || null;
    } catch (error) {
      console.error('Error getting vehicle:', error);
      return null;
    }
  },

  async getActiveVehicles(): Promise<Vehicle[]> {
    try {
      const vehicles = await this.getVehicles();
      return vehicles.filter(v => v.isActive);
    } catch (error) {
      console.error('Error getting active vehicles:', error);
      return [];
    }
  },

  async saveVehicle(vehicle: Vehicle): Promise<void> {
    try {
      const vehicles = await this.getVehicles();
      const existingIndex = vehicles.findIndex(v => v.id === vehicle.id);

      // Check vehicle limit
      if (existingIndex === -1 && vehicles.filter(v => v.isActive).length >= STORAGE_LIMITS.MAX_VEHICLES) {
        throw new Error(`Maximum ${STORAGE_LIMITS.MAX_VEHICLES} vehicles allowed`);
      }

      const updatedVehicle = {
        ...vehicle,
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        vehicles[existingIndex] = updatedVehicle;
      } else {
        vehicles.push(updatedVehicle);
      }

      await AsyncStorageService.set(STORAGE_KEYS.VEHICLES, vehicles);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      throw error;
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    try {
      const vehicles = await this.getVehicles();
      const vehicleIndex = vehicles.findIndex(v => v.id === id);

      if (vehicleIndex === -1) {
        throw new Error('Vehicle not found');
      }

      // Soft delete by setting isActive to false
      vehicles[vehicleIndex] = {
        ...vehicles[vehicleIndex],
        isActive: false,
        updatedAt: new Date(),
      };

      await AsyncStorageService.set(STORAGE_KEYS.VEHICLES, vehicles);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  async updateVehicleMileage(id: string, mileage: number): Promise<void> {
    try {
      const vehicles = await this.getVehicles();
      const vehicleIndex = vehicles.findIndex(v => v.id === id);

      if (vehicleIndex === -1) {
        throw new Error('Vehicle not found');
      }

      vehicles[vehicleIndex] = {
        ...vehicles[vehicleIndex],
        currentMileage: mileage,
        updatedAt: new Date(),
      };

      await AsyncStorageService.set(STORAGE_KEYS.VEHICLES, vehicles);
    } catch (error) {
      console.error('Error updating vehicle mileage:', error);
      throw error;
    }
  },

  async getVehicleCount(): Promise<number> {
    try {
      const vehicles = await this.getActiveVehicles();
      return vehicles.length;
    } catch (error) {
      console.error('Error getting vehicle count:', error);
      return 0;
    }
  },

  async clearAllVehicles(): Promise<void> {
    try {
      await AsyncStorageService.remove(STORAGE_KEYS.VEHICLES);
    } catch (error) {
      console.error('Error clearing vehicles:', error);
      throw error;
    }
  }
};