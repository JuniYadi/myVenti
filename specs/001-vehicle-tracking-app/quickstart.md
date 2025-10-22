# Quick Start Guide: MyVenti Vehicle Tracking Application

**Created**: 2025-10-22
**Technology Stack**: React Expo + TypeScript + Bun
**Focus**: UI/UX Prototype with Dummy Data

## Prerequisites

- **Bun**: v1.3.0+ (install from https://bun.sh)
- **Node.js LTS**: Required for specific Expo commands
- **Expo Go**: Install on iOS/Android device for testing
- **VS Code**: Recommended with React Native Tools extension

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd /home/juniyadi/github/JuniYadi/myVenti

# Install dependencies with Bun
bun install

# Generate binary lock file for EAS builds
bun install --frozen-lockfile
```

### 2. Start Development Server

```bash
# Start Expo development server
bun run start

# Or start with specific platform
bun run start --ios      # iOS simulator
bun run start --android  # Android emulator
bun run start --web      # Web browser
```

### 3. Test on Device

1. Install **Expo Go** app on your device
2. Scan QR code from terminal or browser
3. Open the app to see the initial UI

## Project Structure

```
myVenti/
├── app/                          # Expo Router file-based routing
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx          # Tab navigation configuration
│   │   ├── vehicles.tsx         # Vehicle list screen
│   │   ├── services.tsx         # Service history screen
│   │   ├── fuel.tsx             # Fuel tracking screen
│   │   └── settings.tsx         # Settings screen
│   ├── vehicle/                  # Vehicle-related screens
│   │   ├── [id].tsx            # Vehicle details
│   │   ├── add.tsx             # Add vehicle form
│   │   └── edit.tsx            # Edit vehicle form
│   ├── service/                  # Service-related screens
│   │   ├── [id].tsx            # Service details
│   │   ├── add.tsx             # Add service form
│   │   └── edit.tsx            # Edit service form
│   ├── fuel/                     # Fuel-related screens
│   │   ├── [id].tsx            # Fuel record details
│   │   ├── add.tsx             # Add fuel record form
│   │   ├── statistics.tsx      # Fuel statistics
│   │   └── edit.tsx            # Edit fuel record form
│   ├── _layout.tsx              # Root layout
│   └── +not-found.tsx          # 404 page

components/                   # Reusable UI components
├── shared/                  # Generic components
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── List/
│   └── index.ts
├── forms/                   # Form-specific components
│   ├── VehicleForm/
│   ├── ServiceForm/
│   ├── FuelForm/
│   └── index.ts
└── features/                # Feature-specific components
    ├── VehicleList/
    ├── ServiceHistory/
    ├── FuelStatistics/
    └── index.ts

services/                     # Business logic and data management
├── storage/
│   ├── asyncStorage.ts      # AsyncStorage wrapper
│   ├── vehicleStorage.ts    # Vehicle data operations
│   ├── serviceStorage.ts    # Service data operations
│   ├── fuelStorage.ts       # Fuel data operations
│   └── index.ts
├── validation/
│   ├── vehicleValidation.ts
│   ├── serviceValidation.ts
│   ├── fuelValidation.ts
│   └── index.ts
├── regional/
│   ├── currency.ts          # Currency formatting
│   ├── units.ts             # Unit conversion utilities
│   └── index.ts
└── index.ts

utils/                        # Utility functions
├── date.ts                  # Date formatting utilities
├── number.ts                # Number formatting utilities
├── validation.ts            # General validation helpers
├── constants.ts             # App constants
└── index.ts

types/                        # TypeScript type definitions
├── vehicle.ts               # Vehicle-related types
├── service.ts               # Service-related types
├── fuel.ts                  # Fuel-related types
├── user.ts                  # User profile types
├── storage.ts               # Storage-related types
└── index.ts

constants/                    # App constants and configuration
├── storage.ts               # AsyncStorage keys
├── navigation.ts            # Navigation options
├── regional.ts              # Regional settings defaults
└── index.ts

assets/                       # Static assets
├── images/
│   ├── icons/
│   ├── vehicles/
│   └── placeholders/
├── fonts/
└── data/
    └── seedData.ts          # Initial dummy data

# Package and Configuration Files
package.json                 # Dependencies and scripts
bun.lockb                   # Bun binary lock file
tsconfig.json               # TypeScript configuration
app.json                    # Expo configuration
eas.json                    # EAS Build configuration
babel.config.js             # Babel configuration
metro.config.js             # Metro bundler configuration
.gitignore
README.md
```

## Core Components Overview

### 1. Navigation Structure

```typescript
// app/(tabs)/_layout.tsx - Tab Navigation
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
        }}
      />
      {/* Additional tabs for services, fuel, settings */}
    </Tabs>
  );
}
```

### 2. Data Management

```typescript
// services/storage/vehicleStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '@/types';

