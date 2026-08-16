import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Hash, ShieldCheck, Check, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { solarch } from '../../lib/solarch';
import AuthRequiredModal from '../../components/AuthRequiredModal';

export default function AddDriver() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isAdmin = user && (user.role || '').toUpperCase() === 'ADMIN';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license: '',
    password: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    
    try {
      const initialPassword = formData.password.trim();
      if (!initialPassword || initialPassword.length < 8) {
        alert('Password is required and must be at least 8 characters long.');
        setLoading(false);
        return;
      }

      // Save to Solarch driver/users collection
      await solarch.db.collection('users').create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        license: formData.license,
        role: 'DRIVER', // MUST be uppercase to match enum logic
        password: initialPassword,
        passwordConfirm: initialPassword,
        approval_status: 'PENDING', // Default to PENDING for admin review flow
        created_at: new Date().toISOString()
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 2000);
    } catch (error) {
      console.error('Failed to create driver:', error);
      alert('Failed to register driver. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-5 pt-12 pb-6 flex items-center gap-4 bg-[#0b101a]/80 backdrop-blur-md border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[20px] font-bold tracking-wide">Register Driver</h1>
      </header>

      {/* Main Form Area */}
      <div className="flex-1 overflow-y-auto px-5 py-8 relative z-10">
        
        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0b101a]/80 backdrop-blur-xl border border-emerald-500/20 rounded-[32px] p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col items-center mt-10"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
              <Check size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Driver Registered</h2>
            <p className="text-sm text-slate-400">The driver account has been created successfully.</p>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <ShieldCheck size={20} className="text-blue-500" />
                <h3 className="font-semibold tracking-wide text-[15px]">Driver Information</h3>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div className="relative group">
                  <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <User size={18} />
                  </div>
                  <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">Full Name</label>
                  <input
                    id="name" required value={formData.name} onChange={handleChange}
                    type="text" placeholder="e.g. Rohit Sharma"
                    className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Email */}
                <div className="relative group">
                  <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Mail size={18} />
                  </div>
                  <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">Email Address</label>
                  <input
                    id="email" required value={formData.email} onChange={handleChange}
                    type="email" placeholder="driver@transit.dev"
                    className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Phone */}
                <div className="relative group">
                  <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Phone size={18} />
                  </div>
                  <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">Contact Number</label>
                  <input
                    id="phone" required value={formData.phone} onChange={handleChange}
                    type="tel" placeholder="+91 98765 43210"
                    className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* License */}
                <div className="relative group">
                  <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Hash size={18} />
                  </div>
                  <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">License Number</label>
                  <input
                    id="license" required value={formData.license} onChange={handleChange}
                    type="text" placeholder="MP-09-XXXXXXXXX"
                    className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner font-mono tracking-widest uppercase"
                  />
                </div>

                {/* Initial Password (Required) */}
                <div className="relative group">
                  <div className="absolute left-4 top-[38px] text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <label className="text-[12px] font-medium text-slate-400 mb-1.5 block px-1 uppercase tracking-wider">Initial Password (Min 8 characters)</label>
                  <input
                    id="password" required minLength={8} value={formData.password} onChange={handleChange}
                    type="password" placeholder="•••••••• (At least 8 characters)"
                    className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[52px] rounded-xl pl-11 pr-4 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full h-[56px] bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-[15px] rounded-2xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Register Driver'}
            </button>
          </motion.form>
        )}
      </div>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        requiredRole="Admin"
        actionName="registering new drivers"
      />
    </div>
  );
}
