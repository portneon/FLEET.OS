"use client"
import React, { useState, useEffect } from 'react';
import { Bell, User, X, Loader2, Save } from 'lucide-react';
import { authAPI } from '@/lib/api';

interface TopBarProps {
  title: string;
  alertCount?: number;
}

export function TopBar({ title, alertCount = 0 }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    newPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await authAPI.me();
      if (!res.error && res.data) {
        setProfile(res.data);
        if (res.data.organization) {
           setFormData(prev => ({ ...prev, businessName: res.data.organization.name }));
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setMessage('');
    setError('');
    // reset password field when closing
    setFormData(prev => ({ ...prev, newPassword: '' }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload: any = {};
    if (formData.businessName) payload.businessName = formData.businessName;
    if (formData.newPassword) payload.newPassword = formData.newPassword;

    const res = await authAPI.updateProfile(payload);
    if (res.error) {
      setError(res.error);
    } else {
      setMessage('Profile updated successfully.');
      if (res.data) {
        setProfile((prev: any) => ({
          ...prev,
          organization: {
             ...prev?.organization,
             name: payload.businessName || prev?.organization?.name
          }
        }));
      }
      setFormData(prev => ({ ...prev, newPassword: '' }));
    }
    setSaving(false);
  };

  // Determine display name
  const displayName = profile?.organization?.name || profile?.name || 'Administrator';
  
  return (
    <>
      <header className="flex items-center justify-between p-6 border-b border-[#DCD7CB] bg-[#F9F8F4] backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <h2 className="text-lg font-light tracking-wide">{title}</h2>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer group">
            <Bell className="w-5 h-5 text-[#8C877D] group-hover:text-[#1A1A1A] transition-colors" strokeWidth={1} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1A1A1A] rounded-full"></span>
            )}
          </div>
          
          <button 
            onClick={handleOpen}
            className="flex items-center gap-3 px-4 py-2 border border-[#DCD7CB] hover:border-[#1A1A1A] transition-colors bg-[#FDFCF9] group"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] group-hover:underline">
              {loading ? 'SYNCING...' : displayName}
            </span>
            <div className="w-6 h-6 bg-[#1A1A1A] flex justify-center items-center rounded-full text-[#F9F8F4]">
              <User className="w-3 h-3" strokeWidth={2} />
            </div>
          </button>
        </div>
      </header>

      {/* Slide-out Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
             className="absolute inset-0 bg-[#1A1A1A]/20 backdrop-blur-sm transition-opacity" 
             onClick={handleClose}
          />
          
          <div className="relative w-full max-w-sm bg-[#FDFCF9] h-full shadow-2xl border-l border-[#DCD7CB] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[#DCD7CB] flex justify-between items-center bg-[#F9F8F4]">
              <div>
                <h3 className="font-['Playfair_Display',_serif] text-2xl text-[#1A1A1A]">Settings</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#8C877D] mt-1">Profile &amp; Credentials</p>
              </div>
              <button onClick={handleClose} className="p-2 border border-transparent hover:border-[#DCD7CB] transition-colors">
                <X className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-auto">
              <form onSubmit={handleUpdate} className="flex flex-col gap-8">
                
                {message && (
                  <div className="bg-[#ecfdf5] border border-[#10b981] p-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#065f46] font-bold">{message}</p>
                  </div>
                )}
                {error && (
                  <div className="bg-[#fef2f2] border border-[#ef4444] p-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#991b1b] font-bold">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Entity Designation (Business Name)</label>
                  <input 
                    type="text" 
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="E.g., Sharma Logistics"
                    className="w-full bg-[#F9F8F4] border border-[#DCD7CB] p-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                  <p className="text-xs font-light italic text-[#8C877D] mt-1">This will update your global organization label across all manifests.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8C877D]">Reset Authorization Key (Password)</label>
                  <input 
                    type="password" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Leave blank to skip..."
                    className="w-full bg-[#F9F8F4] border border-[#DCD7CB] p-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  />
                  <p className="text-xs font-light italic text-[#8C877D] mt-1">Updates your secure authentication cipher. Required for non-Google identities.</p>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="mt-4 bg-[#1A1A1A] text-[#F9F8F4] hover:bg-[#333333] transition-colors px-6 py-4 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
                  Integrate Changes
                </button>
              </form>
            </div>
            
            <div className="p-6 border-t border-[#DCD7CB] bg-[#F9F8F4]">
               <button 
                 onClick={() => {
                   localStorage.removeItem('token');
                   localStorage.removeItem('user');
                   localStorage.removeItem('orgId');
                   window.location.href = '/login';
                 }}
                 className="w-full border border-[#DCD7CB] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors px-4 py-3 text-[9px] uppercase tracking-widest font-bold"
               >
                 Terminate Session (Logout)
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
