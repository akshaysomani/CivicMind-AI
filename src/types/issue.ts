// ─── Issue Categories ────────────────────────────────────────────────────────

export interface IssueCategory {
  id: string;
  label: string;
  icon: string;
  color: string;        // Tailwind bg color class
  textColor: string;    // Tailwind text color class
  borderColor: string;  // Tailwind border color class
  department: string;
}

export const ISSUE_CATEGORIES: IssueCategory[] = [
  { id: 'Road Damage',        label: 'Road Damage',        icon: '🛣️',  color: 'bg-orange-500/20',  textColor: 'text-orange-400',  borderColor: 'border-orange-500/40', department: 'Public Works Department' },
  { id: 'Potholes',           label: 'Potholes',           icon: '🕳️',  color: 'bg-amber-500/20',   textColor: 'text-amber-400',   borderColor: 'border-amber-500/40',  department: 'Public Works Department' },
  { id: 'Street Lights',      label: 'Street Lights',      icon: '💡',  color: 'bg-yellow-500/20',  textColor: 'text-yellow-400',  borderColor: 'border-yellow-500/40', department: 'Electricity Department' },
  { id: 'Garbage Collection', label: 'Garbage Collection', icon: '🗑️',  color: 'bg-lime-500/20',    textColor: 'text-lime-400',    borderColor: 'border-lime-500/40',   department: 'Sanitation Department' },
  { id: 'Water Leakage',      label: 'Water Leakage',      icon: '💧',  color: 'bg-blue-500/20',    textColor: 'text-blue-400',    borderColor: 'border-blue-500/40',   department: 'Water & Sewage Department' },
  { id: 'Water Supply',       label: 'Water Supply',       icon: '🚰',  color: 'bg-cyan-500/20',    textColor: 'text-cyan-400',    borderColor: 'border-cyan-500/40',   department: 'Water & Sewage Department' },
  { id: 'Drainage',           label: 'Drainage',           icon: '🌊',  color: 'bg-teal-500/20',    textColor: 'text-teal-400',    borderColor: 'border-teal-500/40',   department: 'Water & Sewage Department' },
  { id: 'Sewage',             label: 'Sewage',             icon: '🔩',  color: 'bg-emerald-600/20', textColor: 'text-emerald-400', borderColor: 'border-emerald-600/40',department: 'Water & Sewage Department' },
  { id: 'Traffic',            label: 'Traffic',            icon: '🚦',  color: 'bg-red-500/20',     textColor: 'text-red-400',     borderColor: 'border-red-500/40',    department: 'Traffic Police' },
  { id: 'Illegal Parking',    label: 'Illegal Parking',    icon: '🚗',  color: 'bg-rose-500/20',    textColor: 'text-rose-400',    borderColor: 'border-rose-500/40',   department: 'Traffic Police' },
  { id: 'Public Transport',   label: 'Public Transport',   icon: '🚌',  color: 'bg-indigo-500/20',  textColor: 'text-indigo-400',  borderColor: 'border-indigo-500/40', department: 'Transport Department' },
  { id: 'Air Pollution',      label: 'Air Pollution',      icon: '🌫️',  color: 'bg-slate-500/20',   textColor: 'text-slate-400',   borderColor: 'border-slate-500/40',  department: 'Environment Department' },
  { id: 'Noise Pollution',    label: 'Noise Pollution',    icon: '🔊',  color: 'bg-purple-500/20',  textColor: 'text-purple-400',  borderColor: 'border-purple-500/40', department: 'Environment Department' },
  { id: 'Tree Damage',        label: 'Tree Damage',        icon: '🌳',  color: 'bg-green-500/20',   textColor: 'text-green-400',   borderColor: 'border-green-500/40',  department: 'Forest & Horticulture Department' },
  { id: 'Flooding',           label: 'Flooding',           icon: '🌧️',  color: 'bg-sky-500/20',     textColor: 'text-sky-400',     borderColor: 'border-sky-500/40',    department: 'Disaster Management Department' },
  { id: 'Electricity',        label: 'Electricity',        icon: '⚡',  color: 'bg-yellow-600/20',  textColor: 'text-yellow-300',  borderColor: 'border-yellow-600/40', department: 'Electricity Department' },
  { id: 'Public Safety',      label: 'Public Safety',      icon: '🛡️',  color: 'bg-blue-700/20',    textColor: 'text-blue-300',    borderColor: 'border-blue-700/40',   department: 'Police Department' },
  { id: 'Healthcare',         label: 'Healthcare',         icon: '🏥',  color: 'bg-pink-500/20',    textColor: 'text-pink-400',    borderColor: 'border-pink-500/40',   department: 'Health Department' },
  { id: 'Government Office',  label: 'Government Office',  icon: '🏛️',  color: 'bg-violet-500/20',  textColor: 'text-violet-400',  borderColor: 'border-violet-500/40', department: 'General Administration Department' },
  { id: 'Education',          label: 'Education',          icon: '📚',  color: 'bg-blue-400/20',    textColor: 'text-blue-300',    borderColor: 'border-blue-400/40',   department: 'Education Department' },
  { id: 'Animal Rescue',      label: 'Animal Rescue',      icon: '🐾',  color: 'bg-amber-600/20',   textColor: 'text-amber-300',   borderColor: 'border-amber-600/40',  department: 'Municipal Corporation' },
  { id: 'Fire Hazard',        label: 'Fire Hazard',        icon: '🔥',  color: 'bg-red-700/20',     textColor: 'text-red-300',     borderColor: 'border-red-700/40',    department: 'Fire Department' },
  { id: 'Disaster',           label: 'Disaster',           icon: '🆘',  color: 'bg-red-900/30',     textColor: 'text-red-200',     borderColor: 'border-red-900/50',    department: 'Disaster Management Department' },
  { id: 'Illegal Construction',label:'Illegal Construction',icon: '🏗️', color: 'bg-orange-700/20',  textColor: 'text-orange-300',  borderColor: 'border-orange-700/40', department: 'Town Planning Department' },
  { id: 'Others',             label: 'Others',             icon: '📋',  color: 'bg-gray-500/20',    textColor: 'text-gray-400',    borderColor: 'border-gray-500/40',   department: 'General Administration Department' },
];

