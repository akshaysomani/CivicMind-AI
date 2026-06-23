import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { User, ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export const AccountSettings: React.FC = () => {
  const { currentUser, updateProfile, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  // Profile fields state
  const [profileForm, setProfileForm] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    country: currentUser?.country || 'USA',
    organization: currentUser?.organization || '',
  });

  // Password fields state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Deletion confirm
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile(profileForm);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showNotification('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      showNotification('New password must be at least 8 characters.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(passwordForm.current_password, passwordForm.new_password);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
            Account Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your profiles, password credentials, and security tokens.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/profile')} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>View Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar (Anchor links) */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <a
            href="#details"
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/20 dark:bg-slate-800/20 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-350 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-semibold"
          >
            <User className="w-4.5 h-4.5" />
            <span>Profile Details</span>
          </a>
          <a
            href="#password"
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/20 dark:bg-slate-800/20 light:bg-slate-100 border border-white/5 dark:border-white/5 light:border-slate-350 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-semibold"
          >
            <KeyRound className="w-4.5 h-4.5" />
            <span>Change Password</span>
          </a>
          <a
            href="#danger"
            className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/5 light:bg-rose-50 border border-rose-500/10 hover:bg-rose-500/10 hover:text-rose-500 text-rose-500 transition-colors text-sm font-semibold"
          >
            <ShieldAlert className="w-4.5 h-4.5" />
            <span>Danger Zone</span>
          </a>
        </div>

        {/* Form Containers */}
        <div className="lg:col-span-2 space-y-8">
          {/* Form 1: Details */}
          <GlassCard id="details" className="border border-white/5 p-8 scroll-mt-24">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-6 pb-2 border-b border-white/5 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Details
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Organization</label>
                  <input
                    type="text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Address Location</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">State</label>
                  <input
                    type="text"
                    required
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-fit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Saving Details...' : 'Save Profile Changes'}
              </Button>
            </form>
          </GlassCard>

          {/* Form 2: Password */}
          <GlassCard id="password" className="border border-white/5 p-8 scroll-mt-24">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-6 pb-2 border-b border-white/5 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-secondary" /> Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                    placeholder="••••••••"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm text-slate-900 dark:text-slate-100"
                    placeholder="Retype new password"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-fit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </GlassCard>

          {/* Form 3: Danger Zone */}
          <GlassCard id="danger" className="border border-rose-500/20 bg-rose-500/5 p-8 scroll-mt-24">
            <h3 className="text-lg font-bold font-heading text-rose-500 mb-6 pb-2 border-b border-rose-500/10 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Danger Zone
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-400 mb-6">
              Deleting your account is permanent. All reported issues, coordinates, and personal summaries will be purged from municipal files.
            </p>
            <form onSubmit={handleDeleteSubmit} className="space-y-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="confirmDelete"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-rose-500/30 text-rose-500 focus:ring-rose-500/25 accent-rose-500"
                />
                <label htmlFor="confirmDelete" className="ml-2.5 text-xs text-rose-705 dark:text-rose-400 select-none">
                  I confirm that I want to delete my CivicMind AI account. This action is permanent and cannot be undone.
                </label>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 border-rose-600 text-white disabled:opacity-50"
                disabled={!confirmDelete || isDeleting}
              >
                {isDeleting ? 'Deleting Account...' : 'Delete My Account Permanent'}
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default AccountSettings;
