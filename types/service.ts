import { DistanceUnit } from './vehicle';

export interface ServiceRecord {
  id: string;                    // UUID
  vehicleId: string;             // Foreign key to Vehicle
  serviceDate: Date;             // Date of service
  serviceType: ServiceType;      // Type of service performed
  description: string;           // Detailed description
  mileageAtService: number;      // Odometer reading at service
  mileageUnit: DistanceUnit;     // miles | kilometers
  cost: number;                  // Total cost of service
  currency: Currency;            // USD | IDR
  serviceProvider: string;       // Shop or mechanic name
  location?: string;             // Service location
  notes?: string;                // Additional notes
  nextServiceMileage?: number;   // Recommended next service mileage
  nextServiceDate?: Date;        // Recommended next service date
  createdAt: Date;               // When record was created
  updatedAt: Date;               // Last update timestamp
}

export enum ServiceType {
  OIL_CHANGE = 'oil_change',
  TIRE_ROTATION = 'tire_rotation',
  BRAKE_SERVICE = 'brake_service',
  BATTERY_REPLACEMENT = 'battery_replacement',
  TRANSMISSION_SERVICE = 'transmission_service',
  AIR_FILTER = 'air_filter',
  SPARK_PLUGS = 'spark_plugs',
  INSPECTION = 'inspection',
  REPAIR = 'repair',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

export enum Currency {
  USD = 'USD',
  IDR = 'IDR'
}

export interface ServiceFormData {
  vehicleId: string;
  serviceDate: Date;
  serviceType: ServiceType;
  description: string;
  mileageAtService: number;
  mileageUnit: DistanceUnit;
  cost: number;
  currency: Currency;
  serviceProvider: string;
  location?: string;
  notes?: string;
  nextServiceMileage?: number;
  nextServiceDate?: Date;
}

export interface ServiceValidationErrors {
  vehicleId?: string;
  serviceDate?: string;
  serviceType?: string;
  description?: string;
  mileageAtService?: string;
  cost?: string;
  serviceProvider?: string;
  nextServiceMileage?: string;
  nextServiceDate?: string;
}

export interface ServiceStatistics {
  totalServices: number;         // Total number of services
  totalSpent: number;            // Total money spent on services
  averageServiceCost: number;    // Average cost per service
  servicesByType: Record<ServiceType, number>; // Count by type
  lastServiceDate?: Date;        // Most recent service
  nextServiceDue?: Date;         // Next service due date
}