/**
 * ResponsiveGrid — Auto-adjusting card grid
 * 
 * Automatically picks the right number of columns:
 *   mobile: 1 col  |  sm: 2 col  |  lg: 3 col  |  xl: 4 col
 *
 * Usage:
 *   <ResponsiveGrid>{cards}</ResponsiveGrid>
 *   <ResponsiveGrid cols={3}>{cards}</ResponsiveGrid>  // max 3 cols
 */

export default function ResponsiveGrid({ children, cols = 4, gap = 4, className = '' }) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-3 sm:gap-4',
    5: 'gap-4 sm:gap-5',
    6: 'gap-4 sm:gap-6',
  };

  return (
    <div className={`grid ${colClasses[cols] || colClasses[4]} ${gapClasses[gap] || gapClasses[4]} ${className}`}>
      {children}
    </div>
  );
}
