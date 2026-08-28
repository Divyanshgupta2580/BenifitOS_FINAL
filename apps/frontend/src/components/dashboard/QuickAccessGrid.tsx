import React from 'react';
import {
  BuildingIcon,
  FolderIcon,
  LandmarkIcon,
  ClipboardListIcon,
  ChevronRightIcon,
} from '../ui/Icons';

interface QuickAccessGridProps {
  onNavigateToGovernmentServices: () => void;
  onNavigateToVault: () => void;
  onNavigateToSchemes: () => void;
  onNavigateToApplications: () => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onNavigateToGovernmentServices,
  onNavigateToVault,
  onNavigateToSchemes,
  onNavigateToApplications,
}) => {
  const cards = [
    {
      id: 'govt-hub',
      title: 'Govt Hub',
      subtitle: 'Central & State Government Links',
      icon: <BuildingIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      onClick: onNavigateToGovernmentServices,
    },
    {
      id: 'doc-vault',
      title: 'Doc Vault',
      subtitle: 'Secure Document Storage',
      icon: <FolderIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      onClick: onNavigateToVault,
    },
    {
      id: 'all-schemes',
      title: 'All Schemes',
      subtitle: 'Browse All Welfare Schemes',
      icon: <LandmarkIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      onClick: onNavigateToSchemes,
    },
    {
      id: 'applications',
      title: 'Applications',
      subtitle: 'Track & Manage Applications',
      icon: <ClipboardListIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      onClick: onNavigateToApplications,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={card.onClick}
          className="group w-full text-left p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/70 transition-all flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon Container */}
            <div
              className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
            >
              {card.icon}
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {card.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {card.subtitle}
              </p>
            </div>
          </div>

          <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      ))}
    </div>
  );
};
