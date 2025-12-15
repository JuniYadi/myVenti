/**
 * Seed data utilities for myVenti app
 * Provides sample data for testing and demonstration
 */

import { VehicleService, FuelService } from '@/services';

export class SeedDataService {
  /**
   * Add sample vehicles if no vehicles exist
   */
  static async addSampleVehiclesIfNeeded(): Promise<void> {
    try {
      console.log('SeedDataService: Checking if sample vehicles are needed...');
      const existingVehicles = await VehicleService.getAll();

      if (existingVehicles.length === 0) {
        console.log('SeedDataService: No vehicles found, adding sample vehicles...');

        const sampleVehicles = [
          {
            name: 'Family Car',
            year: '2022',
            make: 'Toyota',
            model: 'Camry',
            type: 'gas' as const
          },
          {
            name: 'Daily Commute',
            year: '2023',
            make: 'Tesla',
            model: 'Model 3',
            type: 'electric' as const
          },
          {
            name: 'Weekend SUV',
            year: '2021',
            make: 'Honda',
            model: 'CR-V',
            type: 'hybrid' as const
          }
        ];

        for (const vehicleData of sampleVehicles) {
          await VehicleService.create(vehicleData);
          console.log(`SeedDataService: Added vehicle: ${vehicleData.name}`);
        }

        console.log('SeedDataService: Sample vehicles added successfully');
      } else {
        console.log(`SeedDataService: Found ${existingVehicles.length} existing vehicles, skipping sample data`);
      }
    } catch (error) {
      console.error('SeedDataService: Failed to add sample vehicles:', error);
      // Don't throw error, just log it - this is not critical functionality
    }
  }

  /**
   * Add sample fuel entries if none exist for testing
   */
  static async addSampleFuelEntriesIfNeeded(): Promise<void> {
    try {
      console.log('SeedDataService: Checking if sample fuel entries are needed...');
      const vehicles = await VehicleService.getAll();
      const existingEntries = await FuelService.getAll();

      if (vehicles.length > 0 && existingEntries.length === 0) {
        console.log('SeedDataService: No fuel entries found, adding sample entries...');

        const sampleEntries = [
          {
            vehicleId: vehicles[0].id, // Use first vehicle
            date: new Date().toISOString().split('T')[0], // Today
            amount: '45.00',
            quantity: '12.5',
            pricePerUnit: '3.60',
            mileage: '25000',
            fuelStation: 'Shell Station',
            notes: 'Regular fill-up'
          },
          {
            vehicleId: vehicles[0].id,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week ago
            amount: '42.50',
            quantity: '11.8',
            pricePerUnit: '3.60',
            mileage: '24750',
            fuelStation: 'Chevron',
            notes: 'Weekend trip'
          }
        ];

        for (const entryData of sampleEntries) {
          await FuelService.create(entryData);
          console.log(`SeedDataService: Added fuel entry for ${entryData.date}`);
        }

        console.log('SeedDataService: Sample fuel entries added successfully');
      } else {
        console.log(`SeedDataService: Found ${existingEntries.length} existing fuel entries, skipping sample data`);
      }
    } catch (error) {
      console.error('SeedDataService: Failed to add sample fuel entries:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Add all sample data if needed
   */
  static async addAllSampleDataIfNeeded(): Promise<void> {
    await this.addSampleVehiclesIfNeeded();
    await this.addSampleFuelEntriesIfNeeded();
  }
}