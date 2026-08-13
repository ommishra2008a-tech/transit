/**
 * PageContainer — THE SINGLE RESPONSIVE LAYOUT WRAPPER
 * 
 * Every page in SmartTransit wraps its content with this component.
 * It handles:
 *   - Responsive horizontal padding (16px mobile → 24px tablet → 32px desktop)
 *   - Max content width with auto centering
 *   - Vertical spacing between child sections
 *   - Dark mode background
 *   - Mobile bottom-dock safe area (pb for bottom nav)
 *   - Full-height option for map pages
 *
 * Usage:
 *   <PageContainer>         → standard padded page (max-w-7xl)
 *   <PageContainer narrow>  → narrow page (max-w-3xl)  
 *   <PageContainer wide>    → wide page (max-w-screen-2xl)
 *   <PageContainer full>    → full bleed, no max-width (maps)
 */

export default function PageContainer({
  children,
  narrow = false,
  wide = false,
  full = false,
  noPadding = false,
  className = '',
}) {
  // Full bleed mode for map pages — takes entire viewport
  if (full) {
    return (
      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 ${className}`}>
        {children}
      </div>
    );
  }

  const maxWidth = narrow
    ? 'max-w-3xl'
    : wide
    ? 'max-w-screen-2xl'
    : 'max-w-6xl';

  return (
    <div className={`flex-1 bg-slate-50 dark:bg-slate-950 ${className}`}>
      <div
        className={`${maxWidth} mx-auto w-full space-y-4 ${
          noPadding ? '' : 'px-3.5 sm:px-5 md:px-6 py-3.5 sm:py-5'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
