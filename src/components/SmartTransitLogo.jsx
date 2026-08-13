import { Bus, Route } from 'lucide-react';

export default function SmartTransitLogo({ className = '', layout = 'horizontal', iconSize = 22 }) {
  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 mb-3 border border-blue-500/30">
          <Bus size={28} strokeWidth={2.2} />
        </div>
        <div className="font-extrabold tracking-tight text-slate-900 leading-none">
          <span className="text-xl text-blue-700 block tracking-wider font-mono">SMART</span>
          <span className="text-xl text-slate-900 block tracking-wider font-mono">TRANSIT</span>
        </div>
        <span className="mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-widest uppercase border border-blue-200">
          MOBILITY PLATFORM
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0 border border-blue-500/30">
        <Bus size={iconSize} strokeWidth={2.2} />
      </div>
      <div className="font-extrabold tracking-wider leading-none">
        <div className="flex items-center gap-1">
          <span className="text-base text-blue-700 font-mono">SMART</span>
          <Route size={12} className="text-blue-500" />
        </div>
        <span className="text-base text-slate-900 block font-mono mt-0.5">TRANSIT</span>
      </div>
    </div>
  );
}
