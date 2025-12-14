/**
 * Fuel Analytics Utilities
 * Centralized analytics calculations for fuel data including MPG calculations, trend analysis, and statistical functions
 */

import { FuelEntry, Vehicle } from '@/types/data';

export interface FuelEfficiencyMetrics {
  mpg: number;
  kmPerLiter: number;
  litersPer100km: number;
  costPerMile: number;
  costPerKm: number;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
  confidence: number;
  period: string;
}

export interface Statistics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  quartiles: {
    q1: number;
    q2: number; // median
    q3: number;
  };
  outliers: number[];
}

export interface VehicleComparison {
  vehicleId: string;
  vehicleName: string;
  efficiency: FuelEfficiencyMetrics;
  costEfficiency: {
    costPerMile: number;
    costPerMonth: number;
    annualProjection: number;
  };
  performance: {
    bestMPG: number;
    worstMPG: number;
    averageMPG: number;
    improvementRate: number;
  };
}

export interface FuelConsumptionPattern {
  dayOfWeek: number;
  averageConsumption: number;
  averageCost: number;
  tripFrequency: number;
}

export interface SeasonalAnalysis {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageMPG: number;
  averageCost: number;
  totalDistance: number;
  efficiencyChange: number;
}

// ==================== FUEL EFFICIENCY CALCULATIONS ====================

/**
 * Calculate comprehensive fuel efficiency metrics
 */
export function calculateFuelEfficiency(
  fuelEntry: FuelEntry,
  previousEntry?: FuelEntry,
  vehicle?: Vehicle
): FuelEfficiencyMetrics {
  const mpg = fuelEntry.mpg || 0;
  const distance = previousEntry
    ? Math.max(0, fuelEntry.mileage - previousEntry.mileage)
    : 0;

  // Convert to different units
  const kmPerLiter = mpg * 0.425144; // 1 MPG = 0.425144 km/L
  const litersPer100km = mpg > 0 ? 235.215 / mpg : 0; // 1 MPG = 235.215 L/100km

  // Calculate cost per distance
  const costPerMile = fuelEntry.quantity > 0 ? fuelEntry.amount / fuelEntry.quantity / mpg : 0;
  const costPerKm = costPerMile * 0.621371; // 1 mile = 1.60934 km

  return {
    mpg: Math.round(mpg * 100) / 100,
    kmPerLiter: Math.round(kmPerLiter * 100) / 100,
    litersPer100km: Math.round(litersPer100km * 100) / 100,
    costPerMile: Math.round(costPerMile * 10000) / 10000,
    costPerKm: Math.round(costPerKm * 10000) / 10000,
  };
}

/**
 * Calculate MPG between two fuel entries
 */
export function calculateMPGBetweenEntries(
  currentEntry: FuelEntry,
  previousEntry: FuelEntry,
  vehicle?: Vehicle
): number {
  // Only calculate for gas vehicles
  if (vehicle && vehicle.type === 'electric') {
    return 0;
  }

  const distance = currentEntry.mileage - previousEntry.mileage;
  const fuelUsed = currentEntry.quantity;

  // Validate inputs
  if (distance <= 0 || fuelUsed <= 0) {
    return 0;
  }

  const mpg = distance / fuelUsed;

  // Filter unrealistic values
  if (mpg < 5 || mpg > 100) {
    return 0;
  }

  return Math.round(mpg * 100) / 100;
}

/**
 * Recalculate MPG for all entries in chronological order
 */
export function recalculateAllMPG(
  entries: FuelEntry[],
  vehicles: Vehicle[]
): FuelEntry[] {
  // Sort entries by vehicle and date
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.vehicleId !== b.vehicleId) {
      return a.vehicleId.localeCompare(b.vehicleId);
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const recalculatedEntries: FuelEntry[] = [];
  const lastEntryByVehicle = new Map<string, FuelEntry>();

  for (const entry of sortedEntries) {
    const vehicle = vehicles.find(v => v.id === entry.vehicleId);
    const lastEntry = lastEntryByVehicle.get(entry.vehicleId);

    let mpg: number | undefined;

    if (vehicle && vehicle.type !== 'electric' && lastEntry) {
      mpg = calculateMPGBetweenEntries(entry, lastEntry, vehicle);
    }

    const updatedEntry = {
      ...entry,
      mpg: mpg || entry.mpg,
    };

    recalculatedEntries.push(updatedEntry);
    lastEntryByVehicle.set(entry.vehicleId, updatedEntry);
  }

  return recalculatedEntries;
}

