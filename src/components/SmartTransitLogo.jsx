import { Bus } from 'lucide-react';

export default function SmartTransitLogo({ className = '', layout = 'horizontal', iconSize = 24 }) {
  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md shadow-primary-600/20 mb-2.5">
          <Bus size={30} strokeWidth={2.2} />
        </div>
        <div className="font-extrabold tracking-tight text-slate-900 leading-none">
          <span className="text-xl text-primary-700 block tracking-wider font-mono">SMART</span>
          <span className="text-xl text-slate-900 block tracking-wider font-mono">TRANSIT</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm shadow-primary-600/30 flex-shrink-0">
        <Bus size={iconSize} strokeWidth={2.2} />
      </div>
      <div className="font-extrabold tracking-wider leading-none">
        <span className="text-lg text-primary-700 block font-mono">SMART</span>
        <span className="text-lg text-slate-900 block font-mono">TRANSIT</span>
      </div>
    </div>
  );
}
