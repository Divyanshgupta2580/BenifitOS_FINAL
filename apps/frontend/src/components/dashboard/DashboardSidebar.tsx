import React, { useState } from 'react';
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
  ChevronLeftIcon,
  ChevronRightIcon,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToAiCopilot: () => void;
  onNavigateToSchemes: () => void;
  onNavigateToApplications: () => void;
  onNavigateToVault: () => void;
  onNavigateToGovernmentServices: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToSettings?: () => void;
  unreadNotificationsCount?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab = 'dashboard',
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  onNavigateToDashboard,
  onNavigateToAiCopilot,
  onNavigateToSchemes,
  onNavigateToApplications,
  onNavigateToVault,
  onNavigateToGovernmentServices,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToHelp,
  onNavigateToSettings,
  unreadNotificationsCount = 0,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
      icon: <SparklesIcon className="w-5 h-5 text-mint-400" />,
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
    {
      id: 'notifications' as DashboardNavTab,
      label: 'Notifications',
      icon: <BellIcon className="w-5 h-5" />,
      badgeCount: unreadNotificationsCount,
      onClick: onNavigateToNotifications || onNavigateToProfile,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-30 bg-[#0A120E] bg-botanical-sidebar border-r border-[#1C3127]/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 pt-4 pb-4 px-3 select-none text-slate-200`}
        aria-label="Portal main navigation"
        aria-expanded={!isCollapsed}
      >
        {/* Top Logo and Branding Header */}
        <div className="flex items-center justify-between px-2 pb-4 pt-1 mb-2 border-b border-[#1C3127]/60">
          {!isCollapsed ? (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={onNavigateToDashboard}
            >
              {/* Mint Leaf Emblem */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-600 flex items-center justify-center text-forest-950 shadow-lg shadow-mint-500/20 group-hover:scale-105 transition-transform shrink-0">
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.72 4.28a1.5 1.5 0 0 0-1.5 0C13.2 6.04 10.4 8.7 8.5 12.1A17.9 17.9 0 0 0 6 20a1 1 0 0 0 1 1c7.28 0 13-5.72 13-13 0-1.3-.4-2.5-1.28-3.72ZM8.12 18.88c.6-2.5 1.76-4.8 3.38-6.76a16.8 16.8 0 0 1 4.5-3.62c.28 2.5-.4 5.2-1.9 7.38-1.5 2.18-3.7 3-5.98 3Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-white tracking-tight leading-none font-heading">
                  Benefit<span className="text-mint-400">OS</span>
                </h1>
                <p className="text-[10px] font-medium text-emerald-400/80 tracking-wider uppercase mt-1 leading-tight">
                  National Welfare Gateway
                </p>
              </div>
            </div>
          ) : (
            <div
              className="w-full flex justify-center cursor-pointer"
              onClick={onNavigateToDashboard}
              title="BenefitOS - National Welfare Gateway"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-600 flex items-center justify-center text-forest-950 shadow-md shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.72 4.28a1.5 1.5 0 0 0-1.5 0C13.2 6.04 10.4 8.7 8.5 12.1A17.9 17.9 0 0 0 6 20a1 1 0 0 0 1 1c7.28 0 13-5.72 13-13 0-1.3-.4-2.5-1.28-3.72ZM8.12 18.88c.6-2.5 1.76-4.8 3.38-6.76a16.8 16.8 0 0 1 4.5-3.62c.28 2.5-.4 5.2-1.9 7.38-1.5 2.18-3.7 3-5.98 3Z" />
                </svg>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-forest-800 lg:hidden"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar mt-1">
          <nav className="space-y-1" aria-label="Primary Navigation">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      item.onClick();
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onMouseEnter={() => isCollapsed && setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl font-medium text-xs sm:text-[13px] transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0B3B2B] text-white font-semibold border border-mint-500/40 shadow-sm shadow-mint-900/30'
                        : 'text-slate-300/90 hover:bg-forest-850 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={
                          isActive
                            ? 'text-mint-400'
                            : 'text-slate-400 group-hover:text-mint-300 transition-colors'
                        }
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs">
                        {item.badgeCount}
                      </span>
                    )}
                  </button>

                  {/* Tooltip for collapsed view */}
                  {isCollapsed && hoveredItem === item.id && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-forest-900 text-white text-xs font-medium rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none border border-forest-700">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="py-2">
            <hr className="border-[#1C3127]/60" />
          </div>

          {/* Settings Nav Item */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToSettings) onNavigateToSettings();
                else onNavigateToProfile();
                if (window.innerWidth < 1024) onClose();
              }}
              onMouseEnter={() => isCollapsed && setHoveredItem('settings')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'
              } rounded-xl font-medium text-xs sm:text-[13px] transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#0B3B2B] text-white font-semibold border border-mint-500/40'
                  : 'text-slate-300/90 hover:bg-forest-850 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-slate-400 group-hover:text-mint-300">
                  <SettingsIcon className="w-5 h-5" />
                </span>
                {!isCollapsed && <span className="truncate">Settings</span>}
              </div>
            </button>

            {isCollapsed && hoveredItem === 'settings' && (
              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-forest-900 text-white text-xs font-medium rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none border border-forest-700">
                Settings
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Trust Info + Help & Support + Collapse Toggle */}
        <div className="pt-3 border-t border-[#1C3127]/60 space-y-3">
          {!isCollapsed && (
            <div className="p-3 rounded-xl bg-forest-900/70 border border-forest-800/80 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <BuildingIcon className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-slate-300/90 leading-snug">
                A simple way to access government benefits, trusted by citizens across India.
              </p>
            </div>
          )}

          {/* Help & Support Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToHelp) onNavigateToHelp();
                else onNavigateToAiCopilot();
                if (window.innerWidth < 1024) onClose();
              }}
              onMouseEnter={() => isCollapsed && setHoveredItem('help')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'
              } text-xs font-medium text-slate-400 hover:text-white hover:bg-forest-850 rounded-lg transition-colors`}
            >
              <HelpCircleIcon className="w-4 h-4 text-slate-400 group-hover:text-mint-300" />
              {!isCollapsed && <span>Help &amp; Support</span>}
            </button>

            {isCollapsed && hoveredItem === 'help' && (
              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-forest-900 text-white text-xs font-medium rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none border border-forest-700">
                Help &amp; Support
              </div>
            )}
          </div>

          {/* Collapse toggle button on desktop */}
          {onToggleCollapse && (
            <div className="hidden lg:flex items-center justify-between pt-1 border-t border-[#1C3127]/40 px-1">
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 py-1"
                  aria-label="Collapse sidebar"
                >
                  <span>Collapse Navigation</span>
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-full flex justify-center text-slate-400 hover:text-slate-200 py-1"
                  aria-label="Expand sidebar"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

