/**
 * Form validation utilities for myVenti vehicle tracking application
 * Provides consistent validation functions for all data types
 */

import {
  VehicleFormData,
  FuelFormData,
  ServiceFormData,
  VehicleType,
} from '@/types/data';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface DateRangeValidationRule {
  startDate?: string;
  endDate?: string;
  minDays?: number;
  maxDays?: number;
  allowFuture?: boolean;
  custom?: (startDate: string, endDate: string) => string | null;
}

export interface PriceRangeValidationRule {
  minPrice?: number;
  maxPrice?: number;
  custom?: (minPrice: number, maxPrice: number) => string | null;
}

export interface LocationValidationRule {
  latitude?: number;
  longitude?: number;
  required?: boolean;
  custom?: (location: { latitude: number; longitude: number }) => string | null;
}

/**
 * Vehicle validation rules and functions
 */
export const VehicleValidation = {
  rules: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-']+$/,
      custom: (value: string) => {
        if (!value.trim()) {
          return 'Vehicle name is required';
        }
        return null;
      },
    } as ValidationRule,
    year: {
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
      pattern: /^\d{4}$/,
      custom: (value: string) => {
        const year = parseInt(value);
        if (isNaN(year)) {
          return 'Year must be a valid number';
        }
        if (year < 1900) {
          return 'Year must be 1900 or later';
        }
        if (year > new Date().getFullYear() + 1) {
          return `Year cannot be more than ${new Date().getFullYear() + 1}`;
        }
        return null;
      },
    } as ValidationRule,
    make: {
      required: true,
      minLength: 2,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9\s\-']+$/,
      custom: (value: string) => {
        if (!value.trim()) {
          return 'Make is required';
        }
        return null;
      },
    } as ValidationRule,
    model: {
      required: true,
      minLength: 1,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9\s\-']+$/,
      custom: (value: string) => {
        if (!value.trim()) {
          return 'Model is required';
        }
        return null;
      },
    } as ValidationRule,
    type: {
      required: true,
      custom: (value: string) => {
        const validTypes: VehicleType[] = ['gas', 'electric', 'hybrid'];
        if (!validTypes.includes(value as VehicleType)) {
          return 'Please select a valid vehicle type';
        }
        return null;
      },
    } as ValidationRule,
  },

  validate: (data: VehicleFormData): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Vehicle name must be at least 2 characters';
    } else if (data.name.length > 50) {
      errors.name = 'Vehicle name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z0-9\s\-']+$/.test(data.name)) {
      errors.name = 'Vehicle name contains invalid characters';
    }

    // Validate year
    if (!data.year) {
      errors.year = 'Year is required';
    } else if (isNaN(parseInt(data.year))) {
      errors.year = 'Year must be a valid number';
    } else {
      const year = parseInt(data.year);
      if (year < 1900) {
        errors.year = 'Year must be 1900 or later';
      } else if (year > new Date().getFullYear() + 1) {
        errors.year = `Year cannot be more than ${new Date().getFullYear() + 1}`;
      }
    }

    // Validate make
    if (!data.make || data.make.trim().length < 2) {
      errors.make = 'Make must be at least 2 characters';
    } else if (data.make.length > 30) {
      errors.make = 'Make cannot exceed 30 characters';
    } else if (!/^[a-zA-Z0-9\s\-']+$/.test(data.make)) {
      errors.make = 'Make contains invalid characters';
    }

    // Validate model
    if (!data.model || data.model.trim().length < 1) {
      errors.model = 'Model is required';
    } else if (data.model.length > 30) {
      errors.model = 'Model cannot exceed 30 characters';
    } else if (!/^[a-zA-Z0-9\s\-']+$/.test(data.model)) {
      errors.model = 'Model contains invalid characters';
    }

    // Validate type
    const validTypes: VehicleType[] = ['gas', 'electric', 'hybrid'];
    if (!data.type || !validTypes.includes(data.type)) {
      errors.type = 'Please select a valid vehicle type';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

/**
 * Fuel entry validation rules and functions
 */
export const FuelValidation = {
  rules: {
    vehicleId: {
      required: true,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Please select a vehicle';
        }
        return null;
      },
    } as ValidationRule,
    date: {
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      custom: (value: string) => {
        if (!value) {
          return 'Date is required';
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Please enter a valid date';
        }
        if (date > new Date()) {
          return 'Date cannot be in the future';
        }
        return null;
      },
    } as ValidationRule,
    amount: {
      required: true,
      min: 0.01,
      pattern: /^\d*\.?\d+$/,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Total amount is required';
        }
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
          return 'Amount must be greater than 0';
        }
        return null;
      },
    } as ValidationRule,
    quantity: {
      required: true,
      min: 0.01,
      pattern: /^\d*\.?\d+$/,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Quantity is required';
        }
        const quantity = parseFloat(value);
        if (isNaN(quantity) || quantity <= 0) {
          return 'Quantity must be greater than 0';
        }
        if (quantity > 1000) {
          return 'Quantity seems too high';
        }
        return null;
      },
    } as ValidationRule,
    pricePerUnit: {
      required: true,
      min: 0.01,
      pattern: /^\d*\.?\d+$/,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Price per unit is required';
        }
        const price = parseFloat(value);
        if (isNaN(price) || price <= 0) {
          return 'Price must be greater than 0';
        }
        if (price > 1000) {
          return 'Price per unit seems too high';
        }
        return null;
      },
    } as ValidationRule,
    mileage: {
      required: true,
      min: 0,
      pattern: /^\d+$/,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Mileage is required';
        }
        const mileage = parseInt(value);
        if (isNaN(mileage) || mileage < 0) {
          return 'Mileage must be 0 or greater';
        }
        if (mileage > 10000000) {
          return 'Mileage seems too high';
        }
        return null;
      },
    } as ValidationRule,
    fuelStation: {
      required: false,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-.'&,\#]+$/,
      custom: (value: string) => {
        if (value && value.trim()) {
          if (value.length > 100) {
            return 'Fuel station name cannot exceed 100 characters';
          }
          if (!/^[a-zA-Z0-9\s\-.'&,\#]+$/.test(value)) {
            return 'Fuel station name contains invalid characters';
          }
        }
        return null;
      },
    } as ValidationRule,
    notes: {
      required: false,
      maxLength: 500,
      custom: (value: string) => {
        if (value && value.trim()) {
          if (value.length > 500) {
            return 'Notes cannot exceed 500 characters';
          }
          // Check for potentially harmful content
          const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
          ];
          for (const pattern of dangerousPatterns) {
            if (pattern.test(value)) {
              return 'Notes contain invalid content';
            }
          }
        }
        return null;
      },
    } as ValidationRule,
    location: {
      required: false,
      custom: (value: any) => {
        if (value && typeof value === 'object') {
          const { latitude, longitude } = value;

          // Validate latitude
          if (latitude !== undefined) {
            if (isNaN(latitude) || latitude < -90 || latitude > 90) {
              return 'Latitude must be between -90 and 90 degrees';
            }
          }

          // Validate longitude
          if (longitude !== undefined) {
            if (isNaN(longitude) || longitude < -180 || longitude > 180) {
              return 'Longitude must be between -180 and 180 degrees';
            }
          }

          // Both latitude and longitude must be provided if one is provided
          if ((latitude !== undefined && longitude === undefined) ||
              (latitude === undefined && longitude !== undefined)) {
            return 'Both latitude and longitude must be provided together';
          }
        }
        return null;
      },
    } as ValidationRule,
  },

  validate: (data: FuelFormData): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validate vehicleId
    if (!data.vehicleId || data.vehicleId.trim() === '') {
      errors.vehicleId = 'Please select a vehicle';
    }

    // Validate date
    if (!data.date) {
      errors.date = 'Date is required';
    } else {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.date = 'Please enter a valid date (YYYY-MM-DD)';
      } else if (date > new Date()) {
        errors.date = 'Date cannot be in the future';
      }
    }

    // Validate amount
    if (!data.amount || data.amount.trim() === '') {
      errors.amount = 'Total amount is required';
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Amount must be greater than 0';
      } else if (amount > 10000) {
        errors.amount = 'Amount seems too high';
      }
    }

    // Validate quantity
    if (!data.quantity || data.quantity.trim() === '') {
      errors.quantity = 'Quantity is required';
    } else {
      const quantity = parseFloat(data.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.quantity = 'Quantity must be greater than 0';
      } else if (quantity > 1000) {
        errors.quantity = 'Quantity seems too high';
      }
    }

    // Validate price per unit
    if (!data.pricePerUnit || data.pricePerUnit.trim() === '') {
      errors.pricePerUnit = 'Price per unit is required';
    } else {
      const price = parseFloat(data.pricePerUnit);
      if (isNaN(price) || price <= 0) {
        errors.pricePerUnit = 'Price must be greater than 0';
      } else if (price > 1000) {
        errors.pricePerUnit = 'Price seems too high';
      }
    }

    // Validate mileage
    if (!data.mileage || data.mileage.trim() === '') {
      errors.mileage = 'Mileage is required';
    } else {
      const mileage = parseInt(data.mileage);
      if (isNaN(mileage) || mileage < 0) {
        errors.mileage = 'Mileage must be 0 or greater';
      } else if (mileage > 10000000) {
        errors.mileage = 'Mileage seems too high';
      }
    }

    // Validate fuel station (optional)
    if (data.fuelStation && data.fuelStation.trim()) {
      if (data.fuelStation.length > 100) {
        errors.fuelStation = 'Fuel station name cannot exceed 100 characters';
      } else if (!/^[a-zA-Z0-9\s\-.'&,\#]+$/.test(data.fuelStation)) {
        errors.fuelStation = 'Fuel station name contains invalid characters';
      }
    }

    // Validate notes (optional)
    if (data.notes && data.notes.trim()) {
      if (data.notes.length > 500) {
        errors.notes = 'Notes cannot exceed 500 characters';
      } else {
        // Check for potentially harmful content
        const dangerousPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
        ];
        for (const pattern of dangerousPatterns) {
          if (pattern.test(data.notes)) {
            errors.notes = 'Notes contain invalid content';
            break;
          }
        }
      }
    }

    // Validate data consistency
    if (data.amount && data.quantity && data.pricePerUnit) {
      const amount = parseFloat(data.amount);
      const quantity = parseFloat(data.quantity);
      const pricePerUnit = parseFloat(data.pricePerUnit);
      const calculatedAmount = quantity * pricePerUnit;

      // Allow for small rounding differences (within 5 cents)
      if (Math.abs(amount - calculatedAmount) > 0.05) {
        errors.consistency = 'Amount, quantity, and price per unit are inconsistent';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

/**
 * Service record validation rules and functions
 */
export const ServiceValidation = {
  rules: {
    vehicleId: {
      required: true,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Please select a vehicle';
        }
        return null;
      },
    } as ValidationRule,
    date: {
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      custom: (value: string) => {
        if (!value) {
          return 'Date is required';
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Please enter a valid date';
        }
        if (date > new Date()) {
          return 'Date cannot be in the future';
        }
        return null;
      },
    } as ValidationRule,
    type: {
      required: true,
      minLength: 2,
      maxLength: 50,
      custom: (value: string) => {
        if (!value || value.trim().length < 2) {
          return 'Service type is required';
        }
        return null;
      },
    } as ValidationRule,
    description: {
      required: true,
      minLength: 5,
      maxLength: 200,
      custom: (value: string) => {
        if (!value || value.trim().length < 5) {
          return 'Description must be at least 5 characters';
        }
        return null;
      },
    } as ValidationRule,
    cost: {
      required: true,
      min: 0,
      pattern: /^\d*\.?\d+$/,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Cost is required';
        }
        const cost = parseFloat(value);
        if (isNaN(cost) || cost < 0) {
          return 'Cost must be 0 or greater';
        }
        if (cost > 10000) {
          return 'Cost seems too high';
        }
        return null;
      },
    } as ValidationRule,
    mileage: {
      required: true,
      min: 0,
      pattern: /^\d+$/,
      custom: (value: string) => {
        if (!value || value.trim() === '') {
          return 'Mileage is required';
        }
        const mileage = parseInt(value);
        if (isNaN(mileage) || mileage < 0) {
          return 'Mileage must be 0 or greater';
        }
        if (mileage > 10000000) {
          return 'Mileage seems too high';
        }
        return null;
      },
    } as ValidationRule,
    notes: {
      maxLength: 500,
      custom: (value: string) => {
        if (value && value.length > 500) {
          return 'Notes cannot exceed 500 characters';
        }
        return null;
      },
    } as ValidationRule,
  },

  validate: (data: ServiceFormData): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validate vehicleId
    if (!data.vehicleId || data.vehicleId.trim() === '') {
      errors.vehicleId = 'Please select a vehicle';
    }

    // Validate date
    if (!data.date) {
      errors.date = 'Date is required';
    } else {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.date = 'Please enter a valid date (YYYY-MM-DD)';
      } else if (date > new Date()) {
        errors.date = 'Date cannot be in the future';
      }
    }

    // Validate type
    if (!data.type || data.type.trim().length < 2) {
      errors.type = 'Service type must be at least 2 characters';
    } else if (data.type.length > 50) {
      errors.type = 'Service type cannot exceed 50 characters';
    }

    // Validate description
    if (!data.description || data.description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters';
    } else if (data.description.length > 200) {
      errors.description = 'Description cannot exceed 200 characters';
    }

    // Validate cost
    if (!data.cost || data.cost.trim() === '') {
      errors.cost = 'Cost is required';
    } else {
      const cost = parseFloat(data.cost);
      if (isNaN(cost) || cost < 0) {
        errors.cost = 'Cost must be 0 or greater';
      } else if (cost > 10000) {
        errors.cost = 'Cost seems too high';
      }
    }

    // Validate mileage
    if (!data.mileage || data.mileage.trim() === '') {
      errors.mileage = 'Mileage is required';
    } else {
      const mileage = parseInt(data.mileage);
      if (isNaN(mileage) || mileage < 0) {
        errors.mileage = 'Mileage must be 0 or greater';
      } else if (mileage > 10000000) {
        errors.mileage = 'Mileage seems too high';
      }
    }

    // Validate notes (optional)
    if (data.notes && data.notes.length > 500) {
      errors.notes = 'Notes cannot exceed 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

/**
 * Common validation utilities
 */
export const ValidationUtils = {
  /**
   * Sanitize string input by trimming whitespace
   */
  sanitizeString: (value: string): string => {
    return value.trim();
  },

  /**
   * Validate email format
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   */
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  /**
   * Format currency input
   */
  formatCurrency: (value: string): string => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleanValue;
  },

  /**
   * Format number input
   */
  formatNumber: (value: string): string => {
    return value.replace(/[^\d]/g, '');
  },

  /**
   * Check if a date is valid
   */
  isValidDate: (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },

  /**
   * Check if a date is in the past
   */
  isPastDate: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date < new Date();
  },

  /**
   * Check if a date is within a reasonable range
   */
  isReasonableDate: (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const hundredYearsAgo = new Date(now.getFullYear() - 100, 0, 1);
    const tenYearsFromNow = new Date(now.getFullYear() + 10, 0, 1);
    return date >= hundredYearsAgo && date <= tenYearsFromNow;
  },
};

