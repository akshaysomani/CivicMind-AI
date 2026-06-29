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
import { EmergencyProvider } from './context/EmergencyContext';
import { IssueProvider } from './context/IssueContext';
import { MapProvider } from './context/MapContext';
import { HealthcareProvider } from './context/HealthcareContext';
import { SchemeProvider } from './context/SchemeContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { ForecastProvider } from './context/ForecastContext';
import { NotificationCenterProvider } from './context/NotificationCenterContext';
import { ReportingProvider } from './context/ReportingContext';
import { AdminProvider } from './context/AdminContext';
import { QAProvider } from './context/QAContext';
import { PresentationProvider } from './context/PresentationContext';
import { PresentationTour } from './components/PresentationTour';




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

// Admin Dashboard Pages
const AdminLayout = lazy(() => import('./layout/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const RoleManagementPage = lazy(() => import('./pages/admin/RoleManagementPage'));
const PermissionManagementPage = lazy(() => import('./pages/admin/PermissionManagementPage'));
const AiOperationsPage = lazy(() => import('./pages/admin/AiOperationsPage'));
const DepartmentManagementPage = lazy(() => import('./pages/admin/DepartmentManagementPage'));
const KnowledgeManagementPage = lazy(() => import('./pages/admin/KnowledgeManagementPage'));
const ApiConsolePage = lazy(() => import('./pages/admin/ApiConsolePage'));
const MonitoringPage = lazy(() => import('./pages/admin/MonitoringPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const SecurityCenterPage = lazy(() => import('./pages/admin/SecurityCenterPage'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage'));
const CacheManagementPage = lazy(() => import('./pages/admin/CacheManagementPage'));
const ErrorMonitoringPage = lazy(() => import('./pages/admin/ErrorMonitoringPage'));
const QaDashboardPage = lazy(() => import('./pages/admin/QaDashboardPage'));


const AiConsolePage = lazy(() => import('./pages/dashboards/AiConsolePage'));
const AiAssistantPage = lazy(() => import('./pages/dashboards/AiAssistantPage'));
const EmergencyDashboardPage = lazy(() => import('./pages/dashboards/EmergencyDashboardPage'));
const HealthcarePage = lazy(() => import('./pages/dashboards/HealthcarePage'));
const SchemesPage = lazy(() => import('./pages/dashboards/SchemesPage'));
const AnalyticsDashboardPage = lazy(() => import('./pages/dashboards/AnalyticsDashboardPage').then(m => ({ default: m.AnalyticsDashboardPage })));
const ForecastPage = lazy(() => import('./pages/dashboards/ForecastPage').then(m => ({ default: m.ForecastPage })));
const NotificationCenterPage = lazy(() => import('./pages/dashboards/NotificationCenterPage'));
const WorkflowBuilderPage = lazy(() => import('./pages/dashboards/WorkflowBuilderPage'));
const ExecutiveDashboardPage = lazy(() => import('./pages/dashboards/ExecutiveDashboardPage'));
const ReportBuilderPage = lazy(() => import('./pages/dashboards/ReportBuilderPage'));
const DecisionBriefingsPage = lazy(() => import('./pages/dashboards/DecisionBriefingsPage'));
const ScheduledReportsPage = lazy(() => import('./pages/dashboards/ScheduledReportsPage'));
const ReportViewerPage = lazy(() => import('./pages/dashboards/ReportViewerPage'));



export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <NotificationProvider>
          <AuthProvider>
            <NotificationCenterProvider>
              <ReportingProvider>
                <IssueProvider>
              <MapProvider>
                <CitizenProvider>
                  <GovernmentProvider>
                  <EmergencyProvider>
                  <HealthcareProvider>
                  <SchemeProvider>
                  <AnalyticsProvider>
                  <ForecastProvider>
                  <AIProvider>
                    <AdminProvider>
                     <QAProvider>
                      <BrowserRouter basename={import.meta.env.BASE_URL}>
                       <PresentationProvider>
                         <PresentationTour />
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
                              <Route path="assistant" element={<AiAssistantPage />} />
                              <Route path="healthcare" element={<HealthcarePage />} />
                              <Route path="schemes" element={<SchemesPage />} />
                              <Route path="analytics" element={<AnalyticsDashboardPage />} />
                              <Route path="forecast" element={<ForecastPage />} />
                              <Route path="achievements" element={<AchievementsPage />} />
                              <Route path="notifications" element={<NotificationCenterPage />} />
                              <Route path="workflows" element={<WorkflowBuilderPage />} />
                              <Route path="executive-dashboard" element={<ExecutiveDashboardPage />} />
                              <Route path="report-builder" element={<ReportBuilderPage />} />
                              <Route path="decision-briefings" element={<DecisionBriefingsPage />} />
                              <Route path="scheduled-reports" element={<ScheduledReportsPage />} />
                              <Route path="report-viewer/:id" element={<ReportViewerPage />} />
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
                              <Route path="ai-console" element={<AiConsolePage />} />
                              <Route path="emergency" element={<EmergencyDashboardPage />} />
                              <Route path="departments" element={<GovernmentDepartments />} />
                              <Route path="analytics" element={<GovernmentWardAnalytics />} />
                              <Route path="resources" element={<GovernmentResources />} />
                              <Route path="announcements" element={<GovernmentAnnouncements />} />
                              <Route path="citizens" element={<GovernmentCitizens />} />
                              <Route path="reports" element={<GovernmentReports />} />
                              <Route path="notifications" element={<NotificationCenterPage />} />
                              <Route path="workflows" element={<WorkflowBuilderPage />} />
                              <Route path="executive-dashboard" element={<ExecutiveDashboardPage />} />
                              <Route path="report-builder" element={<ReportBuilderPage />} />
                              <Route path="decision-briefings" element={<DecisionBriefingsPage />} />
                              <Route path="scheduled-reports" element={<ScheduledReportsPage />} />
                              <Route path="report-viewer/:id" element={<ReportViewerPage />} />
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
                                <Protected allowedRoles={['Admin', 'Super Administrator']}>
                                  <AdminLayout />
                                </Protected>
                              }
                            >
                              <Route index element={<AdminDashboardPage />} />
                              <Route path="users" element={<UserManagementPage />} />
                              <Route path="roles" element={<RoleManagementPage />} />
                              <Route path="permissions" element={<PermissionManagementPage />} />
                              <Route path="agents" element={<AiOperationsPage />} />
                              <Route path="departments" element={<DepartmentManagementPage />} />
                              <Route path="knowledge" element={<KnowledgeManagementPage />} />
                              <Route path="api" element={<ApiConsolePage />} />
                              <Route path="monitoring" element={<MonitoringPage />} />
                              <Route path="audit" element={<AuditLogsPage />} />
                              <Route path="security" element={<SecurityCenterPage />} />
                              <Route path="cache" element={<CacheManagementPage />} />
                              <Route path="errors" element={<ErrorMonitoringPage />} />
                              <Route path="settings" element={<SystemSettingsPage />} />
                              <Route path="qa" element={<QaDashboardPage />} />

                            </Route>

                            {/* Wildcard 404 */}
                            <Route path="*" element={<NotFound />} />
                          </Route>
                        </Routes>
                       </Suspense>
                     </PresentationProvider>
                     </BrowserRouter>
                     </QAProvider>
                    </AdminProvider>
                  </AIProvider>
                  </ForecastProvider>
                  </AnalyticsProvider>
                  </SchemeProvider>
                  </HealthcareProvider>
                  </EmergencyProvider>
                </GovernmentProvider>
              </CitizenProvider>
            </MapProvider>
          </IssueProvider>
          </ReportingProvider>
          </NotificationCenterProvider>
          </AuthProvider>
        </NotificationProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
