import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { citizenApiService } from '../../services/citizen.service';
import { notificationApiService } from '../../services/notification.service';
import { GovernmentHeader } from '../dashboard/GovernmentHeader';
import { DashboardSidebar, DashboardNavTab } from '../dashboard/DashboardSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab?: DashboardNavTab;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('benefitos_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('benefitos_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isDesktop) {
      toggleSidebarCollapse();
      return;
    }
    setIsSidebarOpen((prev) => !prev);
  }, [isDesktop, toggleSidebarCollapse]);

  const isSidebarVisible = isDesktop ? !isSidebarCollapsed : isSidebarOpen;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setIsSidebarOpen(false);
      }
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Keyboard shortcut support: Alt+[ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '[') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  // Fetch Citizen profile and notifications for Header / Sidebar counters
  const { data: profileData } = useQuery({
    queryKey: ['citizen-profile', user?.id],
    queryFn: () => citizenApiService.getProfile(),
    enabled: !!user?.id,
  });

  const { data: notifsData } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationApiService.getNotifications(),
    enabled: !!user?.id,
  });

  const profile = profileData?.profile;
  const notifications = notifsData?.notifications || [];
  const unreadNotifsCount =
    notifications.filter((n) => !n.isRead).length ||
    (notifications.length > 0 ? notifications.length : 0);

  const completionPct = profile?.completionPercentage || 0;
  const citizenFullName =
    profile
      ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      : undefined;

  // Infer current active tab from pathname if not explicitly passed
  const currentTab: DashboardNavTab =
    activeTab ||
    (location.pathname.startsWith('/ai')
      ? 'copilot'
      : location.pathname.startsWith('/schemes') || location.pathname.startsWith('/recommendations')
      ? 'schemes'
      : location.pathname.startsWith('/applications')
      ? 'applications'
      : location.pathname.startsWith('/documents')
      ? 'vault'
      : location.pathname.startsWith('/government-services')
      ? 'government-services'
      : location.pathname.startsWith('/profile')
      ? 'profile'
      : 'dashboard');

  return (
    <div className="min-h-screen bg-[#080C0A] text-slate-100 flex flex-col font-sans transition-colors selection:bg-mint-500 selection:text-forest-950">
      {/* Top Government Portal Header */}
      <GovernmentHeader
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarVisible}
        onNavigateToProfile={() => navigate('/profile')}
        onNavigateToNotifications={() => navigate('/profile')}
        unreadNotificationsCount={unreadNotifsCount}
        profileCompletionPercentage={completionPct}
        citizenName={citizenFullName}
      />

      {/* Main Layout Area: Sidebar + Scrollable Content */}
      <div className="flex-1 flex w-full relative">
        {/* Vertical Portal Sidebar */}
        <DashboardSidebar
          activeTab={currentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          onNavigateToDashboard={() => navigate('/dashboard')}
          onNavigateToAiCopilot={() => navigate('/ai/copilot')}
          onNavigateToSchemes={() => navigate('/schemes')}
          onNavigateToApplications={() => navigate('/applications')}
          onNavigateToVault={() => navigate('/documents')}
          onNavigateToGovernmentServices={() => navigate('/government-services')}
          onNavigateToProfile={() => navigate('/profile')}
          onNavigateToNotifications={() => navigate('/profile')}
          onNavigateToHelp={() => navigate('/ai/copilot')}
          onNavigateToSettings={() => navigate('/profile')}
          unreadNotificationsCount={unreadNotifsCount}
        />

        {/* Scrollable Main Content Body */}
        <main
          className={`flex-1 min-w-0 ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          } flex flex-col transition-all duration-300`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
