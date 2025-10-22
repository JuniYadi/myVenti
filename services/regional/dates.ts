import { Region, TimeFormat } from '@/types';

export class DateService {
  static formatDate(
    date: Date,
    region: Region,
    format?: string
  ): string {
    const defaultFormats = {
      [Region.UNITED_STATES]: 'MM/dd/yyyy',
      [Region.INDONESIA]: 'dd/MM/yyyy',
    };

    const dateFormat = format || defaultFormats[region];

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return dateFormat
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year.toString())
      .replace('yy', year.toString().slice(-2));
  }

  static formatTime(
    date: Date,
    timeFormat: TimeFormat
  ): string {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (timeFormat === TimeFormat.H24) {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    // 12-hour format
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    return `${displayHours}:${minutes} ${ampm}`;
  }

  static formatDateTime(
    date: Date,
    region: Region,
    timeFormat: TimeFormat
  ): string {
    const dateStr = this.formatDate(date, region);
    const timeStr = this.formatTime(date, timeFormat);
    return `${dateStr} ${timeStr}`;
  }

  static parseDate(
    dateString: string,
    region: Region
  ): Date | null {
    const separators = ['/', '-', '.'];

    for (const separator of separators) {
      const parts = dateString.split(separator);

      if (parts.length === 3) {
        let day: number, month: number, year: number;

        if (region === Region.UNITED_STATES) {
          // MM/dd/yyyy or MM-dd-yyyy
          month = parseInt(parts[0]);
          day = parseInt(parts[1]);
          year = parseInt(parts[2]);
        } else {
          // dd/MM/yyyy or dd-MM-yyyy (Indonesia and most other regions)
          day = parseInt(parts[0]);
          month = parseInt(parts[1]);
          year = parseInt(parts[2]);
        }

        // Handle 2-digit years
        if (year < 100) {
          const currentYear = new Date().getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100;
          year += currentCentury;

          // Adjust for future dates (e.g., if current year is 2024 and someone enters 99, assume 1999)
          if (year > currentYear + 1) {
            year -= 100;
          }
        }

        if (this.isValidDate(day, month, year)) {
          return new Date(year, month - 1, day);
        }
      }
    }

    return null;
  }

  static isValidDate(day: number, month: number, year: number): boolean {
    if (month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear() + 1) {
      return false;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  }

  static isFutureDate(date: Date): boolean {
    const now = new Date();
    // Clear time portion for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return compareDate > today;
  }

  static isDateWithinRange(
    date: Date,
    startDate: Date,
    endDate: Date
  ): boolean {
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return compareDate >= start && compareDate <= end;
  }

  static getRelativeTimeString(
    date: Date,
    region: Region
  ): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  static getDaysBetween(startDate: Date, endDate: Date): number {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  static formatShortDate(date: Date, region: Region): string {
    const formats = {
      [Region.UNITED_STATES]: 'M/d/yy',
      [Region.INDONESIA]: 'd/M/yy',
    };

    const format = formats[region];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);

    return format
      .replace('d', day.toString())
      .replace('M', month.toString())
      .replace('yy', year);
  }
}

export default DateService;