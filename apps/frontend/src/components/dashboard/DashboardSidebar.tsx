import React from 'react';
import { NICBranding } from './GovernmentEmblem';
import {
  HomeIcon,
  SparklesIcon,
  LandmarkIcon,
  ClipboardListIcon,
  FolderIcon,
  BuildingIcon,
  UserIcon,
  BellIcon,
  HelpCircleIcon,
  SettingsIcon,
  XIcon,
} from '../ui/Icons';

export type DashboardNavTab =
  | 'dashboard'
  | 'copilot'
  | 'schemes'
  | 'applications'
  | 'vault'
  | 'government-services'
  | 'profile'
  | 'notifications'
  | 'help'
  | 'settings';

interface DashboardSidebarProps {
  activeTab?: DashboardNavTab;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToAiCopilot: () => void;
  onNavigateToSchemes: () => void;
  onNavigateToApplications: () => void;
  onNavigateToVault: () => void;
  onNavigateToGovernmentServices: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab = 'dashboard',
  isOpen,
  onClose,
  onNavigateToDashboard,
  onNavigateToAiCopilot,
  onNavigateToSchemes,
  onNavigateToApplications,
  onNavigateToVault,
  onNavigateToGovernmentServices,
  onNavigateToProfile,
  onNavigateToNotifications,
  unreadNotificationsCount = 0,
}) => {
  const primaryNavItems = [
    {
      id: 'dashboard' as DashboardNavTab,
      label: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      onClick: onNavigateToDashboard || (() => {}),
    },
    {
      id: 'copilot' as DashboardNavTab,
      label: 'AI Copilot',
      icon: <SparklesIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      badge: 'NEW',
      onClick: onNavigateToAiCopilot,
    },
    {
      id: 'schemes' as DashboardNavTab,
      label: 'Schemes',
      icon: <LandmarkIcon className="w-5 h-5" />,
      onClick: onNavigateToSchemes,
    },
    {
      id: 'applications' as DashboardNavTab,
      label: 'Applications',
      icon: <ClipboardListIcon className="w-5 h-5" />,
      onClick: onNavigateToApplications,
    },
    {
      id: 'vault' as DashboardNavTab,
      label: 'Document Vault',
      icon: <FolderIcon className="w-5 h-5" />,
      onClick: onNavigateToVault,
    },
    {
      id: 'government-services' as DashboardNavTab,
      label: 'Government Services',
      icon: <BuildingIcon className="w-5 h-5" />,
      onClick: onNavigateToGovernmentServices,
    },
    {
      id: 'profile' as DashboardNavTab,
      label: 'Profile',
      icon: <UserIcon className="w-5 h-5" />,
      onClick: onNavigateToProfile,
    },
  ];

  const secondaryNavItems = [
    {
      id: 'notifications' as DashboardNavTab,
      label: 'Notifications',
      icon: <BellIcon className="w-5 h-5" />,
      badgeCount: unreadNotificationsCount,
      onClick: onNavigateToNotifications || (() => {}),
    },
    {
      id: 'help' as DashboardNavTab,
      label: 'Help & Support',
      icon: <HelpCircleIcon className="w-5 h-5" />,
      onClick: () => {
        // Can route to Help or open support
      },
    },
    {
      id: 'settings' as DashboardNavTab,
      label: 'Settings',
      icon: <SettingsIcon className="w-5 h-5" />,
      onClick: onNavigateToProfile,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-20 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } pt-16 lg:pt-20 pb-4 px-3 select-none`}
        aria-label="Sidebar navigation"
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between px-2 pb-2 lg:hidden border-b border-slate-100 dark:border-slate-800 mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Portal Navigation
          </span>
          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Primary Navigation Group */}
          <nav className="space-y-1" aria-label="Primary Navigation">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    if (window.innerWidth < 1024) onClose();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-blue-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-900 dark:hover:text-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600'
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md bg-blue-500/20 dark:bg-blue-400/20 text-blue-800 dark:text-blue-300 border border-blue-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <hr className="border-slate-200 dark:border-slate-800 my-4" />

          {/* Secondary Navigation Group */}
          <nav className="space-y-1" aria-label="Secondary Navigation">
            {secondaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick();
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-blue-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-blue-900 dark:hover:text-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-600 text-white shadow-xs">
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: NIC / National Informatics Centre Official Branding */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-2 px-1">
          <NICBranding version="2.1.0" />
        </div>
      </aside>
    </>
  );
};