// ==================== STATISTICAL ANALYSIS ====================

/**
 * Calculate comprehensive statistics for an array of numbers
 */
export function calculateStatistics(values: number[]): Statistics {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      min: 0,
      max: 0,
      quartiles: { q1: 0, q2: 0, q3: 0 },
      outliers: [],
    };
  }

  const sortedValues = [...values].sort((a, b) => a - b);
  const count = sortedValues.length;

  // Basic statistics
  const mean = values.reduce((sum, val) => sum + val, 0) / count;
  const min = sortedValues[0];
  const max = sortedValues[count - 1];

  // Median
  const median = count % 2 === 0
    ? (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2
    : sortedValues[Math.floor(count / 2)];

  // Mode
  const frequencyMap = new Map<number, number>();
  values.forEach(val => {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  });
  const mode = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

  // Quartiles
  const q1Index = Math.floor(count * 0.25);
  const q3Index = Math.floor(count * 0.75);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];

  // Variance and standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);

  // Outliers (using IQR method)
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = values.filter(val => val < lowerBound || val > upperBound);

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    mode: Math.round(mode * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    min,
    max,
    quartiles: {
      q1: Math.round(q1 * 100) / 100,
      q2: Math.round(median * 100) / 100,
      q3: Math.round(q3 * 100) / 100,
    },
    outliers,
  };
}

/**
 * Calculate correlation coefficient between two datasets
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

// ==================== TREND ANALYSIS ====================

/**
 * Analyze trends in fuel consumption or efficiency
 */
export function analyzeTrend(
  values: number[],
  dates: string[]
): TrendAnalysis {
  if (values.length < 2) {
    return {
      trend: 'stable',
      changeRate: 0,
      confidence: 0,
      period: 'insufficient data',
    };
  }

  // Simple linear regression to determine trend
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const sumX = xValues.reduce((sum, val) => sum + val, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = xValues.reduce((sum, val, i) => sum + val * values[i], 0);
  const sumXX = xValues.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const changeRate = Math.round(slope * 100) / 100;

  // Determine trend direction
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(slope) > 0.1) {
    trend = slope > 0 ? 'increasing' : 'decreasing';
  }

  // Calculate confidence based on correlation
  const correlation = calculateCorrelation(xValues, values);
  const confidence = Math.round(Math.abs(correlation) * 100);

  // Determine period
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  let period = '';
  if (daysDiff <= 31) {
    period = `${daysDiff} days`;
  } else if (daysDiff <= 365) {
    const months = Math.ceil(daysDiff / 30);
    period = `${months} months`;
  } else {
    const years = Math.ceil(daysDiff / 365);
    period = `${years} years`;
  }

  return {
    trend,
    changeRate,
    confidence,
    period,
  };
}

/**
 * Project future fuel costs based on historical trends
 */
export function projectFuelCosts(
  historicalCosts: number[],
  monthsToProject: number = 6
): {
  projections: number[];
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
} {
  if (historicalCosts.length < 3) {
    return {
      projections: [],
      confidence: 0,
      trend: 'stable',
    };
  }

  // Calculate month-over-month changes
  const changes = [];
  for (let i = 1; i < historicalCosts.length; i++) {
    changes.push(historicalCosts[i] - historicalCosts[i - 1]);
  }

  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const lastCost = historicalCosts[historicalCosts.length - 1];

  // Generate projections
  const projections = [];
  for (let i = 1; i <= monthsToProject; i++) {
    const projectedCost = lastCost + (avgChange * i);
    projections.push(Math.round(projectedCost * 100) / 100);
  }

  // Calculate confidence based on consistency of changes
  const changeStdDev = Math.sqrt(
    changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length
  );
  const confidence = Math.round(Math.max(0, 100 - (changeStdDev / Math.abs(avgChange)) * 100));

  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(avgChange) > 1) {
    trend = avgChange > 0 ? 'increasing' : 'decreasing';
  }

  return {
    projections,
    confidence,
    trend,
  };
}