// ─── Priority & Severity ─────────────────────────────────────────────────────

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Severity = 'Minor' | 'Moderate' | 'Major' | 'Emergency';
export type IssueStatus = 'Submitted' | 'Verified' | 'Assigned' | 'In Progress' | 'Under Inspection' | 'Resolved' | 'Closed' | 'Rejected';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  Low:      { label: 'Low',      color: 'text-green-400',  bg: 'bg-green-500/20' },
  Medium:   { label: 'Medium',   color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  High:     { label: 'High',     color: 'text-orange-400', bg: 'bg-orange-500/20' },
  Critical: { label: 'Critical', color: 'text-red-400',    bg: 'bg-red-500/20' },
};

export const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string }> = {
  Minor:     { label: 'Minor',     color: 'text-sky-400',    bg: 'bg-sky-500/20' },
  Moderate:  { label: 'Moderate',  color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  Major:     { label: 'Major',     color: 'text-violet-400', bg: 'bg-violet-500/20' },
  Emergency: { label: 'Emergency', color: 'text-red-300',    bg: 'bg-red-600/20' },
};

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; bg: string; icon: string }> = {
  'Submitted':       { label: 'Submitted',        color: 'text-slate-300',   bg: 'bg-slate-500/20',   icon: '📝' },
  'Verified':        { label: 'Verified',          color: 'text-blue-400',    bg: 'bg-blue-500/20',    icon: '✅' },
  'Assigned':        { label: 'Assigned',          color: 'text-indigo-400',  bg: 'bg-indigo-500/20',  icon: '👤' },
  'In Progress':     { label: 'In Progress',       color: 'text-amber-400',   bg: 'bg-amber-500/20',   icon: '⚙️' },
  'Under Inspection':{ label: 'Under Inspection',  color: 'text-orange-400',  bg: 'bg-orange-500/20',  icon: '🔍' },
  'Resolved':        { label: 'Resolved',          color: 'text-green-400',   bg: 'bg-green-500/20',   icon: '✔️' },
  'Closed':          { label: 'Closed',            color: 'text-slate-400',   bg: 'bg-slate-600/20',   icon: '🔒' },
  'Rejected':        { label: 'Rejected',          color: 'text-red-400',     bg: 'bg-red-500/20',     icon: '❌' },
};

export const STATUS_STEPS: IssueStatus[] = [
  'Submitted', 'Verified', 'Assigned', 'In Progress', 'Under Inspection', 'Resolved', 'Closed',
];

// ─── Data Models ─────────────────────────────────────────────────────────────

export interface Attachment {
  id: number;
  report_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_type: 'image' | 'video' | 'document';
  mime_type: string | null;
  file_size: number;
  created_at: string;
}

export interface StatusHistoryEntry {
  id: number;
  report_id: number;
  old_status: string | null;
  new_status: string;
  note: string | null;
  changed_by_id: number | null;
  created_at: string;
}

export interface Issue {
  id: number;
  complaint_id: string;
  tracking_number: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  severity: Severity;
  status: IssueStatus;
  progress: number;
  address: string | null;
  ward: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  nearby_landmark: string | null;
  is_anonymous: boolean;
  contact_method: string;
  assigned_department: string | null;
  assigned_officer_id: number | null;
  estimated_response_hours: number | null;
  resolution_note: string | null;
  resolved_at: string | null;
  citizen_id: number;
  created_at: string;
  updated_at: string;
  is_saved: boolean;
}

export interface IssueDetail extends Issue {
  attachments: Attachment[];
  status_history: StatusHistoryEntry[];
}

export interface TrackingResult {
  complaint_id: string;
  tracking_number: string;
  title: string;
  category: string;
  status: IssueStatus;
  progress: number;
  priority: Priority;
  severity: Severity;
  assigned_department: string | null;
  estimated_response_hours: number | null;
  created_at: string;
  updated_at: string;
  status_history: StatusHistoryEntry[];
}

// ─── Wizard Form State ───────────────────────────────────────────────────────

export interface IssueFormDraft {
  category: string;
  title: string;
  description: string;
  priority: Priority;
  severity: Severity;
  address: string;
  ward: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  nearby_landmark: string;
  is_anonymous: boolean;
  contact_method: string;
  consent_given: boolean;
  files: File[];
}

export const DEFAULT_DRAFT: IssueFormDraft = {
  category: '',
  title: '',
  description: '',
  priority: 'Medium',
  severity: 'Moderate',
  address: '',
  ward: '',
  city: '',
  state: '',
  country: 'India',
  postal_code: '',
  latitude: null,
  longitude: null,
  nearby_landmark: '',
  is_anonymous: false,
  contact_method: 'email',
  consent_given: false,
  files: [],
};

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface IssueFilters {
  search: string;
  category: string;
  priority: string;
  severity: string;
  status: string;
  ward: string;
  date_from: string;
  date_to: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: IssueFilters = {
  search: '',
  category: '',
  priority: '',
  severity: '',
  status: '',
  ward: '',
  date_from: '',
  date_to: '',
  sort_by: 'created_at',
  sort_order: 'desc',
};
