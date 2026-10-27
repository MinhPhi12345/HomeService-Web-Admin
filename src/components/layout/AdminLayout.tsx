import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AdminCountersProvider } from '../../context/AdminCountersContext';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminCountersProvider>
    <div className="admin-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="admin-body">
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
    </AdminCountersProvider>
  );
}