// ==================== VEHICLE COMPARISON ====================

/**
 * Compare fuel efficiency between vehicles
 */
export function compareVehicles(
  entries: FuelEntry[],
  vehicles: Vehicle[]
): VehicleComparison[] {
  const vehicleData = new Map<string, {
    entries: FuelEntry[];
    vehicle: Vehicle;
  }>();

  // Group entries by vehicle
  entries.forEach(entry => {
    const vehicle = vehicles.find(v => v.id === entry.vehicleId);
    if (vehicle && !vehicleData.has(entry.vehicleId)) {
      vehicleData.set(entry.vehicleId, {
        entries: [],
        vehicle,
      });
    }

    if (vehicle) {
      vehicleData.get(entry.vehicleId)!.entries.push(entry);
    }
  });

  const comparisons: VehicleComparison[] = [];

  vehicleData.forEach(({ entries: vehicleEntries, vehicle }) => {
    const mpgValues = vehicleEntries
      .filter(entry => entry.mpg && entry.mpg > 0)
      .map(entry => entry.mpg!);

    if (mpgValues.length === 0) return;

    const stats = calculateStatistics(mpgValues);
    const totalCost = vehicleEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalFuel = vehicleEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const avgCostPerTrip = totalCost / vehicleEntries.length;

    // Calculate efficiency metrics
    const avgMPG = stats.mean;
    const efficiency = calculateFuelEfficiency(
      { ...vehicleEntries[0], mpg: avgMPG } as FuelEntry,
      undefined,
      vehicle
    );

    // Calculate improvement rate (trend analysis)
    const sortedEntries = vehicleEntries.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const mpgTrend = sortedEntries.map(entry => entry.mpg || 0);
    const dates = sortedEntries.map(entry => entry.date);
    const trend = analyzeTrend(mpgTrend, dates);

    // Calculate cost efficiency
    const totalMileage = vehicleEntries.reduce((sum, entry) => sum + entry.mileage, 0);
    const avgMileagePerEntry = totalMileage / vehicleEntries.length;
    const costPerMile = avgCostPerTrip / avgMileagePerEntry;

    // Project monthly cost (based on recent activity)
    const recentEntries = vehicleEntries.slice(-6); // Last 6 entries
    const avgMonthlyTrips = recentEntries.length / 2; // Approximate
    const costPerMonth = avgCostPerTrip * avgMonthlyTrips;
    const annualProjection = costPerMonth * 12;

    comparisons.push({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      efficiency,
      costEfficiency: {
        costPerMile: Math.round(costPerMile * 10000) / 10000,
        costPerMonth: Math.round(costPerMonth * 100) / 100,
        annualProjection: Math.round(annualProjection * 100) / 100,
      },
      performance: {
        bestMPG: stats.max,
        worstMPG: stats.min,
        averageMPG: stats.mean,
        improvementRate: trend.changeRate,
      },
    });
  });

  return comparisons.sort((a, b) => b.efficiency.mpg - a.efficiency.mpg);
}

// ==================== CONSUMPTION PATTERNS ====================

/**
 * Analyze fuel consumption patterns by day of week
 */