/**
 * Date range validation utilities
 */
export const DateRangeValidation = {
  /**
   * Validate a date range
   */
  validateDateRange: (
    startDate: string,
    endDate: string,
    options: DateRangeValidationRule = {}
  ): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validate start date
    if (!startDate) {
      errors.startDate = 'Start date is required';
    } else if (!ValidationUtils.isValidDate(startDate)) {
      errors.startDate = 'Please enter a valid start date';
    } else if (!options.allowFuture && !ValidationUtils.isPastDate(startDate)) {
      errors.startDate = 'Start date cannot be in the future';
    }

    // Validate end date
    if (!endDate) {
      errors.endDate = 'End date is required';
    } else if (!ValidationUtils.isValidDate(endDate)) {
      errors.endDate = 'Please enter a valid end date';
    } else if (!options.allowFuture && !ValidationUtils.isPastDate(endDate)) {
      errors.endDate = 'End date cannot be in the future';
    }

    // Validate date order
    if (startDate && endDate && ValidationUtils.isValidDate(startDate) && ValidationUtils.isValidDate(endDate)) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        errors.dateRange = 'Start date must be before end date';
      }

      // Validate minimum days
      if (options.minDays) {
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < options.minDays) {
          errors.dateRange = `Date range must be at least ${options.minDays} days`;
        }
      }

      // Validate maximum days
      if (options.maxDays) {
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > options.maxDays) {
          errors.dateRange = `Date range cannot exceed ${options.maxDays} days`;
        }
      }
    }

    // Custom validation
    if (options.custom && startDate && endDate) {
      const customError = options.custom(startDate, endDate);
      if (customError) {
        errors.custom = customError;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Get common date range presets
   */
  getDateRangePresets: () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return {
      today: { startDate: today, endDate: today },
      last7Days: {
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today,
      },
      last30Days: {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today,
      },
      last90Days: {
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today,
      },
      thisMonth: {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        endDate: today,
      },
      lastMonth: {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
        endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
      },
      thisYear: {
        startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: today,
      },
    };
  },
};

