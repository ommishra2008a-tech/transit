import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Shield, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const { closeSidebar } = useSidebar();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    assigned_bus: user?.assigned_bus || ''
  });

  const role = user?.email?.includes('driver') ? 'DRIVER' : user?.email?.includes('admin') ? 'ADMIN' : 'PASSENGER';

  const handleLogout = async () => {
    closeSidebar();
    await logout();
    navigate('/login');
  };

  const handleSave = async () => {
    try {
      if (user && user.$id) {
        await solarch.db.collection('users').update(user.$id, {
          name: formData.name,
          phone: formData.phone,
          ...(role === 'DRIVER' && { assigned_bus: formData.assigned_bus })
        });
      }
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('temp_user_data', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      window.location.reload(); // Re-hydrate useAuth
    } catch (err) {
      alert('Updating profile is currently not supported natively by the Solarch backend instance. Saving locally...');
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('temp_user_data', JSON.stringify(updatedUser));
      setIsEditing(false);
      window.location.reload();
    }
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030712] to-[#030712] pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Profile</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mt-6 mb-10"
        >
          <div className="w-28 h-28 rounded-full bg-blue-500/20 border-4 border-blue-500/30 flex items-center justify-center overflow-hidden mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
             <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=0D8ABC&color=fff&size=150`} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[24px] font-bold text-white tracking-wide">{capitalizedName}</h2>
          <div className="flex items-center gap-1.5 mt-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            <Shield size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{role}</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-[12px] text-slate-500 uppercase tracking-widest font-bold mb-4">Personal Information</h3>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Full Name</p>
                  {isEditing ? (
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500" />
                  ) : (
                    <p className="text-[15px] font-medium text-white">{formData.name || capitalizedName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-[15px] font-medium text-slate-300">{user?.email || 'No email provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                  <Phone size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Phone Number</p>
                  {isEditing ? (
                    <input type="tel" id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500" />
                  ) : (
                    <p className="text-[15px] font-medium text-white">{formData.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {role === 'DRIVER' && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                    <span className="text-[18px]">🚌</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Assigned Bus</p>
                    {isEditing ? (
                      <input type="text" id="assigned_bus" value={formData.assigned_bus} onChange={e => setFormData({...formData, assigned_bus: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500 uppercase font-mono" />
                    ) : (
                      <p className="text-[15px] font-medium text-white">{formData.assigned_bus || 'No bus assigned'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {role !== 'ADMIN' && (
              <div className="mt-6 pt-5 border-t border-white/5">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                      <Save size={16} /> Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 text-rose-500 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </motion.div>
      </div>
    </div>
  );
}
