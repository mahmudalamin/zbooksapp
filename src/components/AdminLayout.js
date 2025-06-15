// client/src/layout/AdminLayout.js
import React, { useState } from 'react';
import AdminSidebar from '../components/admin/Sidebar';  // Fixed import
import AdminHeader from '../components/admin/Header';    // Fixed import
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="admin-layout d-flex vh-100 bg-light">
      {/* Admin Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed}
        userRole={currentUser?.role}
      />
      
      {/* Main Content Wrapper */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Admin Header */}
        <AdminHeader 
          user={currentUser}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Main Content Area */}
        <main className="flex-grow-1 overflow-auto">
          <div className="container-fluid p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;