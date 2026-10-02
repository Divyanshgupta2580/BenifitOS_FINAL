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
  const [isBrandHovered, setIsBrandHovered] = useState(false);

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

  const handleBrandClick = () => {
    if (window.innerWidth < 1024) {
      if (onNavigateToDashboard) onNavigateToDashboard();
      onClose();
      return;
    }
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

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

      {/* Sidebar Container: Clean solid dark surface, NO background image */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:z-30 bg-[#0A120E] border-r border-[#1C3127]/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 pt-3.5 pb-4 px-3 select-none text-slate-200`}
        aria-label="Portal main navigation"
        aria-expanded={!isCollapsed}
      >
        {/* Top Section: Brand Header as Collapse/Expand Trigger */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1C3127]/60">
            {!isCollapsed ? (
              <button
                type="button"
                onClick={handleBrandClick}
                onMouseEnter={() => setIsBrandHovered(true)}
                onMouseLeave={() => setIsBrandHovered(false)}
                aria-label="Collapse navigation"
                title="Click to collapse navigation (Alt+[)"
                className="w-full flex items-center justify-between p-1.5 -m-1.5 rounded-xl hover:bg-[#111C16] border border-transparent hover:border-[#1C3127] transition-all text-left group focus:outline-none focus:ring-1 focus:ring-mint-500/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mint Leaf Emblem */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-600 flex items-center justify-center text-forest-950 shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.72 4.28a1.5 1.5 0 0 0-1.5 0C13.2 6.04 10.4 8.7 8.5 12.1A17.9 17.9 0 0 0 6 20a1 1 0 0 0 1 1c7.28 0 13-5.72 13-13 0-1.3-.4-2.5-1.28-3.72ZM8.12 18.88c.6-2.5 1.76-4.8 3.38-6.76a16.8 16.8 0 0 1 4.5-3.62c.28 2.5-.4 5.2-1.9 7.38-1.5 2.18-3.7 3-5.98 3Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold text-white tracking-tight leading-none font-heading flex items-center gap-1">
                      <span>Benefit<span className="text-mint-400">OS</span></span>
                    </h1>
                    <p className="text-[10px] font-semibold text-emerald-400/80 tracking-wider uppercase mt-1 leading-tight">
                      National Welfare Gateway
                    </p>
                  </div>
                </div>

                {/* Subtle collapse indicator on hover */}
                <span className="hidden lg:block opacity-0 group-hover:opacity-100 text-slate-500 text-[10px] tracking-tight font-mono transition-opacity pr-1">
                  ⇤
                </span>
              </button>
            ) : (
              <div className="w-full relative flex justify-center">
                <button
                  type="button"
                  onClick={handleBrandClick}
                  onMouseEnter={() => setIsBrandHovered(true)}
                  onMouseLeave={() => setIsBrandHovered(false)}
                  aria-label="Expand navigation"
                  title="Click to expand navigation (Alt+[)"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-600 flex items-center justify-center text-forest-950 shadow-md hover:scale-105 hover:ring-2 hover:ring-mint-400/40 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-mint-500"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.72 4.28a1.5 1.5 0 0 0-1.5 0C13.2 6.04 10.4 8.7 8.5 12.1A17.9 17.9 0 0 0 6 20a1 1 0 0 0 1 1c7.28 0 13-5.72 13-13 0-1.3-.4-2.5-1.28-3.72ZM8.12 18.88c.6-2.5 1.76-4.8 3.38-6.76a16.8 16.8 0 0 1 4.5-3.62c.28 2.5-.4 5.2-1.9 7.38-1.5 2.18-3.7 3-5.98 3Z" />
                  </svg>
                </button>

                {/* Collapsed Brand Tooltip */}
                {isBrandHovered && (
                  <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#111C16] text-mint-300 text-xs font-semibold rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none border border-[#1C3127]">
                    Expand Navigation (Alt+[)
                  </div>
                )}
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

          {/* Primary Navigation Items List */}
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
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                    } rounded-xl font-medium text-xs sm:text-[13px] transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0B3B2B] text-white font-semibold border border-mint-500/40 shadow-xs'
                        : 'text-slate-300/90 hover:bg-[#111C16] hover:text-white border border-transparent'
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
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#111C16] text-white text-xs font-medium rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none border border-[#1C3127]">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Divider + Settings + Subtle Help */}
        <div className="pt-2 border-t border-[#1C3127]/60 space-y-1">
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
              aria-label="Settings"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
              } rounded-xl font-medium text-xs sm:text-[13px] transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#0B3B2B] text-white font-semibold border border-mint-500/40'
                  : 'text-slate-300/90 hover:bg-[#111C16] hover:text-white border border-transparent'
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
              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#111C16] text-white text-xs font-medium rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none border border-[#1C3127]">
                Settings
              </div>
            )}
          </div>

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
              aria-label="Help and Support"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'
              } text-xs font-medium text-slate-400 hover:text-white hover:bg-[#111C16] rounded-xl transition-colors`}
            >
              <HelpCircleIcon className="w-4 h-4 text-slate-400 group-hover:text-mint-300 shrink-0" />
              {!isCollapsed && <span className="truncate">Help &amp; Support</span>}
            </button>

            {isCollapsed && hoveredItem === 'help' && (
              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-[#111C16] text-white text-xs font-medium rounded-md shadow-xl z-50 whitespace-nowrap pointer-events-none border border-[#1C3127]">
                Help &amp; Support
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
