/**
 * Fuel Analytics Integration Tests
 * Tests analytics calculations, filtering, search functionality, and multi-vehicle scenarios
 */

import {
  FuelService,
  VehicleService,
} from '@/services/index';
import { FuelEntry, Vehicle, FuelFormData } from '@/types/data';
import {
  calculateFuelEfficiency,
  calculateMPGBetweenEntries,
  calculateStatistics,
  analyzeTrend,
  projectFuelCosts,
  compareVehicles,
  validateFuelEntry,
} from '@/utils/fuelAnalytics';
import { DateRangeValidation, PriceRangeValidation } from '@/utils/validation';

describe('Fuel Analytics Integration Tests', () => {
  // Test data setup
  let testVehicles: Vehicle[];
  let testFuelEntries: FuelEntry[];

  beforeEach(() => {
    // Reset AsyncStorage before each test
    jest.clearAllMocks();

    // Setup test vehicles
    testVehicles = [
      {
        id: 'vehicle-1',
        name: 'Toyota Camry',
        year: 2022,
        make: 'Toyota',
        model: 'Camry',
        type: 'gas',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'vehicle-2',
        name: 'Tesla Model 3',
        year: 2023,
        make: 'Tesla',
        model: 'Model 3',
        type: 'electric',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'vehicle-3',
        name: 'Toyota Prius',
        year: 2023,
        make: 'Toyota',
        model: 'Prius',
        type: 'hybrid',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    // Setup test fuel entries
    testFuelEntries = [
      {
        id: 'fuel-1',
        vehicleId: 'vehicle-1',
        date: '2024-01-15',
        amount: 45.00,
        quantity: 12.5,
        pricePerUnit: 3.60,
        mileage: 15000,
        mpg: 25.0,
        fuelStation: 'Shell Station',
        location: { latitude: 37.7749, longitude: -122.4194 },
        notes: 'Regular commute fill-up',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z',
      },
      {
        id: 'fuel-2',
        vehicleId: 'vehicle-1',
        date: '2024-02-01',
        amount: 48.00,
        quantity: 13.2,
        pricePerUnit: 3.64,
        mileage: 15300,
        mpg: 22.7,
        fuelStation: 'Chevron',
        notes: 'Long distance trip',
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z',
      },
      {
        id: 'fuel-3',
        vehicleId: 'vehicle-2',
        date: '2024-01-20',
        amount: 25.00,
        quantity: 68.0,
        pricePerUnit: 0.37,
        mileage: 8000,
        createdAt: '2024-01-20T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z',
      },
      {
        id: 'fuel-4',
        vehicleId: 'vehicle-3',
        date: '2024-01-25',
        amount: 40.00,
        quantity: 11.0,
        pricePerUnit: 3.64,
        mileage: 12000,
        mpg: 30.0,
        fuelStation: '76 Station',
        notes: 'Mixed driving conditions',
        createdAt: '2024-01-25T00:00:00.000Z',
        updatedAt: '2024-01-25T00:00:00.000Z',
      },
    ];

    // Mock AsyncStorage
    jest.mock('@react-native-async-storage/async-storage', () => ({
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }));
  });

  describe('Analytics Calculations', () => {
    test('calculateFuelEfficiency should return comprehensive metrics', () => {
      const entry = testFuelEntries[0];
      const efficiency = calculateFuelEfficiency(entry, undefined, testVehicles[0]);

      expect(efficiency.mpg).toBe(25.0);
      expect(efficiency.kmPerLiter).toBeCloseTo(10.63, 1);
      expect(efficiency.litersPer100km).toBeCloseTo(9.41, 1);
      expect(efficiency.costPerMile).toBeCloseTo(0.0144, 3);
      expect(efficiency.costPerKm).toBeCloseTo(0.009, 3);
    });

    test('calculateMPGBetweenEntries should calculate MPG between consecutive entries', () => {
      const currentEntry = testFuelEntries[1];
      const previousEntry = testFuelEntries[0];
      const vehicle = testVehicles[0];

      const mpg = calculateMPGBetweenEntries(currentEntry, previousEntry, vehicle);

      const distance = currentEntry.mileage - previousEntry.mileage; // 300 miles
      const expectedMPG = distance / currentEntry.quantity; // 300 / 13.2 = 22.73

      expect(mpg).toBeCloseTo(expectedMPG, 2);
    });

    test('calculateMPGBetweenEntries should return 0 for electric vehicles', () => {
      const currentEntry = { ...testFuelEntries[0], vehicleId: 'vehicle-2' };
      const previousEntry = { ...testFuelEntries[1], vehicleId: 'vehicle-2' };
      const vehicle = testVehicles[1]; // Electric vehicle

      const mpg = calculateMPGBetweenEntries(currentEntry, previousEntry, vehicle);

      expect(mpg).toBe(0);
    });

    test('calculateStatistics should provide comprehensive statistical analysis', () => {
      const mpgValues = [25.0, 22.7, 30.0, 28.5, 24.3];
      const stats = calculateStatistics(mpgValues);

      expect(stats.mean).toBeCloseTo(26.1, 1);
      expect(stats.median).toBe(25.0);
      expect(stats.min).toBe(22.7);
      expect(stats.max).toBe(30.0);
      expect(stats.standardDeviation).toBeGreaterThan(0);
      expect(stats.quartiles.q1).toBeDefined();
      expect(stats.quartiles.q2).toBeDefined();
      expect(stats.quartiles.q3).toBeDefined();
    });

    test('analyzeTrend should detect increasing trend', () => {
      const values = [20, 22, 24, 26, 28];
      const dates = ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29'];

      const trend = analyzeTrend(values, dates);

      expect(trend.trend).toBe('increasing');
      expect(trend.changeRate).toBeGreaterThan(0);
      expect(trend.confidence).toBeGreaterThan(80);
    });

    test('analyzeTrend should detect decreasing trend', () => {
      const values = [30, 28, 26, 24, 22];
      const dates = ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22', '2024-01-29'];

      const trend = analyzeTrend(values, dates);

      expect(trend.trend).toBe('decreasing');
      expect(trend.changeRate).toBeLessThan(0);
      expect(trend.confidence).toBeGreaterThan(80);
    });

    test('projectFuelCosts should generate reasonable projections', () => {
      const historicalCosts = [45, 48, 46, 50, 52];
      const projections = projectFuelCosts(historicalCosts, 3);

      expect(projections.projections).toHaveLength(3);
      expect(projections.confidence).toBeGreaterThanOrEqual(0);
      expect(projections.confidence).toBeLessThanOrEqual(100);
      expect(['increasing', 'decreasing', 'stable']).toContain(projections.trend);
    });
  });

  describe('Vehicle Comparison', () => {
    test('compareVehicles should generate comprehensive comparison', () => {
      const comparison = compareVehicles(testFuelEntries, testVehicles);

      expect(comparison).toHaveLength(2); // Only gas and hybrid vehicles have MPG

      const camry = comparison.find(c => c.vehicleName === 'Toyota Camry');
      const prius = comparison.find(c => c.vehicleName === 'Toyota Prius');

      expect(camry).toBeDefined();
      expect(prius).toBeDefined();

      if (camry) {
        expect(camry.efficiency.mpg).toBeCloseTo(23.85, 1); // Average of 25.0 and 22.7
        expect(camry.performance.bestMPG).toBe(25.0);
        expect(camry.performance.worstMPG).toBe(22.7);
      }

      if (prius) {
        expect(prius.efficiency.mpg).toBe(30.0);
      }
    });

    test('compareVehicles should handle empty entries', () => {
      const comparison = compareVehicles([], testVehicles);

      expect(comparison).toHaveLength(0);
    });

    test('compareVehicles should handle vehicles with no entries', () => {
      const entriesWithoutVehicle2 = testFuelEntries.filter(e => e.vehicleId !== 'vehicle-2');
      const comparison = compareVehicles(entriesWithoutVehicle2, testVehicles);

      expect(comparison).toHaveLength(2); // Should not include the vehicle with no entries
    });
  });

  describe('Fuel Service Analytics Methods', () => {
    beforeEach(() => {
      // Mock AsyncStorage to return our test data
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === 'myventi_fuel_entries') {
          return Promise.resolve(JSON.stringify(testFuelEntries));
        }
        if (key === 'myventi_vehicles') {
          return Promise.resolve(JSON.stringify(testVehicles));
        }
        return Promise.resolve(null);
      });
    });

    test('getAnalyticsSummary should calculate comprehensive statistics', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-02-29');

      const summary = await FuelService.getAnalyticsSummary(startDate, endDate);

      expect(summary.totalCost).toBeCloseTo(133.00, 2); // 45 + 48 + 25 + 40
      expect(summary.totalFuel).toBeCloseTo(104.7, 1); // 12.5 + 13.2 + 68 + 11
      expect(summary.tripsCount).toBe(4);
      expect(summary.averageMPG).toBeCloseTo(25.9, 1); // Average of gas vehicles MPG
      expect(summary.averageCostPerTrip).toBeCloseTo(33.25, 2);
      expect(summary.averageCostPerGallon).toBeGreaterThan(0);
    });

    test('getMonthlyTrends should generate trend data', async () => {
      const trends = await FuelService.getMonthlyTrends(3);

      expect(trends).toHaveLength(3);
      expect(trends[0]).toHaveProperty('month');
      expect(trends[0]).toHaveProperty('cost');
      expect(trends[0]).toHaveProperty('fuel');
      expect(trends[0]).toHaveProperty('trips');
      expect(trends[0]).toHaveProperty('averageMPG');
    });

    test('getVehicleComparison should compare vehicles', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-02-29');

      const comparison = await FuelService.getVehicleComparison(startDate, endDate);

      expect(comparison).toHaveLength(3); // All vehicles should be included

      const camry = comparison.find(c => c.vehicleName === 'Toyota Camry');
      if (camry) {
        expect(camry.totalCost).toBeCloseTo(93.00, 2); // 45 + 48
        expect(camry.tripsCount).toBe(2);
        expect(camry.averageMPG).toBeCloseTo(23.85, 1);
      }
    });

    test('search should filter by various criteria', async () => {
      // Test vehicle filter
      const camryEntries = await FuelService.search({ vehicleId: 'vehicle-1' });
      expect(camryEntries).toHaveLength(2);

      // Test price range filter
      const priceFiltered = await FuelService.search({
        minPrice: 3.60,
        maxPrice: 3.70,
      });
      expect(priceFiltered.length).toBeGreaterThan(0);

      // Test fuel station filter
      const shellEntries = await FuelService.search({
        fuelStation: 'Shell',
      });
      expect(shellEntries).toHaveLength(1);

      // Test search term
      const commuteEntries = await FuelService.search({
        searchTerm: 'commute',
      });
      expect(commuteEntries).toHaveLength(1);
    });

    test('getUniqueFuelStations should return unique station names', async () => {
      const stations = await FuelService.getUniqueFuelStations();

      expect(stations).toContain('Shell Station');
      expect(stations).toContain('Chevron');
      expect(stations).toContain('76 Station');
    });

    test('batch operations should work correctly', async () => {
      // Test batch create
      const newEntries: FuelFormData[] = [
        {
          vehicleId: 'vehicle-1',
          date: '2024-03-01',
          amount: '50.00',
          quantity: '14.0',
          pricePerUnit: '3.57',
          mileage: '16000',
          fuelStation: 'Test Station',
          notes: 'Batch test entry',
        },
        {
          vehicleId: 'vehicle-1',
          date: '2024-03-15',
          amount: '48.50',
          quantity: '13.5',
          pricePerUnit: '3.59',
          mileage: '16300',
          fuelStation: 'Another Test Station',
        },
      ];

      const createdEntries = await FuelService.createBatch(newEntries);
      expect(createdEntries).toHaveLength(2);
      expect(createdEntries[0]).toHaveProperty('id');
      expect(createdEntries[1]).toHaveProperty('id');

      // Test batch delete
      const entryIdsToDelete = createdEntries.map(e => e.id);
      const deleteResult = await FuelService.deleteBatch(entryIdsToDelete);
      expect(deleteResult).toBe(true);
    });
  });

  describe('Date Range Validation', () => {
    test('validateDateRange should accept valid ranges', () => {
      const result = DateRangeValidation.validateDateRange('2024-01-01', '2024-01-31');

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('validateDateRange should reject invalid ranges', () => {
      const result = DateRangeValidation.validateDateRange('2024-01-31', '2024-01-01');

      expect(result.isValid).toBe(false);
      expect(result.errors.dateRange).toBe('Start date must be before end date');
    });

    test('validateDateRange should respect min/max days', () => {
      const result = DateRangeValidation.validateDateRange(
        '2024-01-01',
        '2024-01-05',
        { minDays: 7 }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.dateRange).toContain('at least 7 days');
    });

    test('getDateRangePresets should return valid ranges', () => {
      const presets = DateRangeValidation.getDateRangePresets();

      expect(presets).toHaveProperty('today');
      expect(presets).toHaveProperty('last7Days');
      expect(presets).toHaveProperty('last30Days');
      expect(presets).toHaveProperty('thisMonth');

      expect(presets.today.startDate).toBe(presets.today.endDate);
      expect(new Date(presets.last7Days.startDate)).toBeLessThan(
        new Date(presets.last7Days.endDate)
      );
    });
  });

  describe('Price Range Validation', () => {
    test('validatePriceRange should accept valid ranges', () => {
      const result = PriceRangeValidation.validatePriceRange(2.50, 4.00);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('validatePriceRange should reject invalid ranges', () => {
      const result = PriceRangeValidation.validatePriceRange(5.00, 3.00);

      expect(result.isValid).toBe(false);
      expect(result.errors.priceRange).toBe(
        'Minimum price cannot be greater than maximum price'
      );
    });

    test('validatePriceRange should respect bounds', () => {
      const result = PriceRangeValidation.validatePriceRange(1.00, 10.00, {
        minPrice: 2.00,
        maxPrice: 8.00,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.minPrice).toContain('less than $2.00');
      expect(result.errors.maxPrice).toContain('exceed $8.00');
    });

    test('getPriceRangePresets should return valid presets', () => {
      const presets = PriceRangeValidation.getPriceRangePresets();

      expect(presets).toHaveProperty('under2');
      expect(presets).toHaveProperty('twoToFour');
      expect(presets).toHaveProperty('budget');
      expect(presets).toHaveProperty('premium');

      expect(presets.under2.minPrice).toBe(0);
      expect(presets.under2.maxPrice).toBe(2);
      expect(presets.twoToFour.minPrice).toBe(2);
      expect(presets.twoToFour.maxPrice).toBe(4);
    });
  });

  describe('Data Validation and Edge Cases', () => {
    test('validateFuelEntry should detect invalid data', () => {
      const invalidEntry = {
        amount: '-50', // Invalid amount
        quantity: '0', // Invalid quantity
        mileage: '-1000', // Invalid mileage
        pricePerUnit: 'invalid', // Invalid price
        date: 'invalid-date', // Invalid date
        fuelStation: 'Special characters: !@#$%^&*()',
        notes: '<script>alert("xss")</script>',
      };

      const validation = validateFuelEntry(invalidEntry);

      expect(validation.isValid).toBe(false);
      expect(Object.keys(validation.errors)).toHaveLengthGreaterThan(3);
    });

    test('validateFuelEntry should accept valid data', () => {
      const validEntry = {
        vehicleId: 'vehicle-1',
        date: '2024-01-15',
        amount: '45.50',
        quantity: '12.5',
        pricePerUnit: '3.64',
        mileage: '15000',
        fuelStation: 'Shell Station',
        notes: 'Regular fill-up',
      };

      const validation = validateFuelEntry(validEntry);

      expect(validation.isValid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    test('analytics should handle empty datasets', async () => {
      const emptySummary = await FuelService.getAnalyticsSummary(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(emptySummary.totalCost).toBe(0);
      expect(emptySummary.totalFuel).toBe(0);
      expect(emptySummary.tripsCount).toBe(0);
      expect(emptySummary.averageMPG).toBe(0);
    });

    test('analytics should handle single entry', () => {
      const singleEntry = [testFuelEntries[0]];
      const stats = calculateStatistics([testFuelEntries[0].mpg!]);

      expect(stats.mean).toBe(testFuelEntries[0].mpg);
      expect(stats.median).toBe(testFuelEntries[0].mpg);
      expect(stats.standardDeviation).toBe(0);
    });

    test('trend analysis should handle insufficient data', () => {
      const emptyTrend = analyzeTrend([], []);
      expect(emptyTrend.trend).toBe('stable');
      expect(emptyTrend.confidence).toBe(0);
      expect(emptyTrend.period).toBe('insufficient data');

      const singleValueTrend = analyzeTrend([25], ['2024-01-01']);
      expect(singleValueTrend.trend).toBe('stable');
      expect(singleValueTrend.confidence).toBe(0);
    });

    test('projections should handle insufficient data', () => {
      const insufficientData = projectFuelCosts([], 6);
      expect(insufficientData.projections).toHaveLength(0);
      expect(insufficientData.confidence).toBe(0);
      expect(insufficientData.trend).toBe('stable');

      const minimalData = projectFuelCosts([50], 6);
      expect(minimalData.projections).toHaveLength(0);
      expect(minimalData.confidence).toBe(0);
      expect(minimalData.trend).toBe('stable');
    });
  });

  describe('Multi-Vehicle Scenarios', () => {
    test('should handle mixed vehicle types correctly', async () => {
      const mixedComparison = compareVehicles(testFuelEntries, testVehicles);

      // Should only include gas and hybrid vehicles in MPG calculations
      const electricVehicle = mixedComparison.find(c => c.vehicleName === 'Tesla Model 3');
      expect(electricVehicle).toBeUndefined();

      // Gas and hybrid vehicles should be included
      const camry = mixedComparison.find(c => c.vehicleName === 'Toyota Camry');
      const prius = mixedComparison.find(c => c.vehicleName === 'Toyota Prius');
      expect(camry).toBeDefined();
      expect(prius).toBeDefined();
    });

    test('should calculate separate statistics per vehicle type', async () => {
      const gasEntries = testFuelEntries.filter(e => {
        const vehicle = testVehicles.find(v => v.id === e.vehicleId);
        return vehicle?.type === 'gas';
      });

      const electricEntries = testFuelEntries.filter(e => {
        const vehicle = testVehicles.find(v => v.id === e.vehicleId);
        return vehicle?.type === 'electric';
      });

      expect(gasEntries).toHaveLength(2);
      expect(electricEntries).toHaveLength(1);

      // Gas entries should have MPG calculations
      gasEntries.forEach(entry => {
        expect(entry.mpg).toBeGreaterThan(0);
      });

      // Electric entries should not have MPG
      electricEntries.forEach(entry => {
        expect(entry.mpg).toBeUndefined();
      });
    });

    test('should handle vehicle-specific filtering', async () => {
      const camryEntries = await FuelService.search({ vehicleId: 'vehicle-1' });
      const teslaEntries = await FuelService.search({ vehicleId: 'vehicle-2' });
      const priusEntries = await FuelService.search({ vehicleId: 'vehicle-3' });

      expect(camryEntries).toHaveLength(2);
      expect(teslaEntries).toHaveLength(1);
      expect(priusEntries).toHaveLength(1);

      // Verify correct vehicles
      camryEntries.forEach(entry => {
        expect(entry.vehicleId).toBe('vehicle-1');
      });

      teslaEntries.forEach(entry => {
        expect(entry.vehicleId).toBe('vehicle-2');
      });

      priusEntries.forEach(entry => {
        expect(entry.vehicleId).toBe('vehicle-3');
      });
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle large datasets efficiently', async () => {
      // Create a large dataset
      const largeDataset: FuelEntry[] = [];
      const baseDate = new Date('2023-01-01');

      for (let i = 0; i < 1000; i++) {
        const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
        largeDataset.push({
          id: `fuel-${i}`,
          vehicleId: 'vehicle-1',
          date: date.toISOString().split('T')[0],
          amount: 45 + (i % 10),
          quantity: 12 + (i % 3),
          pricePerUnit: 3.5 + (i % 20) * 0.01,
          mileage: 15000 + i * 100,
          mpg: 20 + (i % 15),
          fuelStation: `Station ${i % 10}`,
          createdAt: date.toISOString(),
          updatedAt: date.toISOString(),
        });
      }

      const startTime = performance.now();
      const comparison = compareVehicles(largeDataset, testVehicles);
      const endTime = performance.now();

      expect(comparison).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should gracefully handle malformed data', async () => {
      const malformedData = [
        { ...testFuelEntries[0], amount: NaN },
        { ...testFuelEntries[1], quantity: undefined },
        { ...testFuelEntries[2], date: 'invalid-date' },
        { ...testFuelEntries[3], vehicleId: null },
      ];

      expect(() => {
        calculateStatistics([NaN, undefined, 25, 30]);
      }).not.toThrow();

      const validation = validateFuelEntry({
        amount: 'not-a-number',
        quantity: '',
        date: 'invalid',
      });

      expect(validation.isValid).toBe(false);
    });

    test('should handle concurrent operations', async () => {
      const promises = [
        FuelService.getAnalyticsSummary(new Date('2024-01-01'), new Date('2024-02-01')),
        FuelService.getMonthlyTrends(6),
        FuelService.getVehicleComparison(new Date('2024-01-01'), new Date('2024-02-01')),
        FuelService.search({ vehicleId: 'vehicle-1' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});