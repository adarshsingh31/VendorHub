import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { role, user } = useAuth();
  const userName = user?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="min-h-screen bg-background text-text flex">
      <Sidebar 
        role={role} 
        userName={userName} 
        userInitial={userInitial} 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      <div 
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'
        }`}
      >
        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-20">
          <div className="font-display font-bold text-lg text-text">Vendor<span className="text-primary">Hub</span></div>
          <button onClick={toggleMobileMenu} className="p-2 text-text hover:bg-background rounded-md">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-ink/50 z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
}
