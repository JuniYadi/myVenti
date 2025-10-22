import { Vehicle, ServiceRecord, FuelRecord, UserProfile } from '@/types';

export const seedData = {
  userProfile: {
    id: 'user-1',
    name: 'John Doe',
    regionalSettings: {
      region: 'US' as const,
      currency: 'USD' as const,
      fuelUnit: 'gallons' as const,
      distanceUnit: 'miles' as const,
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h' as const,
      numberFormat: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    notificationPreferences: {
      serviceReminders: true,
      fuelReminders: true,
      generalNotifications: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    },
    appPreferences: {
      theme: 'system' as const,
      autoBackup: true,
      dataRetentionDays: 3650,
      showTips: true,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  } as UserProfile,

  vehicles: [
    {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      vehicleType: 'car' as const,
      licensePlate: 'ABC 123',
      color: 'Silver',
      currentMileage: 15000,
      mileageUnit: 'miles' as const,
      imageUrl: undefined,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'vehicle-2',
      make: 'Honda',
      model: 'CBR600RR',
      year: 2021,
      vehicleType: 'motorbike' as const,
      licensePlate: 'MOTO 456',
      color: 'Red',
      currentMileage: 5000,
      mileageUnit: 'miles' as const,
      imageUrl: undefined,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    },
    {
      id: 'vehicle-3',
      make: 'Ford',
      model: 'F-150',
      year: 2020,
      vehicleType: 'truck' as const,
      licensePlate: 'TRUCK 789',
      color: 'Blue',
      currentMileage: 35000,
      mileageUnit: 'miles' as const,
      imageUrl: undefined,
      isActive: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
    },
  ] as Vehicle[],

  serviceRecords: [
    {
      id: 'service-1',
      vehicleId: 'vehicle-1',
      serviceDate: new Date('2024-01-15'),
      serviceType: 'oil_change' as const,
      description: 'Regular oil change with synthetic oil and filter replacement',
      mileageAtService: 12000,
      mileageUnit: 'miles' as const,
      cost: 45.99,
      currency: 'USD' as const,
      serviceProvider: 'Quick Lube Express',
      location: '123 Main St, City, State',
      notes: 'Used full synthetic oil',
      nextServiceMileage: 15000,
      nextServiceDate: new Date('2024-04-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    },
    {
      id: 'service-2',
      vehicleId: 'vehicle-1',
      serviceDate: new Date('2024-02-20'),
      serviceType: 'tire_rotation' as const,
      description: 'Tire rotation and balance check',
      mileageAtService: 13500,
      mileageUnit: 'miles' as const,
      cost: 25.00,
      currency: 'USD' as const,
      serviceProvider: 'Tire Plus',
      location: '456 Oak Ave, City, State',
      notes: 'All tires in good condition',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date(),
    },
    {
      id: 'service-3',
      vehicleId: 'vehicle-2',
      serviceDate: new Date('2024-01-30'),
      serviceType: 'oil_change' as const,
      description: 'Motorcycle oil change with premium oil',
      mileageAtService: 4000,
      mileageUnit: 'miles' as const,
      cost: 65.50,
      currency: 'USD' as const,
      serviceProvider: 'Bike Pro Service',
      location: '789 Cycle Rd, City, State',
      notes: 'Chain adjusted and lubricated',
      nextServiceMileage: 6000,
      createdAt: new Date('2024-01-30'),
      updatedAt: new Date(),
    },
  ] as ServiceRecord[],

  fuelRecords: [
    {
      id: 'fuel-1',
      vehicleId: 'vehicle-1',
      fillDate: new Date('2024-02-01'),
      odometerReading: 15000,
      mileageUnit: 'miles' as const,
      fuelAmount: 12.5,
      fuelUnit: 'gallons' as const,
      costPerUnit: 3.45,
      totalCost: 43.13,
      currency: 'USD' as const,
      fuelType: 'regular' as const,
      fuelStation: 'Shell Station',
      location: 'Main Street & 1st Ave',
      isFullTank: true,
      notes: 'Filled up completely',
      mpg: 28.0,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
    },
    {
      id: 'fuel-2',
      vehicleId: 'vehicle-1',
      fillDate: new Date('2024-02-15'),
      odometerReading: 15750,
      mileageUnit: 'miles' as const,
      fuelAmount: 11.8,
      fuelUnit: 'gallons' as const,
      costPerUnit: 3.52,
      totalCost: 41.54,
      currency: 'USD' as const,
      fuelType: 'regular' as const,
      fuelStation: 'Chevron',
      location: 'Highway 101',
      isFullTank: true,
      notes: 'Prices going up',
      mpg: 25.4,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date(),
    },
    {
      id: 'fuel-3',
      vehicleId: 'vehicle-2',
      fillDate: new Date('2024-02-10'),
      odometerReading: 5000,
      mileageUnit: 'miles' as const,
      fuelAmount: 4.2,
      fuelUnit: 'gallons' as const,
      costPerUnit: 4.15,
      totalCost: 17.43,
      currency: 'USD' as const,
      fuelType: 'premium' as const,
      fuelStation: 'Mobile',
      location: 'Downtown Exit',
      isFullTank: true,
      notes: 'Premium gas for motorcycle',
      mpg: 45.2,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date(),
    },
    {
      id: 'fuel-4',
      vehicleId: 'vehicle-3',
      fillDate: new Date('2024-02-05'),
      odometerReading: 35000,
      mileageUnit: 'miles' as const,
      fuelAmount: 25.0,
      fuelUnit: 'gallons' as const,
      costPerUnit: 3.38,
      totalCost: 84.50,
      currency: 'USD' as const,
      fuelType: 'regular' as const,
      fuelStation: 'Pilot',
      location: 'Interstate 5',
      isFullTank: true,
      notes: 'Big truck, big tank',
      mpg: 15.2,
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date(),
    },
  ] as FuelRecord[],
};

// Initialize app with dummy data
export const initializeDummyData = async () => {
  const { vehicleStorage, serviceStorage, fuelStorage, userProfileStorage } =
    await import('@/services/storage');

  try {
    await userProfileStorage.saveUserProfile(seedData.userProfile);

    for (const vehicle of seedData.vehicles) {
      await vehicleStorage.saveVehicle(vehicle);
    }

    for (const service of seedData.serviceRecords) {
      await serviceStorage.saveServiceRecord(service);
    }

    for (const fuel of seedData.fuelRecords) {
      await fuelStorage.saveFuelRecord(fuel);
    }

    console.log('Dummy data initialized successfully');
  } catch (error) {
    console.error('Error initializing dummy data:', error);
  }
};

// Indonesian region variant for testing regional settings
export const indonesianSeedData = {
  ...seedData,
  userProfile: {
    ...seedData.userProfile,
    id: 'user-2',
    name: 'Budi Santoso',
    regionalSettings: {
      region: 'ID' as const,
      currency: 'IDR' as const,
      fuelUnit: 'liters' as const,
      distanceUnit: 'kilometers' as const,
      dateFormat: 'dd/MM/yyyy',
      timeFormat: '24h' as const,
      numberFormat: {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      },
    },
  },

  // Convert vehicles to metric
  vehicles: seedData.vehicles.map(vehicle => ({
    ...vehicle,
    id: `${vehicle.id}-id`, // Make unique IDs
    currentMileage: Math.round(vehicle.currentMileage * 1.60934), // Convert to km
    mileageUnit: 'kilometers' as const,
  })),

  // Convert service records to metric
  serviceRecords: seedData.serviceRecords.map(service => ({
    ...service,
    id: `${service.id}-id`,
    mileageAtService: Math.round(service.mileageAtService * 1.60934), // Convert to km
    mileageUnit: 'kilometers' as const,
    cost: Math.round(service.cost * 15000), // Convert to IDR (rough rate)
    currency: 'IDR' as const,
  })),

  // Convert fuel records to metric
  fuelRecords: seedData.fuelRecords.map(fuel => ({
    ...fuel,
    id: `${fuel.id}-id`,
    odometerReading: Math.round(fuel.odometerReading * 1.60934), // Convert to km
    mileageUnit: 'kilometers' as const,
    fuelAmount: Math.round(fuel.fuelAmount * 3.78541 * 100) / 100, // Convert to liters
    fuelUnit: 'liters' as const,
    costPerUnit: Math.round(fuel.costPerUnit * 15000 / 3.78541), // Convert to IDR per liter
    totalCost: Math.round(fuel.totalCost * 15000), // Convert to IDR
    currency: 'IDR' as const,
    lph: Math.round((100 / (fuel.mpg * 1.60934)) * 3.78541 * 100) / 100, // Calculate L/100km
    mpg: undefined, // Remove MPG when using metric
  })),
};