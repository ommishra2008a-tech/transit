export default function StopList({ stops }) {
  if (!stops || stops.length === 0) {
    return <p className="text-surface-500 text-sm">No stops available</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-success-500 via-primary-500 to-danger-500 rounded-full" />

      <div className="space-y-3">
        {stops.map((stop, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === stops.length - 1;

          return (
            <div key={stop.id} className="relative flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              {/* Dot */}
              <div className={`absolute -left-6 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center
                ${isFirst ? 'border-success-400 bg-success-400/20' :
                  isLast ? 'border-danger-400 bg-danger-400/20' :
                  'border-primary-400 bg-primary-400/20'}`}
              >
                <div className={`w-2 h-2 rounded-full
                  ${isFirst ? 'bg-success-400' : isLast ? 'bg-danger-400' : 'bg-primary-400'}`}
                />
              </div>

              {/* Stop info */}
              <div className="flex-1 py-1">
                <p className={`text-sm font-medium ${isFirst || isLast ? 'text-surface-100' : 'text-surface-300'}`}>
                  {stop.stop_name}
                </p>
                <p className="text-xs text-surface-600">Stop #{stop.stop_order}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