const VEHICLES_KEY = '@myventi_vehicles';

export const vehicleStorage = {
  async getVehicles(): Promise<Vehicle[]> {
    const data = await AsyncStorage.getItem(VEHICLES_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveVehicle(vehicle: Vehicle): Promise<void> {
    const vehicles = await this.getVehicles();
    const existingIndex = vehicles.findIndex(v => v.id === vehicle.id);

    if (existingIndex >= 0) {
      vehicles[existingIndex] = vehicle;
    } else {
      vehicles.push(vehicle);
    }

    await AsyncStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    const vehicles = await this.getVehicles();
    const filtered = vehicles.filter(v => v.id !== vehicleId);
    await AsyncStorage.setItem(VEHICLES_KEY, JSON.stringify(filtered));
  }
};
```

### 3. Form Components

```typescript
// components/forms/VehicleForm/VehicleForm.tsx
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { vehicleValidation } from '@/services/validation';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

interface VehicleFormProps {
  initialVehicle?: Partial<Vehicle>;
  onSubmit: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialVehicle,
  onSubmit,
  onCancel
}) => {
  const [vehicle, setVehicle] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vehicleType: 'car',
    licensePlate: '',
    color: '',
    currentMileage: 0,
    mileageUnit: 'miles',
    ...initialVehicle
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const validationErrors = vehicleValidation.validate(vehicle);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(vehicle as Vehicle);
  };

  return (
    <View style={styles.form}>
      <Input
        label="Make"
        value={vehicle.make}
        onChangeText={(text) => setVehicle({ ...vehicle, make: text })}
        error={errors.make}
        autoCapitalize="words"
      />

      <Input
        label="Model"
        value={vehicle.model}
        onChangeText={(text) => setVehicle({ ...vehicle, model: text })}
        error={errors.model}
        autoCapitalize="words"
      />

      {/* Additional form fields */}

      <Button title="Save Vehicle" onPress={handleSubmit} />
      <Button title="Cancel" onPress={onCancel} variant="secondary" />
    </View>
  );
};
```

## Dummy Data Setup

### 1. Initial Data Seed

```typescript
// services/storage/seedData.ts
import { Vehicle, ServiceRecord, FuelRecord, UserProfile } from '@/types';

export const seedData = {
  userProfile: {
    id: 'user-1',
    name: 'John Doe',
    regionalSettings: {
      region: 'US',
      currency: 'USD',
      fuelUnit: 'gallons',
      distanceUnit: 'miles',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h'
    }
  } as UserProfile,

  vehicles: [
    {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      vehicleType: 'car',
      licensePlate: 'ABC 123',
      color: 'Silver',
      currentMileage: 15000,
      mileageUnit: 'miles',
      isActive: true
    },
    {
      id: 'vehicle-2',
      make: 'Honda',
      model: 'CBR600RR',
      year: 2021,
      vehicleType: 'motorbike',
      licensePlate: 'MOTO 456',
      color: 'Red',
      currentMileage: 5000,
      mileageUnit: 'miles',
      isActive: true
    }
  ] as Vehicle[],

  serviceRecords: [
    {
      id: 'service-1',
      vehicleId: 'vehicle-1',
      serviceDate: new Date('2024-01-15'),
      serviceType: 'oil_change',
      description: 'Regular oil change with synthetic oil',
      mileageAtService: 12000,
      mileageUnit: 'miles',
      cost: 45.99,
      currency: 'USD',
      serviceProvider: 'Quick Lube Express'
    }
  ] as ServiceRecord[],

  fuelRecords: [
    {
      id: 'fuel-1',
      vehicleId: 'vehicle-1',
      fillDate: new Date('2024-02-01'),
      odometerReading: 15000,
      mileageUnit: 'miles',
      fuelAmount: 12.5,
      fuelUnit: 'gallons',
      costPerUnit: 3.45,
      totalCost: 43.13,
      currency: 'USD',
      fuelType: 'regular',
      isFullTank: true
    }
  ] as FuelRecord[]
};

