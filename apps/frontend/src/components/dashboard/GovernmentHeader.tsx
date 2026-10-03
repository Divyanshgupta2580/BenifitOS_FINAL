import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '../../store/language.store';
import { useAuthStore } from '../../store/auth.store';
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  LogOutIcon,
  SearchIcon,
  SparklesIcon,
  GlobeIcon,
  SunIcon,
  MoonIcon,
} from '../ui/Icons';
import { useThemeStore } from '../../store/theme.store';

interface GovernmentHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onNavigateToProfile?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToSchemes?: () => void;
  onNavigateToAiCopilot?: () => void;
  unreadNotificationsCount?: number;
  profileCompletionPercentage?: number;
  citizenName?: string;
  onSearch?: (query: string) => void;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen = false,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToSchemes,
  onNavigateToAiCopilot,
  unreadNotificationsCount = 0,
  profileCompletionPercentage = 100,
  citizenName,
  onSearch,
}) => {
  const { user, logout } = useAuthStore();
  const { locale, setLocale } = useLanguageStore();
  const { resolvedTheme, setTheme } = useThemeStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (onNavigateToSchemes) {
      onNavigateToSchemes();
    }
  };

  const displayName = citizenName || (user?.email ? user.email.split('@')[0] : 'Divyansh Gupta');

  const toggleLanguage = () => {
    setLocale(locale === 'hi' ? 'en' : 'hi');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080C0A]/95 backdrop-blur-md border-b border-[#1C3127] transition-colors select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-[#111C16] border border-[#1C3127] hover:bg-[#16241D] transition-colors"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}
          <span className="text-sm font-bold text-white tracking-tight">BenefitOS</span>
        </div>

        {/* Center: Global Search Bar matching reference image */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <SearchIcon className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes, services, or ask a question..."
              className="w-full pl-10 pr-14 py-2 text-xs sm:text-sm bg-[#111C16] border border-[#1C3127] hover:border-[#264234] focus:border-mint-500/60 rounded-full text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-mint-500/50 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md bg-[#16241D] text-slate-400 border border-[#264234]">
                ⌘ K
              </span>
            </div>
          </form>
        </div>

        {/* Right Utility: Notifications & User Avatar Profile */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications Icon Button with Red Dot */}
          <button
            type="button"
            onClick={onNavigateToNotifications}
            aria-label={`Notifications. ${unreadNotificationsCount} unread`}
            className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-[#16241D] border border-transparent hover:border-[#1C3127] transition-all focus:outline-none"
          >
            <BellIcon className="w-5 h-5 text-slate-300" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
            )}
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-[#111C16] border border-transparent hover:border-[#1C3127] transition-all focus:outline-none"
            >
              <img
                src="/images/user_avatar_priya.jpg"
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-mint-500/40 shadow-sm"
                onError={(e) => {
                  // Fallback to stylized monogram if image is missing
                  (e.currentTarget as any).style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.avatar-monogram')?.classList.remove('hidden');
                }}
              />
              <div className="avatar-monogram hidden w-8 h-8 rounded-full bg-mint-700 text-white font-bold text-xs flex items-center justify-center border border-mint-500/40">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-white block leading-tight">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Citizen
                </span>
              </div>

              <ChevronDownIcon
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111C16] border border-[#1C3127] shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-3 border-b border-[#1C3127]">
                  <p className="text-xs font-bold text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'citizen@benefitos.gov.in'}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Profile Completeness</span>
                    <span className="font-bold text-mint-400">{profileCompletionPercentage}%</span>
                  </div>
                  <div className="w-full bg-[#1C3127] rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div
                      className="bg-mint-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${profileCompletionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="py-1">
                  {onNavigateToProfile && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateToProfile();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-200 hover:bg-[#16241D] hover:text-mint-300 flex items-center gap-2.5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-mint-400" />
                      <span>Citizen Profile</span>
                    </button>
                  )}

                  {onNavigateToAiCopilot && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateToAiCopilot();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-200 hover:bg-[#16241D] hover:text-mint-300 flex items-center gap-2.5 transition-colors"
                    >
                      <SparklesIcon className="w-4 h-4 text-mint-400" />
                      <span>AI Citizen Copilot</span>
                    </button>
                  )}

                  {/* Language Toggle in Dropdown */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      toggleLanguage();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-200 hover:bg-[#16241D] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <GlobeIcon className="w-4 h-4 text-slate-400" />
                      <span>Language</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#16241D] border border-[#264234] text-mint-400">
                      {locale === 'hi' ? 'हिंदी' : 'English'}
                    </span>
                  </button>

                  <div className="border-t border-[#1C3127] my-1" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