export function analyzeWeeklyPatterns(
  entries: FuelEntry[]
): FuelConsumptionPattern[] {
  const patternsByDay = new Map<number, {
    consumption: number[];
    costs: number[];
  }>();

  // Group by day of week (0 = Sunday, 6 = Saturday)
  entries.forEach(entry => {
    const dayOfWeek = new Date(entry.date).getDay();

    if (!patternsByDay.has(dayOfWeek)) {
      patternsByDay.set(dayOfWeek, { consumption: [], costs: [] });
    }

    const pattern = patternsByDay.get(dayOfWeek)!;
    pattern.consumption.push(entry.quantity);
    pattern.costs.push(entry.amount);
  });

  const patterns: FuelConsumptionPattern[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let day = 0; day < 7; day++) {
    const pattern = patternsByDay.get(day) || { consumption: [], costs: [] };

    const avgConsumption = pattern.consumption.length > 0
      ? pattern.consumption.reduce((sum, val) => sum + val, 0) / pattern.consumption.length
      : 0;

    const avgCost = pattern.costs.length > 0
      ? pattern.costs.reduce((sum, val) => sum + val, 0) / pattern.costs.length
      : 0;

    patterns.push({
      dayOfWeek: day,
      averageConsumption: Math.round(avgConsumption * 100) / 100,
      averageCost: Math.round(avgCost * 100) / 100,
      tripFrequency: pattern.consumption.length,
    });
  }

  return patterns;
}

/**
 * Analyze seasonal fuel consumption patterns
 */
