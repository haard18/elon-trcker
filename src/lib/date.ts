/**
 * Convert a date's hour to hour index (0-23)
 */
export function getHourIndex(date: Date): number {
  return date.getUTCHours();
}

/**
 * Convert a date's weekday to weekday index (0=Sunday, 6=Saturday)
 */
export function getWeekdayIndex(date: Date): number {
  return date.getUTCDay();
}

/**
 * Get weekday name from index (0-6)
 */
export function getWeekdayName(index: number): string {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[index] || 'Unknown';
}

/**
 * Get weekday short name from index (0-6)
 */
export function getWeekdayShort(index: number): string {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return names[index] || 'Unknown';
}

/**
 * Get hour label (0-23 format)
 */
export function getHourLabel(hour: number): string {
  return `${hour}:00`;
}

/**
 * Determine if hour is a "peak" hour (morning/afternoon rush)
 * Typically: 8-10am, 12-2pm, 5-7pm
 */
export function isPeakHour(hour: number): boolean {
  return (hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19);
}
