import { Currency, Region } from '@/types';

export interface CurrencyFormat {
  symbol: string;
  position: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyFormat> = {
  USD: {
    symbol: '$',
    position: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  IDR: {
    symbol: 'Rp',
    position: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

export class CurrencyService {
  static formatCurrency(
    amount: number,
    currency: Currency,
    locale?: string
  ): string {
    const config = CURRENCY_CONFIGS[currency];

    if (!config) {
      return amount.toString();
    }

    const formattedAmount = this.formatNumber(amount, config);

    if (config.position === 'before') {
      return `${config.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount}${config.symbol}`;
    }
  }

  static formatNumber(amount: number, config: CurrencyFormat): string {
    const parts = amount.toFixed(config.maximumFractionDigits).split('.');

    // Format integer part with thousands separator
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);

    // Join with decimal separator if there's a decimal part
    if (parts.length > 1 && parts[1] !== '0'.repeat(parts[1].length)) {
      return parts.join(config.decimalSeparator);
    }

    return parts[0];
  }

  static parseCurrency(
    value: string,
    currency: Currency
  ): number | null {
    const config = CURRENCY_CONFIGS[currency];

    if (!config) {
      return null;
    }

    // Remove currency symbol and whitespace
    let cleanValue = value.trim();

    if (config.position === 'before') {
      cleanValue = cleanValue.replace(new RegExp(`^\\s*\\${config.symbol}\\s*`), '');
    } else {
      cleanValue = cleanValue.replace(new RegExp(`\\s*\\${config.symbol}\\s*$`), '');
    }

    // Replace thousands separator and convert decimal separator
    cleanValue = cleanValue
      .replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '')
      .replace(config.decimalSeparator, '.');

    const parsed = parseFloat(cleanValue);

    return isNaN(parsed) ? null : parsed;
  }

  static getCurrencyForRegion(region: Region): Currency {
    switch (region) {
      case Region.INDONESIA:
        return Currency.IDR;
      case Region.UNITED_STATES:
      default:
        return Currency.USD;
    }
  }

  static validateAmount(
    amount: number,
    currency: Currency
  ): { isValid: boolean; error?: string } {
    const { VALIDATION_LIMITS } = require('@/constants/storage');

    switch (currency) {
      case Currency.USD:
        if (amount < VALIDATION_LIMITS.COST_USD_MIN || amount > VALIDATION_LIMITS.COST_USD_MAX) {
          return {
            isValid: false,
            error: `Amount must be between $${VALIDATION_LIMITS.COST_USD_MIN} and $${VALIDATION_LIMITS.COST_USD_MAX}`,
          };
        }
        break;
      case Currency.IDR:
        if (amount < VALIDATION_LIMITS.COST_IDR_MIN || amount > VALIDATION_LIMITS.COST_IDR_MAX) {
          return {
            isValid: false,
            error: `Amount must be between Rp${VALIDATION_LIMITS.COST_IDR_MIN} and Rp${VALIDATION_LIMITS.COST_IDR_MAX}`,
          };
        }
        break;
    }

    return { isValid: true };
  }

  static convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRate: number = 1
  ): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // This is a simplified conversion - in a real app, you'd fetch current exchange rates
    // For now, using a default rate (this should be replaced with actual rate fetching)
    return amount * exchangeRate;
  }
}

export default CurrencyService;