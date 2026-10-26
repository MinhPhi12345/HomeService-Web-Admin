import { Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import AdminLayout from './components/layout/AdminLayout';
import { ToastProvider } from './components/common/Toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ServiceCategoriesPage from './pages/ServiceCategoriesPage';
import UsersPage from './pages/UsersPage';
import TaskerVerificationPage from './pages/TaskerVerificationPage';
import DisputesPage from './pages/DisputesPage';
import FlaggedReviewsPage from './pages/FlaggedReviewsPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <ToastProvider>
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
          <Route
            path="/tasker-verification"
            element={<TaskerVerificationPage />}
          />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/flagged-reviews" element={<FlaggedReviewsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
