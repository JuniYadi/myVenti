import { ServiceFormData, ServiceValidationErrors } from '@/types/service';
import { VALIDATION_LIMITS } from '@/constants/storage';

export class ServiceValidationService {
  static validate(service: ServiceFormData): ServiceValidationErrors {
    const errors: ServiceValidationErrors = {};

    // Vehicle ID validation
    if (!service.vehicleId || service.vehicleId.trim().length === 0) {
      errors.vehicleId = 'Vehicle selection is required';
    }

    // Service date validation
    if (!service.serviceDate) {
      errors.serviceDate = 'Service date is required';
    } else if (service.serviceDate > new Date()) {
      errors.serviceDate = 'Service date cannot be in the future';
    }

    // Service type validation
    if (!service.serviceType) {
      errors.serviceType = 'Service type is required';
    }

    // Description validation
    if (!service.description || service.description.trim().length < VALIDATION_LIMITS.DESCRIPTION_MIN_LENGTH) {
      errors.description = `Description must be at least ${VALIDATION_LIMITS.DESCRIPTION_MIN_LENGTH} characters long`;
    } else if (service.description.trim().length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
      errors.description = `Description must be ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`;
    }

    // Mileage at service validation
    if (service.mileageAtService === undefined || service.mileageAtService === null) {
      errors.mileageAtService = 'Mileage at service is required';
    } else if (service.mileageAtService < 0) {
      errors.mileageAtService = 'Mileage cannot be negative';
    }

    // Cost validation
    if (service.cost === undefined || service.cost === null) {
      errors.cost = 'Service cost is required';
    } else if (service.cost < 0) {
      errors.cost = 'Cost cannot be negative';
    }

    // Service provider validation
    if (!service.serviceProvider || service.serviceProvider.trim().length < 2) {
      errors.serviceProvider = 'Service provider must be at least 2 characters long';
    } else if (service.serviceProvider.trim().length > 100) {
      errors.serviceProvider = 'Service provider must be 100 characters or less';
    }

    // Next service mileage validation (optional)
    if (service.nextServiceMileage !== undefined && service.nextServiceMileage !== null) {
      if (service.nextServiceMileage < 0) {
        errors.nextServiceMileage = 'Next service mileage cannot be negative';
      } else if (service.mileageAtService && service.nextServiceMileage < service.mileageAtService) {
        errors.nextServiceMileage = 'Next service mileage should be greater than current service mileage';
      }
    }

    // Next service date validation (optional)
    if (service.nextServiceDate && service.serviceDate && service.nextServiceDate <= service.serviceDate) {
      errors.nextServiceDate = 'Next service date should be after the service date';
    }

    return errors;
  }

  static isValid(service: ServiceFormData): boolean {
    const errors = this.validate(service);
    return Object.keys(errors).length === 0;
  }

  static getErrorSummary(errors: ServiceValidationErrors): string[] {
    return Object.values(errors).filter(error => error !== undefined);
  }
}

export default ServiceValidationService;