/**
 * Price range validation utilities
 */
export const PriceRangeValidation = {
  /**
   * Validate a price range
   */
  validatePriceRange: (
    minPrice: number,
    maxPrice: number,
    options: PriceRangeValidationRule = {}
  ): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validate minimum price
    if (isNaN(minPrice) || minPrice < 0) {
      errors.minPrice = 'Minimum price must be 0 or greater';
    }

    // Validate maximum price
    if (isNaN(maxPrice) || maxPrice < 0) {
      errors.maxPrice = 'Maximum price must be 0 or greater';
    }

    // Validate price range logic
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      if (minPrice > maxPrice) {
        errors.priceRange = 'Minimum price cannot be greater than maximum price';
      }

      // Validate against options
      if (options.minPrice !== undefined && minPrice < options.minPrice) {
        errors.minPrice = `Minimum price cannot be less than $${options.minPrice}`;
      }

      if (options.maxPrice !== undefined && maxPrice > options.maxPrice) {
        errors.maxPrice = `Maximum price cannot exceed $${options.maxPrice}`;
      }
    }

    // Custom validation
    if (options.custom) {
      const customError = options.custom(minPrice, maxPrice);
      if (customError) {
        errors.custom = customError;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Get common price range presets
   */
  getPriceRangePresets: () => ({
    under2: { minPrice: 0, maxPrice: 2 },
    twoToFour: { minPrice: 2, maxPrice: 4 },
    fourToSix: { minPrice: 4, maxPrice: 6 },
    sixToEight: { minPrice: 6, maxPrice: 8 },
    over8: { minPrice: 8, maxPrice: 100 },
    budget: { minPrice: 0, maxPrice: 3 },
    moderate: { minPrice: 3, maxPrice: 6 },
    premium: { minPrice: 6, maxPrice: 100 },
  }),
};

/**
 * Location validation utilities
 */
export const LocationValidation = {
  /**
   * Validate GPS coordinates
   */
  validateLocation: (
    location: { latitude: number; longitude: number },
    options: LocationValidationRule = {}
  ): ValidationResult => {
    const errors: Record<string, string> = {};

    const { latitude, longitude } = location;

    // Validate latitude
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90 degrees';
    }

    // Validate longitude
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180 degrees';
    }

    // Check if location is required but missing
    if (options.required && (latitude === undefined || longitude === undefined)) {
      errors.location = 'Location is required';
    }

    // Custom validation
    if (options.custom) {
      const customError = options.custom(location);
      if (customError) {
        errors.custom = customError;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  },

  /**
   * Format coordinates for display
   */
  formatCoordinates: (latitude: number, longitude: number): string => {
    const lat = latitude.toFixed(6);
    const lon = longitude.toFixed(6);
    const latDir = latitude >= 0 ? 'N' : 'S';
    const lonDir = longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(Number(lat))}°${latDir}, ${Math.abs(Number(lon))}°${lonDir}`;
  },
};

// Export all validation utilities for easy importing
export {
  VehicleValidation,
  FuelValidation,
  ServiceValidation,
  ValidationUtils,
  DateRangeValidation,
  PriceRangeValidation,
  LocationValidation,
};