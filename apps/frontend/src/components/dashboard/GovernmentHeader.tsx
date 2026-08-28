import React, { useState, useRef, useEffect } from 'react';
import { StateEmblemOfIndia } from './GovernmentEmblem';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useLanguageStore } from '../../store/language.store';
import { useAuthStore } from '../../store/auth.store';
import {
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  LogOutIcon,
  CheckCircleIcon,
} from '../ui/Icons';

interface GovernmentHeaderProps {
  onToggleSidebar: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotifications?: () => void;
  unreadNotificationsCount?: number;
  profileCompletionPercentage?: number;
  citizenName?: string;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({
  onToggleSidebar,
  onNavigateToProfile,
  onNavigateToNotifications,
  unreadNotificationsCount = 0,
  profileCompletionPercentage = 0,
  citizenName,
}) => {
  const { user, logout } = useAuthStore();
  const { locale, setLocale } = useLanguageStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'md' | 'lg'>('md');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  // Accessibility Font Scaler
  const handleFontSizeChange = (level: 'sm' | 'md' | 'lg') => {
    setFontSizeLevel(level);
    if (typeof document !== 'undefined') {
      if (level === 'sm') {
        document.documentElement.style.fontSize = '14.5px';
      } else if (level === 'lg') {
        document.documentElement.style.fontSize = '17.5px';
      } else {
        document.documentElement.style.fontSize = '16px';
      }
    }
  };

  const displayName =
    citizenName ||
    (user?.email ? user.email.split('@')[0] : 'Citizen');
  const initial = displayName.charAt(0).toUpperCase();

  const toggleLanguage = () => {
    const newLocale = locale === 'hi' ? 'en' : 'hi';
    setLocale(newLocale);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="w-full px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Emblem + National Welfare Gateway Brand + Hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* National Emblem */}
          <div className="text-slate-800 dark:text-slate-200 shrink-0">
            <StateEmblemOfIndia className="w-8 h-10 sm:w-9 sm:h-11 text-slate-800 dark:text-slate-100 drop-shadow-xs" />
          </div>

          {/* Title & Slogan */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                National Welfare Gateway
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-blue-950 dark:text-blue-200 leading-tight tracking-tight truncate">
              BenefitOS Web
            </h1>
            <p className="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-400 leading-tight hidden xs:block truncate">
              सशक्त नागरिक, समृद्ध भारत
            </p>
          </div>
        </div>

        {/* Right: Accessibility + Language + Theme + Notifications + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Accessibility Font Size Switcher (A- / A / A+) */}
          <div
            role="group"
            aria-label="Accessibility text size controls"
            className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => handleFontSizeChange('sm')}
              aria-label="Decrease text size"
              aria-pressed={fontSizeLevel === 'sm'}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                fontSizeLevel === 'sm'
                  ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange('md')}
              aria-label="Reset text size to standard"
              aria-pressed={fontSizeLevel === 'md'}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                fontSizeLevel === 'md'
                  ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange('lg')}
              aria-label="Increase text size"
              aria-pressed={fontSizeLevel === 'lg'}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                fontSizeLevel === 'lg'
                  ? 'bg-white dark:bg-slate-700 text-blue-900 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              A+
            </button>
          </div>

          {/* Language Toggle (हिंदी / EN) */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={`Switch language. Current: ${locale === 'hi' ? 'Hindi' : 'English'}`}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {locale === 'hi' ? 'English' : 'हिंदी'}
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggle className="!min-h-[34px] !min-w-[34px] !px-2 !py-1 !rounded-lg text-xs" />

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onNavigateToNotifications}
            aria-label={`Notifications. ${unreadNotificationsCount} unread`}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <BellIcon className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Citizen Profile Pill & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {/* User Avatar Circle */}
              <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initial}
              </div>

              {/* Name & Citizen Role Tag */}
              <div className="text-left hidden sm:block max-w-[120px] truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block leading-tight truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-none">
                  Citizen
                </span>
              </div>

              <ChevronDownIcon
                className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || 'citizen@benefitos.gov.in'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                    <span>Profile Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {profileCompletionPercentage}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(5, profileCompletionPercentage))}%` }}
                    />
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateToProfile();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Citizen Profile Details</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
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
