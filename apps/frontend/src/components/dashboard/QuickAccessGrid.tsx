import React from 'react';
import {
  UserIcon,
  DocumentTextIcon,
  ClipboardListIcon,
  FolderIcon,
  ArrowRightIcon,
} from '../ui/Icons';

interface QuickAccessGridProps {
  onNavigateToProfile: () => void;
  onNavigateToSchemes: () => void;
  onNavigateToApplications: () => void;
  onNavigateToVault: () => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  onNavigateToProfile,
  onNavigateToSchemes,
  onNavigateToApplications,
  onNavigateToVault,
}) => {
  const cards = [
    {
      id: 'profile',
      title: 'My Profile',
      description: 'Keep your information up to date for better scheme recommendations.',
      icon: <UserIcon className="w-5 h-5 text-mint-400" />,
      iconBoxBg: 'bg-emerald-950/90 border border-emerald-500/30 text-mint-400',
      arrowBg: 'hover:bg-emerald-900/60',
      onClick: onNavigateToProfile,
    },
    {
      id: 'schemes',
      title: 'Eligible Schemes',
      description: 'View government schemes you qualify for.',
      icon: <DocumentTextIcon className="w-5 h-5 text-sky-400" />,
      iconBoxBg: 'bg-sky-950/90 border border-sky-500/30 text-sky-400',
      arrowBg: 'hover:bg-sky-900/60',
      onClick: onNavigateToSchemes,
    },
    {
      id: 'applications',
      title: 'My Applications',
      description: 'Track and manage your scheme applications.',
      icon: <ClipboardListIcon className="w-5 h-5 text-purple-400" />,
      iconBoxBg: 'bg-purple-950/90 border border-purple-500/30 text-purple-400',
      arrowBg: 'hover:bg-purple-900/60',
      onClick: onNavigateToApplications,
    },
    {
      id: 'vault',
      title: 'My Documents',
      description: 'Store and manage your important documents securely.',
      icon: <FolderIcon className="w-5 h-5 text-amber-400" />,
      iconBoxBg: 'bg-amber-950/90 border border-amber-500/30 text-amber-400',
      arrowBg: 'hover:bg-amber-900/60',
      onClick: onNavigateToVault,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={card.onClick}
          className="group text-left p-4 rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 hover:bg-[#121E18] transition-all duration-200 flex items-center justify-between gap-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
        >
          {/* Left Icon + Text */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Colored Icon Tile */}
            <div
              className={`w-11 h-11 rounded-xl ${card.iconBoxBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs`}
            >
              {card.icon}
            </div>

            {/* Title & Description */}
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-mint-300 transition-colors font-heading leading-tight truncate">
                {card.title}
              </h3>
              <p className="text-[11px] text-slate-400/90 line-clamp-2 leading-tight mt-0.5">
                {card.description}
              </p>
            </div>
          </div>

          {/* Right Arrow Action Circle */}
          <div className="w-7 h-7 rounded-full bg-forest-900/80 border border-[#1C3127] flex items-center justify-center text-slate-400 group-hover:text-mint-300 group-hover:border-mint-500/40 group-hover:translate-x-0.5 transition-all shrink-0">
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </div>
        </button>
      ))}
    </div>
  );
};
