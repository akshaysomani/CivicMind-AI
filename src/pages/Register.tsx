import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { SectionHeader } from '../components/SectionHeader';
import { User, Lock, Landmark, ArrowRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticating } = useAuth();
  const { showNotification } = useNotifications();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Citizen',
    city: '',
    state: '',
    country: 'USA',
    organization: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, label: 'None', color: 'bg-slate-700' };
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    const levels = [
      { score: 0, label: 'Weak', color: 'bg-rose-500' },
      { score: 1, label: 'Weak', color: 'bg-rose-500' },
      { score: 2, label: 'Fair', color: 'bg-amber-500' },
      { score: 3, label: 'Good', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-emerald-500' },
    ];
    return levels[score];
  };

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const temp: Record<string, string> = {};
    if (!form.first_name.trim()) temp.first_name = 'First name is required';
    if (!form.last_name.trim()) temp.last_name = 'Last name is required';
    
    if (!form.email.trim()) {
      temp.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      temp.email = 'Enter a valid email';
    }
    
    if (!form.phone.trim()) temp.phone = 'Phone number is required';
    
    if (!form.password) {
      temp.password = 'Password is required';
    } else if (form.password.length < 8) {
      temp.password = 'Password must be at least 8 characters';
    }
    
    if (form.password !== form.confirmPassword) {
      temp.confirmPassword = 'Passwords do not match';
    }
    
    if (!form.city.trim()) temp.city = 'City is required';
    if (!form.state.trim()) temp.state = 'State is required';
    if (!form.country.trim()) temp.country = 'Country is required';
    if (!agree) temp.agree = 'You must accept the terms';

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Map roles to what backend expects
      const mappedRole = form.role === 'Government Officer' ? 'Government' : form.role;
      const { confirmPassword: _, ...registerPayload } = form;
      
      await register({
        ...registerPayload,
        role: mappedRole
      });
      navigate('/login');
    } catch (err: any) {
      showNotification(err.message || 'Registration failed.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <SectionHeader
        title="Initialize Account"
        subtitle="Select your organizational role and city coordinates to create your security workspace."
        badge="Platform Sign-Up"
      />

      <GlassCard className="border border-white/5 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identity */}
          <div className="border-b border-white/5 pb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="Jane"
                />
                {errors.first_name && <span className="text-xs text-rose-500 font-medium">{errors.first_name}</span>}
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="Doe"
                />
                {errors.last_name && <span className="text-xs text-rose-500 font-medium">{errors.last_name}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="jane@example.com"
                />
                {errors.email && <span className="text-xs text-rose-500 font-medium">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && <span className="text-xs text-rose-500 font-medium">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Section 2: Role & Organizations */}
          <div className="border-b border-white/5 pb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Landmark className="w-4 h-4" /> Role & Location Coordinates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Government Officer">Government Officer</option>
                  <option value="NGO">NGO Representative</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </div>

              {/* Organization (Optional) */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Organization (optional)</label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="Department of Zoning / NGO Name"
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="San Francisco"
                />
                {errors.city && <span className="text-xs text-rose-500 font-medium">{errors.city}</span>}
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="California"
                />
                {errors.state && <span className="text-xs text-rose-500 font-medium">{errors.state}</span>}
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="USA"
                />
                {errors.country && <span className="text-xs text-rose-500 font-medium">{errors.country}</span>}
              </div>
            </div>
          </div>

          {/* Section 3: Credentials */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="••••••••"
                />
                {errors.password && <span className="text-xs text-rose-500 font-medium">{errors.password}</span>}

                {/* Password Strength Meter */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                      <span>Strength:</span>
                      <span className={strength.score >= 3 ? 'text-emerald-500' : strength.score === 2 ? 'text-yellow-500' : 'text-rose-500'}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <span className="text-xs text-rose-500 font-medium">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          {/* Privacy Agree */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => { setAgree(e.target.checked); if (errors.agree) setErrors({ ...errors, agree: '' }); }}
                className="h-4 w-4 mt-0.5 rounded border-slate-700/50 text-primary focus:ring-primary/20 accent-primary"
              />
              <label htmlFor="agree" className="ml-2.5 text-xs text-slate-750 dark:text-slate-400 select-none">
                I accept the CivicMind AI <a href="#privacy" className="text-primary hover:underline font-semibold">Privacy Policy</a> and <a href="#terms" className="text-primary hover:underline font-semibold">Terms & Conditions</a>.
              </label>
            </div>
            {errors.agree && <span className="text-xs text-rose-500 font-medium">{errors.agree}</span>}
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" className="w-full gap-2 mt-4" disabled={isAuthenticating}>
            <span>{isAuthenticating ? 'Initializing Workspace...' : 'Register Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Already have an active account? </span>
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Sign In Here
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
export default Register;
