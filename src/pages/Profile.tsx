import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { SectionHeader } from '../components/SectionHeader';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building, Calendar, Camera } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, uploadAvatar } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
  // If absolute path is set on backend, resolve it, otherwise fallback to template initials
  const avatarUrl = currentUser.profile_image
    ? `${API_ROOT.replace('/api/v1', '')}${currentUser.profile_image}`
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      <SectionHeader
        title="Workspace Identity"
        subtitle="Manage your credential information, trace verification badges, and upload profile photos."
        badge="Citizen Details"
        center={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card & Avatar */}
        <GlassCard className="md:col-span-1 border border-white/5 flex flex-col items-center text-center p-8">
          <div className="relative group cursor-pointer mb-6" onClick={handleAvatarClick}>
            {/* Avatar Circle */}
            <div className="w-28 h-28 rounded-full border-4 border-primary/20 overflow-hidden flex items-center justify-center bg-slate-800 text-slate-200 relative select-none">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-black text-4xl text-primary">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </span>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
            {currentUser.first_name} {currentUser.last_name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
            {currentUser.role}
          </p>

          <div className="mt-8 w-full space-y-3">
            <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate('/account-settings')}>
              Edit Settings
            </Button>
            
            {/* Direct Dashboard Link */}
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                const roleRoutes = {
                  Citizen: '/dashboard/citizen',
                  Government: '/dashboard/government',
                  NGO: '/dashboard/ngo',
                  Admin: '/dashboard/admin',
                };
                navigate(roleRoutes[currentUser.role] || '/');
              }}
            >
              Open Dashboard
            </Button>
          </div>
        </GlassCard>

        {/* Detailed Info Grid */}
        <div className="md:col-span-2">
          <GlassCard className="border border-white/5 p-8 h-full">
            <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-6 pb-2 border-b border-white/5">
              Account Attributes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
              {/* Full Name */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-slate-800/40 rounded-xl text-slate-400 border border-white/5 mt-0.5">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Full Name</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5 block">
                    {currentUser.first_name} {currentUser.last_name}
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-slate-800/40 rounded-xl text-slate-400 border border-white/5 mt-0.5">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Email Address</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5 block break-all">
                    {currentUser.email}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                    currentUser.email_verified
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {currentUser.email_verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-slate-800/40 rounded-xl text-slate-400 border border-white/5 mt-0.5">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Phone Number</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5 block">
                    {currentUser.phone}
                  </span>
                </div>
              </div>

              {/* Organization */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-slate-800/40 rounded-xl text-slate-400 border border-white/5 mt-0.5">
                  <Building className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Organization</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5 block">
                    {currentUser.organization || 'Not affiliated (Citizen)'}
                  </span>
                </div>
              </div>

              {/* Address Location */}
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="p-2.5 bg-slate-800/40 rounded-xl text-slate-400 border border-white/5 mt-0.5">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Zoning Location</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5 block">
                    {currentUser.address ? `${currentUser.address}, ` : ''}{currentUser.city}, {currentUser.state}, {currentUser.country}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="p-2.5 bg-slate-800/40 rounded-xl text-slate-400 border border-white/5 mt-0.5">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Workspace Created</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 mt-0.5 block">
                    {new Date(currentUser.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default Profile;
