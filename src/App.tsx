import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import AdminLayout from './components/layout/AdminLayout';
import { ToastProvider } from './components/common/Toast';
import Loading from './components/common/Loading';
import './App.css';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ServiceCategoriesPage = lazy(() => import('./pages/ServiceCategoriesPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const TaskerVerificationPage = lazy(() => import('./pages/TaskerVerificationPage'));
const DisputesPage = lazy(() => import('./pages/DisputesPage'));
const FlaggedReviewsPage = lazy(() => import('./pages/FlaggedReviewsPage'));
const RevenueReportPage = lazy(() => import('./pages/RevenueReportPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const ReportsCenterPage = lazy(() => import('./pages/reports/ReportsCenterPage'));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/services" element={<ServiceCategoriesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/tasker-verification" element={<TaskerVerificationPage />} />
            <Route path="/disputes" element={<DisputesPage />} />
            <Route path="/flagged-reviews" element={<FlaggedReviewsPage />} />
            <Route path="/revenue-report" element={<RevenueReportPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/reports" element={<ReportsCenterPage />} />
            <Route path="/reports/*" element={<ReportsCenterPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

export default App;