export function analyzeSeasonalPatterns(
  entries: FuelEntry[]
): SeasonalAnalysis[] {
  const seasons = {
    spring: [2, 3, 4],   // March, April, May
    summer: [5, 6, 7],   // June, July, August
    fall: [8, 9, 10],    // September, October, November
    winter: [11, 0, 1],  // December, January, February
  };

  const analyses: SeasonalAnalysis[] = [];

  Object.entries(seasons).forEach(([seasonName, months]) => {
    const seasonEntries = entries.filter(entry => {
      const month = new Date(entry.date).getMonth();
      return months.includes(month);
    });

    if (seasonEntries.length === 0) return;

    const totalCost = seasonEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalFuel = seasonEntries.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalMileage = seasonEntries.reduce((sum, entry) => sum + entry.mileage, 0);

    const mpgValues = seasonEntries
      .filter(entry => entry.mpg && entry.mpg > 0)
      .map(entry => entry.mpg!);

    const averageMPG = mpgValues.length > 0
      ? mpgValues.reduce((sum, mpg) => sum + mpg, 0) / mpgValues.length
      : 0;

    // Calculate efficiency change compared to overall average
    const allMPGValues = entries
      .filter(entry => entry.mpg && entry.mpg > 0)
      .map(entry => entry.mpg!);
    const overallAverageMPG = allMPGValues.length > 0
      ? allMPGValues.reduce((sum, mpg) => sum + mpg, 0) / allMPGValues.length
      : 0;

    const efficiencyChange = overallAverageMPG > 0
      ? ((averageMPG - overallAverageMPG) / overallAverageMPG) * 100
      : 0;

    analyses.push({
      season: seasonName as 'spring' | 'summer' | 'fall' | 'winter',
      averageMPG: Math.round(averageMPG * 100) / 100,
      averageCost: Math.round((totalCost / seasonEntries.length) * 100) / 100,
      totalDistance: totalMileage,
      efficiencyChange: Math.round(efficiencyChange * 100) / 100,
    });
  });

  return analyses;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format MPG with appropriate units based on vehicle type and region
 */
export function formatEfficiency(
  mpg: number,
  vehicleType: 'gas' | 'electric' | 'hybrid' = 'gas',
  preferredUnit: 'mpg' | 'kmPerLiter' | 'litersPer100km' = 'mpg'
): string {
  if (vehicleType === 'electric') {
    const milesPerKWh = mpg / 33.7; // Convert to mi/kWh
    return `${milesPerKWh.toFixed(1)} mi/kWh`;
  }

  switch (preferredUnit) {
    case 'kmPerLiter': {
      const kmPerLiter = mpg * 0.425144;
      return `${kmPerLiter.toFixed(1)} km/L`;
    }
    case 'litersPer100km': {
      const litersPer100km = mpg > 0 ? 235.215 / mpg : 0;
      return `${litersPer100km.toFixed(1)} L/100km`;
    }
    default:
      return `${mpg.toFixed(1)} MPG`;
  }
}

/**
 * Calculate fuel savings from efficiency improvements
 */
export function calculateSavings(
  currentMPG: number,
  improvedMPG: number,
  annualMileage: number,
  fuelPrice: number
): {
  annualSavings: number;
  monthlySavings: number;
  percentageImprovement: number;
  gallonsSavedPerYear: number;
} {
  if (currentMPG <= 0 || improvedMPG <= currentMPG) {
    return {
      annualSavings: 0,
      monthlySavings: 0,
      percentageImprovement: 0,
      gallonsSavedPerYear: 0,
    };
  }

  const currentAnnualFuel = annualMileage / currentMPG;
  const improvedAnnualFuel = annualMileage / improvedMPG;
  const gallonsSaved = currentAnnualFuel - improvedAnnualFuel;
  const annualSavings = gallonsSaved * fuelPrice;

  const percentageImprovement = ((improvedMPG - currentMPG) / currentMPG) * 100;

  return {
    annualSavings: Math.round(annualSavings * 100) / 100,
    monthlySavings: Math.round((annualSavings / 12) * 100) / 100,
    percentageImprovement: Math.round(percentageImprovement * 100) / 100,
    gallonsSavedPerYear: Math.round(gallonsSaved * 100) / 100,
  };
}

/**
 * Validate and sanitize fuel entry data
 */
export function validateFuelEntry(entry: Partial<FuelEntry>): {
  isValid: boolean;
  errors: string[];
  sanitizedEntry: Partial<FuelEntry>;
} {
  const errors: string[] = [];
  const sanitizedEntry: Partial<FuelEntry> = { ...entry };

  // Validate required fields
  if (!entry.date) {
    errors.push('Date is required');
  } else if (isNaN(new Date(entry.date).getTime())) {
    errors.push('Invalid date format');
  }

  if (entry.amount !== undefined) {
    const amount = parseFloat(String(entry.amount));
    if (isNaN(amount) || amount <= 0 || amount > 1000) {
      errors.push('Amount must be a positive number less than $1000');
    } else {
      sanitizedEntry.amount = Math.round(amount * 100) / 100;
    }
  }

  if (entry.quantity !== undefined) {
    const quantity = parseFloat(String(entry.quantity));
    if (isNaN(quantity) || quantity <= 0 || quantity > 1000) {
      errors.push('Quantity must be a positive number');
    } else {
      sanitizedEntry.quantity = Math.round(quantity * 100) / 100;
    }
  }

  if (entry.mileage !== undefined) {
    const mileage = parseInt(String(entry.mileage));
    if (isNaN(mileage) || mileage < 0 || mileage > 10000000) {
      errors.push('Mileage must be a positive number');
    } else {
      sanitizedEntry.mileage = mileage;
    }
  }

  if (entry.pricePerUnit !== undefined) {
    const pricePerUnit = parseFloat(String(entry.pricePerUnit));
    if (isNaN(pricePerUnit) || pricePerUnit <= 0 || pricePerUnit > 100) {
      errors.push('Price per unit must be a positive number');
    } else {
      sanitizedEntry.pricePerUnit = Math.round(pricePerUnit * 100) / 100;
    }
  }

  // Validate calculated fields consistency
  if (sanitizedEntry.amount && sanitizedEntry.quantity && sanitizedEntry.pricePerUnit) {
    const calculatedAmount = sanitizedEntry.quantity * sanitizedEntry.pricePerUnit;
    const tolerance = 0.05; // 5 cent tolerance
    if (Math.abs(sanitizedEntry.amount - calculatedAmount) > tolerance) {
      errors.push('Amount, quantity, and price per unit are inconsistent');
    }
  }

  // Validate optional string fields
  if (entry.fuelStation) {
    sanitizedEntry.fuelStation = entry.fuelStation.trim().substring(0, 100);
  }

  if (entry.notes) {
    sanitizedEntry.notes = entry.notes.trim().substring(0, 500);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedEntry,
  };
}