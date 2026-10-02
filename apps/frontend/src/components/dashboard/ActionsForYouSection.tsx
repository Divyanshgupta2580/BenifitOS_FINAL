import React from 'react';
import {
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  SearchIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '../ui/Icons';

interface ActionsForYouSectionProps {
  onCompleteProfile: () => void;
  onUploadDocuments: () => void;
  onCheckApplications: () => void;
  onExploreSchemes: () => void;
  profileCompletionPercentage?: number;
  pendingDocumentsCount?: number;
}

export const ActionsForYouSection: React.FC<ActionsForYouSectionProps> = ({
  onCompleteProfile,
  onUploadDocuments,
  onCheckApplications,
  onExploreSchemes,
  profileCompletionPercentage = 75,
  pendingDocumentsCount = 1,
}) => {
  const actions = [
    {
      id: 'profile',
      title: 'Complete missing profile details',
      subtitle:
        profileCompletionPercentage < 100
          ? `Add your income & land information (${profileCompletionPercentage}% completed)`
          : 'Profile information is up to date',
      icon: <UserIcon className="w-5 h-5 text-sky-400" />,
      iconBg: 'bg-sky-950/80 border border-sky-500/30 text-sky-400',
      onClick: onCompleteProfile,
    },
    {
      id: 'documents',
      title: 'Upload pending documents',
      subtitle:
        pendingDocumentsCount > 0
          ? `${pendingDocumentsCount} scheme requires additional verification documents`
          : 'All core documents uploaded',
      icon: <DocumentTextIcon className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-950/80 border border-amber-500/30 text-amber-400',
      onClick: onUploadDocuments,
    },
    {
      id: 'applications',
      title: 'Check application status',
      subtitle: 'You have active welfare applications in verification progress',
      icon: <ClockIcon className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-950/80 border border-purple-500/30 text-purple-400',
      onClick: onCheckApplications,
    },
    {
      id: 'schemes',
      title: 'Explore new schemes',
      subtitle: 'Discover more national & state government benefits',
      icon: <SearchIcon className="w-5 h-5 text-mint-400" />,
      iconBg: 'bg-emerald-950/80 border border-emerald-500/30 text-mint-400',
      onClick: onExploreSchemes,
    },
  ];

  return (
    <section className="space-y-4" aria-labelledby="actions-for-you-heading">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="actions-for-you-heading"
            className="text-base sm:text-lg font-bold text-white font-heading tracking-tight"
          >
            Actions for You
          </h2>
          <p className="text-xs text-slate-400 leading-tight mt-0.5">
            Key steps to maximize your welfare benefits and complete verifications.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreSchemes}
          className="inline-flex items-center gap-1 text-xs font-bold text-mint-400 hover:text-mint-300 transition-colors"
        >
          <span>View all</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="group w-full text-left p-4 rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 hover:bg-[#121E18] transition-all duration-200 flex items-center justify-between gap-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Colored Icon Tile */}
              <div
                className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                {action.icon}
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-mint-300 transition-colors font-heading leading-tight truncate">
                  {action.title}
                </h3>
                <p className="text-[11px] text-slate-400/90 leading-tight truncate mt-0.5">
                  {action.subtitle}
                </p>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:text-mint-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
};
