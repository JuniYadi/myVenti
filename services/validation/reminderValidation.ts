import { Reminder } from '@/types/user';
import { VALIDATION_LIMITS } from '@/constants/storage';

export class ReminderValidationService {
  static validate(reminder: Partial<Reminder>): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    // Vehicle ID validation
    if (!reminder.vehicleId || reminder.vehicleId.trim().length === 0) {
      errors.vehicleId = 'Vehicle selection is required';
    }

    // Title validation
    if (!reminder.title || reminder.title.trim().length < VALIDATION_LIMITS.REMINDER_TITLE_MIN_LENGTH) {
      errors.title = `Title must be at least ${VALIDATION_LIMITS.REMINDER_TITLE_MIN_LENGTH} characters long`;
    } else if (reminder.title.trim().length > VALIDATION_LIMITS.REMINDER_TITLE_MAX_LENGTH) {
      errors.title = `Title must be ${VALIDATION_LIMITS.REMINDER_TITLE_MAX_LENGTH} characters or less`;
    }

    // Description validation
    if (!reminder.description || reminder.description.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters long';
    } else if (reminder.description.trim().length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }

    // Reminder type validation
    if (!reminder.reminderType) {
      errors.reminderType = 'Reminder type is required';
    }

    // Trigger type validation
    if (!reminder.triggerType) {
      errors.triggerType = 'Trigger type is required';
    }

    // At least one trigger condition must be provided
    if (reminder.triggerType !== 'date' && !reminder.targetMileage) {
      errors.targetMileage = 'Target mileage is required for mileage-based reminders';
    }

    if (reminder.triggerType !== 'mileage' && !reminder.targetDate) {
      errors.targetDate = 'Target date is required for date-based reminders';
    }

    // Target mileage validation (if provided)
    if (reminder.targetMileage !== undefined && reminder.targetMileage !== null) {
      if (reminder.targetMileage < 0) {
        errors.targetMileage = 'Target mileage cannot be negative';
      }
    }

    // Target date validation (if provided)
    if (reminder.targetDate && reminder.targetDate <= new Date()) {
      errors.targetDate = 'Target date should be in the future';
    }

    return errors;
  }

  static isValid(reminder: Partial<Reminder>): boolean {
    const errors = this.validate(reminder);
    return Object.keys(errors).length === 0;
  }

  static getErrorSummary(errors: { [key: string]: string }): string[] {
    return Object.values(errors).filter(error => error !== undefined);
  }
}

export default ReminderValidationService;