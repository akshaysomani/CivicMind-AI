import React from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useMap } from '../../context/MapContext';
import Button from '../Button';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, resetFilters, currentCoords, triggerLocateMe } = useMap();

  if (!isOpen) return null;

  const categories = [
    'Road Damage',
    'Potholes',
    'Street Lights',
    'Garbage Collection',
    'Water Leakage',
    'Water Supply',
    'Drainage',
    'Sewage',
    'Traffic',
    'Illegal Parking',
    'Public Transport',
    'Air Pollution',
    'Noise Pollution',
    'Tree Damage',
    'Flooding',
    'Electricity',
    'Public Safety',
    'Healthcare',
    'Government Office',
    'Education',
    'Animal Rescue',
    'Fire Hazard',
    'Disaster',
    'Illegal Construction',
  ];

  const statuses = [
    'Submitted',
    'Verified',
    'Assigned',
    'In Progress',
    'Under Inspection',
    'Resolved',
    'Closed',
    'Rejected',
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const severities = ['Minor', 'Moderate', 'Major', 'Emergency'];
  const departments = [
    'Public Works Department',
    'Sanitation Department',
    'Electricity Department',
    'Water & Sewage Department',
    'Traffic Police',
    'Transport Department',
    'Environment Department',
    'Forest & Horticulture Department',
    'Disaster Management Department',
    'Police Department',
    'Health Department',
    'General Administration Department',
    'Education Department',
    'Fire Department',
  ];

  const wards = [
    'Ward 1 - Richmond',
    'Ward 2 - Marina',
    'Ward 3 - Financial',
    'Ward 4 - Mission',
    'Ward 5 - Sunset',
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-slate-950/85 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-extrabold text-base text-slate-100">GIS Filter Engine</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Form Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar text-xs">
        {/* Distance Radius (requires GPS) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-450 uppercase tracking-wider">Nearby Radius Filter</span>
            <span className="font-extrabold text-primary">{filters.distanceRadius} km</span>
          </div>
          {!currentCoords ? (
            <button
              onClick={triggerLocateMe}
              className="w-full py-2 bg-slate-900 border border-white/5 rounded-xl text-center text-slate-300 font-bold hover:bg-slate-850 hover:border-primary transition-all cursor-pointer"
            >
              🔒 Enable GPS Locator
            </button>
          ) : (
            <input
              type="range"
              min="1"
              max="20"
              value={filters.distanceRadius}
              onChange={(e) => setFilters({ distanceRadius: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          )}
        </div>

        <hr className="border-white/5" />

        {/* Category */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-450 uppercase tracking-wider block">Issue Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-slate-205 focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-450 uppercase tracking-wider block">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-slate-205 focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Priority & Severity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-450 uppercase tracking-wider block">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ priority: e.target.value })}
              className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-2.5 py-2 text-slate-205 focus:outline-none focus:border-primary"
            >
              <option value="">All</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-450 uppercase tracking-wider block">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ severity: e.target.value })}
              className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-2.5 py-2 text-slate-205 focus:outline-none focus:border-primary"
            >
              <option value="">All</option>
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Department */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-450 uppercase tracking-wider block">Assigned Department</label>
          <select
            value={filters.department}
            onChange={(e) => setFilters({ department: e.target.value })}
            className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-slate-205 focus:outline-none focus:border-primary"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Municipal Ward */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-450 uppercase tracking-wider block">Municipal Ward</label>
          <select
            value={filters.ward}
            onChange={(e) => setFilters({ ward: e.target.value })}
            className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-3 py-2 text-slate-205 focus:outline-none focus:border-primary"
          >
            <option value="">All Wards</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-450 uppercase tracking-wider block">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ dateFrom: e.target.value })}
              className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-2 py-1.5 text-slate-205 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-450 uppercase tracking-wider block">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ dateTo: e.target.value })}
              className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-2 py-1.5 text-slate-205 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Toggle Switches */}
        <div className="space-y-3 pt-1">
          {/* Resolved Only */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-bold text-slate-300">Resolved Complaints Only</span>
            <input
              type="checkbox"
              checked={filters.resolvedOnly}
              onChange={(e) => setFilters({ resolvedOnly: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary accent-primary"
            />
          </label>

          {/* Open Only */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-bold text-slate-300">Active / Open Only</span>
            <input
              type="checkbox"
              checked={filters.openOnly}
              onChange={(e) => setFilters({ openOnly: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary accent-primary"
            />
          </label>

          {/* My Reports */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-bold text-slate-300">My Reports Only</span>
            <input
              type="checkbox"
              checked={filters.myReportsOnly}
              onChange={(e) => setFilters({ myReportsOnly: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary accent-primary"
            />
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/5 flex gap-4 shrink-0 bg-slate-950/40">
        <Button
          variant="secondary"
          onClick={resetFilters}
          className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </Button>
        <Button
          variant="primary"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl"
        >
          Apply Filters
        </Button>
      </div>
    </motion.div>
  );
};
export default FilterDrawer;
