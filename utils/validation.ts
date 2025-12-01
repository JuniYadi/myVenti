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

// Export all validation utilities for easy importing
export {
  VehicleValidation,
  FuelValidation,
  ServiceValidation,
};