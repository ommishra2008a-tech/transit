/**
 * Returns a time-aware greeting based on local time.
 * - 05:00 - 11:59: Good Morning
 * - 12:00 - 16:59: Good Afternoon
 * - 17:00 - 20:59: Good Evening
 * - 21:00 - 04:59: Good Night
 * 
 * @param {Date} [date=new Date()] Optional Date object for testing or timezone-adjusted evaluation
 * @returns {string} The greeting string
 */
export function getTimeAwareGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  }
  if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  }
  return 'Good Night';
}

export default getTimeAwareGreeting;
