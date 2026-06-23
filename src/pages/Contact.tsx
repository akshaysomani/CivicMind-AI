import React, { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useNotifications } from '../context/NotificationContext';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  const { showNotification } = useNotifications();
  const [form, setForm] = useState({ name: '', email: '', topic: 'Community General', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const temp: Record<string, string> = {};
    if (!form.name.trim()) temp.name = 'Full Name is required';
    if (!form.email.trim()) {
      temp.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      temp.email = 'Please enter a valid email address';
    }
    if (!form.message.trim()) temp.message = 'Message content is required';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showNotification('Please correct validation errors.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulated API call
    setTimeout(() => {
      showNotification(`Thank you ${form.name}! Your message regarding "${form.topic}" was sent successfully.`, 'success');
      setForm({ name: '', email: '', topic: 'Community General', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfos = [
    { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'architect@civicmind.ai' },
    { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: '+1 (555) 432-1090' },
    { icon: <MapPin className="w-5 h-5" />, label: 'HQ Address', value: 'CivicMind Lab, San Francisco, CA' },
  ];

  return (
    <div className="space-y-16 py-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Get in Touch"
        subtitle="Have questions about deploying CivicMind AI in your municipality? Speak with our integration team."
        badge="Contact Channels"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {contactInfos.map((info, idx) => (
            <GlassCard key={idx} className="p-6 border border-white/5 flex items-center gap-4 animate-float-slow">
              <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shrink-0">
                {info.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{info.label}</h4>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mt-0.5">{info.value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Contact Form Card */}
        <div className="md:col-span-2">
          <GlassCard className="p-8 md:p-10 border border-white/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.name ? 'border-rose-500' : 'border-white/10 dark:border-white/5 light:border-slate-350'
                    }`}
                    placeholder="Jane Doe"
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <span id="name-error" className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</span>
                  )}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.email ? 'border-rose-500' : 'border-white/10 dark:border-white/5 light:border-slate-350'
                    }`}
                    placeholder="jane@company.com"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <span id="email-error" className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</span>
                  )}
                </div>
              </div>

              {/* Topic Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="topic" className="text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-400">
                  Topic of Inquiry
                </label>
                <select
                  id="topic"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border border-white/10 dark:border-white/5 light:border-slate-350 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Community General">Community General</option>
                  <option value="NGO Partnerships">NGO Partnerships</option>
                  <option value="Government Integration">Government Integration</option>
                  <option value="Technical Feedback">Technical Feedback</option>
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-655 dark:text-slate-400">
                  Message Details
                </label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => {
                    setForm({ ...form, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  rows={5}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-50 border transition-all text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    errors.message ? 'border-rose-500' : 'border-white/10 dark:border-white/5 light:border-slate-350'
                  }`}
                  placeholder="Detail your request here..."
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message && (
                  <span id="message-error" className="text-xs text-rose-500 mt-1 font-medium">{errors.message}</span>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" variant="primary" className="w-full gap-2 items-center" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Sending Request...' : 'Send Message'}</span>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default Contact;
