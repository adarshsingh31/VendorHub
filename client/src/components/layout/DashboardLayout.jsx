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
    <div className="min-h-screen bg-background text-text flex flex-col md:flex-row relative">
      <Sidebar 
        role={role} 
        userName={userName} 
        userInitial={userInitial} 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6 shadow-soft shrink-0">
          <div className="flex items-center gap-3">
            {/* Toggle Button for Desktop */}
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-1.5 text-text-muted hover:text-primary hover:bg-surface-sunken rounded-lg transition-colors"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isSidebarCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>
            
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden p-1.5 text-text hover:bg-surface-sunken rounded-lg"
              title="Open navigation menu"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            
            <div className="font-display font-bold text-lg text-text">
              Vendor<span className="text-primary">Hub</span>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted capitalize hidden sm:inline-block">
              {role} portal
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-hover flex items-center justify-center font-bold text-sm" title={userName}>
              {userInitial}
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-ink/50 z-30 md:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
}
