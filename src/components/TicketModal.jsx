import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Bus, Calendar, Armchair, Ticket, X } from 'lucide-react';
import Button from './ui/Button';

export default function TicketModal({ isOpen, onClose, bus, route, ticketData }) {
  if (!isOpen) return null;

  const busNumber = bus?.bus_number || 'BUS-101';
  const routeName = route?.route_name || 'Downtown Express';
  const dateStr = ticketData?.date || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const seatStr = ticketData?.seat || 'Car 2, Seat 14A';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className="bg-[#0e1626] border border-[#1e2a3f] rounded-[32px] p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden text-white"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#131d31] border border-[#1e2a3f] transition-colors"
          >
            <X size={16} />
          </button>

          {/* Glowing Green Checkmark Circle (Matched to Screenshot 5) */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#103a38] border border-[#00d2ff]/40 text-[#22d3ee] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <CheckCircle2 size={40} className="text-[#22d3ee]" strokeWidth={2.2} />
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
            Booking Confirmed!
          </h2>
          <p className="text-xs font-medium text-slate-400 mb-6">
            Your journey is ready.
          </p>

          {/* Ticket Information Rows (Matched to Screenshot 5) */}
          <div className="space-y-3 mb-6 text-left">
            {/* Row 1: ROUTE */}
            <div className="p-3.5 rounded-2xl bg-[#131d31] border border-[#1e2a3f] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0e1626] text-[#00d2ff] flex items-center justify-center flex-shrink-0 border border-[#1e2a3f]">
                <Bus size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">ROUTE</p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">{routeName}</p>
              </div>
            </div>

            {/* Row 2: DATE */}
            <div className="p-3.5 rounded-2xl bg-[#131d31] border border-[#1e2a3f] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0e1626] text-[#00d2ff] flex items-center justify-center flex-shrink-0 border border-[#1e2a3f]">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">DATE</p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">{dateStr}</p>
              </div>
            </div>

            {/* Row 3: SEAT */}
            <div className="p-3.5 rounded-2xl bg-[#131d31] border border-[#1e2a3f] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0e1626] text-[#00d2ff] flex items-center justify-center flex-shrink-0 border border-[#1e2a3f]">
                <Armchair size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">SEAT</p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate">{seatStr}</p>
              </div>
            </div>
          </div>

          {/* Primary Coral CTA Button */}
          <Button
            variant="coral"
            size="lg"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 shadow-lg mb-3"
          >
            <Ticket size={18} />
            View Ticket
          </Button>

          {/* Return to Home Secondary Button */}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#00d2ff] hover:underline cursor-pointer"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
