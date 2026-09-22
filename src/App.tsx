import { Route, Routes } from "react-router-dom";
import SideNav from "./components/SideNav";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ServiceCategoriesPage from "./pages/ServiceCategoriesPage";
import UsersPage from "./pages/UsersPage";
import TaskerVerificationPage from "./pages/TaskerVerificationPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <div style={{ display: "flex" }}>
              <SideNav />
              <main style={{ flex: 1, padding: 16 }}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/services" element={<ServiceCategoriesPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/tasker-verification" element={<TaskerVerificationPage />} />
                </Routes>
              </main>
            </div>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
