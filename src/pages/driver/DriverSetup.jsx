import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Bus, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { solarch } from '../../lib/solarch';

export default function DriverSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    assigned_bus: user?.assigned_bus || '',
  });

  // If they already have all 3, they shouldn't be here
  useEffect(() => {
    if (user?.name && user?.phone && user?.assigned_bus) {
      navigate('/driver', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, we update the user's document in the users collection.
      // Since solarch.auth.me returns the user, we assume the user has an $id
      if (user && user.$id) {
        await solarch.db.collection('users').update(user.$id, {
          name: formData.name,
          phone: formData.phone,
          assigned_bus: formData.assigned_bus
        });
      }
      
      // Update context and navigate smoothly
      updateUser(formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/driver', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Failed to save driver details:', error);
      alert('Error updating profile on the server. Continuing to dashboard...');
      updateUser(formData);
      navigate('/driver', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />

      <header className="relative z-10 px-5 pt-16 pb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <ShieldCheck size={32} className="text-blue-400" />
        </div>
        <h1 className="text-[24px] font-bold tracking-wide">Driver Setup</h1>
        <p className="text-sm text-slate-400 mt-2">Please complete your profile to continue.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8 relative z-10">
        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0b101a]/80 backdrop-blur-xl border border-emerald-500/20 rounded-[32px] p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col items-center mt-10"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
              <Check size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Profile Complete</h2>
            <p className="text-sm text-slate-400">Taking you to your dashboard...</p>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-xl space-y-5">
              
              <div className="relative group">
                <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <User size={18} />
                </div>
                <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">Full Name</label>
                <input
                  id="name" required value={formData.name} onChange={handleChange}
                  type="text" placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Phone size={18} />
                </div>
                <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">Phone Number</label>
                <input
                  id="phone" required value={formData.phone} onChange={handleChange}
                  type="tel" placeholder="+91 98765 43210"
                  className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Bus size={18} />
                </div>
                <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">Assigned Bus Number</label>
                <input
                  id="assigned_bus" required value={formData.assigned_bus} onChange={handleChange}
                  type="text" placeholder="e.g. MP-09-PA-1234"
                  className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner font-mono uppercase tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-[56px] bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-[16px] rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Continue to Dashboard'}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
