/**
 * Check if a kitchen is currently open based on its operating hours
 * @param {Object} operatingHours - The kitchen's operating hours
 * @returns {boolean} - Whether the kitchen is currently open
 */
export function isKitchenOpen(operatingHours) {
  if (!operatingHours) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  // Check if the current time falls within any of the operating periods
  const periods = ['morning', 'afternoon', 'evening'];
  
  for (const period of periods) {
    if (!operatingHours[period]) continue;
    
    const { open, close } = operatingHours[period];
    
    // Skip if missing open or close times
    if (!open || !close) continue;
    
    if (currentTime >= open && currentTime <= close) {
      return true;
    }
  }
  
  return false;
}

/**
 * Format operating hours for display
 * @param {Object} operatingHours - The kitchen's operating hours
 * @returns {string} - Formatted operating hours text
 */
export function formatOperatingHours(operatingHours) {
  if (!operatingHours) return 'Hours not available';
  
  const periods = [];
  
  if (operatingHours.morning && operatingHours.morning.open && operatingHours.morning.close) {
    periods.push(`Morning: ${formatTime(operatingHours.morning.open)} - ${formatTime(operatingHours.morning.close)}`);
  }
  
  if (operatingHours.afternoon && operatingHours.afternoon.open && operatingHours.afternoon.close) {
    periods.push(`Afternoon: ${formatTime(operatingHours.afternoon.open)} - ${formatTime(operatingHours.afternoon.close)}`);
  }
  
  if (operatingHours.evening && operatingHours.evening.open && operatingHours.evening.close) {
    periods.push(`Evening: ${formatTime(operatingHours.evening.open)} - ${formatTime(operatingHours.evening.close)}`);
  }
  
  return periods.join(' | ');
}

/**
 * Convert 24-hour format to 12-hour format
 * @param {string} time - Time in HH:mm format
 * @returns {string} - Time in 12-hour format
 */
function formatTime(time) {
  if (!time) return '';
  
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour, 10);
  
  if (hourNum === 0) {
    return `12:${minute} AM`;
  } else if (hourNum < 12) {
    return `${hourNum}:${minute} AM`;
  } else if (hourNum === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hourNum - 12}:${minute} PM`;
  }
}
