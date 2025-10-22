export interface Vehicle {
  id: string;                    // UUID
  make: string;                  // e.g., "Toyota", "Honda"
  model: string;                 // e.g., "Camry", "Civic"
  year: number;                  // e.g., 2022 (validated: 1900-current year+1)
  vehicleType: VehicleType;      // Motorbike | Car | Truck
  licensePlate: string;          // License plate number
  color: string;                 // Vehicle color
  vin?: string;                  // Vehicle Identification Number (17 chars)
  currentMileage: number;        // Current odometer reading
  mileageUnit: DistanceUnit;     // miles | kilometers
  imageUrl?: string;             // Optional vehicle photo
  isActive: boolean;             // Whether vehicle is in active list
  createdAt: Date;               // When vehicle was added
  updatedAt: Date;               // Last update timestamp
}

export enum VehicleType {
  MOTORBIKE = 'motorbike',
  CAR = 'car',
  TRUCK = 'truck'
}

export enum DistanceUnit {
  MILES = 'miles',
  KILOMETERS = 'kilometers'
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  licensePlate: string;
  color: string;
  vin?: string;
  currentMileage: number;
  mileageUnit: DistanceUnit;
  imageUrl?: string;
}

export interface VehicleValidationErrors {
  make?: string;
  model?: string;
  year?: string;
  vehicleType?: string;
  licensePlate?: string;
  color?: string;
  vin?: string;
  currentMileage?: string;
  mileageUnit?: string;
}