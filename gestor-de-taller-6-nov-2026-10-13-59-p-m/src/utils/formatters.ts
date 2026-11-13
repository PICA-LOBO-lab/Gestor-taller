import { Vehicle } from '../types/workshop';

/**
 * Calculates hours elapsed since a date string
 */
export function getHoursElapsed(isoDateString: string): number {
  const then = new Date(isoDateString).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  return diffMs / (1000 * 60 * 60);
}

/**
 * Formats time elapsed in human-readable Spanish format
 * e.g. "Hace 45m", "Hace 3h", "1d 4h", "2d 12h"
 */
export function formatElapsedTime(isoDateString: string): string {
  const hours = getHoursElapsed(isoDateString);
  
  if (hours < 1) {
    const minutes = Math.floor(hours * 60);
    return minutes <= 1 ? 'Hace un momento' : `Hace ${minutes} min`;
  }
  
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Check if a vehicle exceeds 48 hours without update/review
 * Rule: active vehicle (not 'listo') with >= 48h in status or since last acknowledged
 */
export function isExceeded48Hours(vehicle: Vehicle): boolean {
  if (vehicle.status === 'listo') {
    return false;
  }
  const referenceTimestamp = vehicle.lastAlertAcknowledgedAt || vehicle.statusUpdatedAt;
  return getHoursElapsed(referenceTimestamp) >= 48;
}

/**
 * Formats currency in Euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generates direct tel: call link for workshop quick dial
 */
export function buildPhoneCallLink(vehicle: Vehicle): string {
  const cleanNumber = vehicle.phoneNumber.replace(/[^0-9]/g, '');
  return `tel:${vehicle.phoneCountryCode}${cleanNumber}`;
}

/**
 * Generates standard next OR (Orden de Reparación) number
 */
export function getNextOrNumber(existingVehicles: Vehicle[]): string {
  const currentYear = new Date().getFullYear();
  const maxNumber = existingVehicles.reduce((max, v) => {
    const match = v.orNumber?.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0], 10);
      return num > max ? num : max;
    }
    return max;
  }, 100);
  return `OR-${currentYear}-${maxNumber + 1}`;
}