// Initialize app with dummy data
export const initializeDummyData = async () => {
  const { vehicleStorage, serviceStorage, fuelStorage, userProfileStorage } =
    await import('@/services/storage');

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
};
```

## Development Workflow

### 1. Adding New Features

1. **Define Types**: Add TypeScript interfaces in `/types/`
2. **Create Storage**: Implement data operations in `/services/storage/`
3. **Add Validation**: Create validation rules in `/services/validation/`
4. **Build Components**: Create UI components in `/components/`
5. **Add Screens**: Create navigation screens in `/app/`
6. **Update Navigation**: Add new routes to navigation structure

### 2. Testing on Devices

```bash
# Test on physical device
bun run start
# Scan QR code with Expo Go app

# Test on simulator
bun run start --ios     # iOS Simulator
bun run start --android # Android Emulator

# Test on web
bun run start --web
```

### 3. Building for Production

```bash
# Build for app stores (requires EAS configuration)
bun install -g eas-cli
eas build --platform all
```

## Common Commands

```bash
# Development
bun run start           # Start development server
bun run start --clear   # Clear cache and start
bun run android         # Start Android development
bun run ios            # Start iOS development
bun run web            # Start web development

# Code Quality
bun run lint           # Run ESLint
bun run type-check     # TypeScript type checking

# Package Management
bun add <package>      # Add dependency
bun add -D <package>   # Add dev dependency
bun update             # Update dependencies
bun remove <package>   # Remove dependency
```

## Validation Rules

### Vehicle Data
- **Year**: 1900 to current year + 1
- **License Plate**: 3-20 characters
- **VIN**: Exactly 17 characters (if provided)
- **Mileage**: Non-negative numbers only

### Service Data
- **Cost**: Non-negative numbers
- **Date**: Cannot be future dates
- **Description**: 5-500 characters

### Fuel Data
- **Amount**: 0.01-1000 units
- **Cost**: USD: 0.01-10000, IDR: 0.01-1000000
- **Date**: Cannot be future dates

## Regional Support

### United States (US)
- **Fuel Unit**: Gallons
- **Currency**: USD ($)
- **Distance**: Miles
- **Date Format**: MM/dd/yyyy

### Indonesia (ID)
- **Fuel Unit**: Liters
- **Currency**: IDR (Rp)
- **Distance**: Kilometers
- **Date Format**: dd/MM/yyyy

## Next Steps

1. **Set up development environment** with Bun and Node.js LTS
2. **Run initial setup** and test basic navigation
3. **Implement vehicle management** features first
4. **Add service history tracking** functionality
5. **Implement fuel tracking** with regional support
6. **Add reminder system** and notifications
7. **Polish UI/UX** with animations and accessibility

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `bun run start --clear`
2. **TypeScript errors**: Check `tsconfig.json` paths configuration
3. **AsyncStorage errors**: Ensure `@react-native-async-storage/async-storage` is installed
4. **Navigation errors**: Verify Expo Router configuration in `app/_layout.tsx`
5. **Build errors**: Check that `bun.lockb` exists for EAS builds

### Getting Help

- Check [Expo documentation](https://docs.expo.dev/)
- Review [React Native docs](https://reactnative.dev/)
- Use Expo forums for community support
- Check project issues on GitHub

This quick start guide provides the foundation for developing the MyVenti vehicle tracking application with React Expo and Bun.