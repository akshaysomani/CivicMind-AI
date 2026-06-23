import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import { CitizenProvider } from './context/CitizenContext';
import { GovernmentProvider } from './context/GovernmentContext';
import { IssueProvider } from './context/IssueContext';
import { MapProvider } from './context/MapContext';


// Layout & Route Guard
import AppLayout from './layout/AppLayout';
import Protected from './components/Protected';

// Shared Components
import LoadingSpinner from './components/LoadingSpinner';

// Lazy Loaded Pages — Public
const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));

// Dashboard Layouts & Pages
const DashboardLayout = lazy(() => import('./layout/DashboardLayout'));
const CitizenDashboard = lazy(() => import('./pages/dashboards/CitizenDashboard'));
const MyReports = lazy(() => import('./pages/dashboards/MyReports'));
const CommunityFeed = lazy(() => import('./pages/dashboards/CommunityFeed'));
const SavedReports = lazy(() => import('./pages/dashboards/SavedReports'));
const NearbyAlerts = lazy(() => import('./pages/dashboards/NearbyAlerts'));
const AchievementsPage = lazy(() => import('./pages/dashboards/AchievementsPage'));
const HelpCenterPlaceholder = lazy(() => import('./pages/dashboards/Placeholders').then(m => ({ default: m.HelpCenterPlaceholder })));
const GisMapPage = lazy(() => import('./pages/dashboards/GisMapPage'));

// ── Module 5: Issue Reporting Pages ──────────────────────────────────────────
const ReportIssuePage = lazy(() => import('./pages/issues/ReportIssuePage'));
const IssueDetailPage = lazy(() => import('./pages/issues/IssueDetailPage'));

// Government Dashboard
const GovernmentLayout = lazy(() => import('./layout/GovernmentLayout'));
const GovernmentDashboard = lazy(() => import('./pages/dashboards/GovernmentDashboard'));
const GovernmentIssues = lazy(() => import('./pages/dashboards/GovernmentIssues'));
const GovernmentDepartments = lazy(() => import('./pages/dashboards/GovernmentDepartments'));
const GovernmentWardAnalytics = lazy(() => import('./pages/dashboards/GovernmentWardAnalytics'));
const GovernmentResources = lazy(() => import('./pages/dashboards/GovernmentResources'));
const GovernmentAnnouncements = lazy(() => import('./pages/dashboards/GovernmentAnnouncements'));
const GovernmentCitizens = lazy(() => import('./pages/dashboards/GovernmentCitizens'));
const GovernmentReports = lazy(() => import('./pages/dashboards/GovernmentReports'));
const NgoDashboard = lazy(() => import('./pages/dashboards/NgoDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <NotificationProvider>
          <AuthProvider>
            <IssueProvider>
              <MapProvider>
                <CitizenProvider>
                  <GovernmentProvider>
                  <AIProvider>
                    <BrowserRouter>
                      <Suspense
                        fallback={
                          <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                            <LoadingSpinner size="lg" text="Loading CivicMind Workspace..." />
                          </div>
                        }
                      >
                        <Routes>
                          {/* Global layout routes */}
                          <Route element={<AppLayout />}>
                            {/* Public routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/features" element={<Features />} />
                            <Route path="/contact" element={<Contact />} />

                            {/* Auth routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/verify-email" element={<VerifyEmail />} />

                            {/* Protected Profile & Settings */}
                            <Route path="/profile" element={<Protected><Profile /></Protected>} />
                            <Route path="/account-settings" element={<Protected><AccountSettings /></Protected>} />

                            {/* ── Citizen Dashboard ───────────────────────────── */}
                            <Route
                              path="/dashboard/citizen"
                              element={
                                <Protected allowedRoles={['Citizen']}>
                                  <DashboardLayout />
                                </Protected>
                              }
                            >
                              <Route index element={<CitizenDashboard />} />
                              <Route path="map" element={<GisMapPage />} />
                              {/* Module 5: Full wizard replaces placeholder */}
                              <Route path="report-issue" element={<ReportIssuePage />} />
                              {/* Enhanced MyReports with IssueContext */}
                              <Route path="reports" element={<MyReports />} />
                              {/* Module 5: Issue detail */}
                              <Route path="reports/:id" element={<IssueDetailPage />} />
                              <Route path="feed" element={<CommunityFeed />} />
                              <Route path="saved" element={<SavedReports />} />
                              <Route path="alerts" element={<NearbyAlerts />} />
                              <Route path="achievements" element={<AchievementsPage />} />
                              <Route path="settings" element={<AccountSettings />} />
                              <Route path="help" element={<HelpCenterPlaceholder />} />
                            </Route>

                            {/* ── Government Dashboard ────────────────────────── */}
                            <Route
                              path="/dashboard/government"
                              element={
                                <Protected allowedRoles={['Government']}>
                                  <GovernmentLayout />
                                </Protected>
                              }
                            >
                              <Route index element={<GovernmentDashboard />} />
                              <Route path="map" element={<GisMapPage />} />
                              <Route path="issues" element={<GovernmentIssues />} />
                              <Route path="departments" element={<GovernmentDepartments />} />
                              <Route path="analytics" element={<GovernmentWardAnalytics />} />
                              <Route path="resources" element={<GovernmentResources />} />
                              <Route path="announcements" element={<GovernmentAnnouncements />} />
                              <Route path="citizens" element={<GovernmentCitizens />} />
                              <Route path="reports" element={<GovernmentReports />} />
                              <Route path="settings" element={<AccountSettings />} />
                              <Route path="help" element={<HelpCenterPlaceholder />} />
                            </Route>

                            {/* ── NGO Dashboard ───────────────────────────────── */}
                            <Route
                              path="/dashboard/ngo"
                              element={
                                <Protected allowedRoles={['NGO']}>
                                  <NgoDashboard />
                                </Protected>
                              }
                            />

                            {/* ── Admin Dashboard ─────────────────────────────── */}
                            <Route
                              path="/dashboard/admin"
                              element={
                                <Protected allowedRoles={['Admin']}>
                                  <AdminDashboard />
                                </Protected>
                              }
                            />

                            {/* Wildcard 404 */}
                            <Route path="*" element={<NotFound />} />
                          </Route>
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </AIProvider>
                </GovernmentProvider>
              </CitizenProvider>
            </MapProvider>
          </IssueProvider>
          </AuthProvider>
        </NotificationProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
