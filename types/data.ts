/**
 * Data type definitions for the myVenti vehicle tracking application
 * Provides type safety for vehicles, fuel entries, and service records
 */

export type VehicleType = 'gas' | 'electric' | 'hybrid';
export type VehicleStatus = 'active' | 'inactive';

export interface Vehicle {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FuelEntry {
  id: string;
  vehicleId: string;
  date: string;
  amount: number;
  quantity: number; // gallons for gas, kWh for electric
  pricePerUnit: number;
  mileage: number;
  mpg?: number; // calculated for gas vehicles only
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form data types for partial updates and creation
export interface VehicleFormData {
  name: string;
  year: string;
  make: string;
  model: string;
  type: VehicleType;
}

export interface FuelFormData {
  vehicleId: string;
  date: string;
  amount: string;
  quantity: string;
  pricePerUnit: string;
  mileage: string;
}

export interface ServiceFormData {
  vehicleId: string;
  date: string;
  type: string;
  description: string;
  cost: string;
  mileage: string;
  notes?: string;
}

// Dashboard summary types
export interface DashboardSummary {
  totalVehicles: number;
  activeVehicles: number;
  monthlyFuelCost: number;
  upcomingServices: number;
  totalMileage: number;
}

export interface RecentActivity {
  id: string;
  type: 'fuel' | 'service' | 'alert';
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  color: string;
}

// Export all types for easy importing
export type {
  Vehicle,
  FuelEntry,
  ServiceRecord,
  VehicleFormData,
  FuelFormData,
  ServiceFormData,
  DashboardSummary,
  RecentActivity,
};