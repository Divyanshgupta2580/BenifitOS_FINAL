import React from 'react';
import { DocumentTextIcon, ClipboardListIcon, ArrowRightIcon } from '../ui/Icons';

interface DashboardStatsCardsProps {
  documentsCount: number;
  applicationsCount: number;
  onNavigateToVault: () => void;
  onNavigateToApplications: () => void;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  documentsCount,
  applicationsCount,
  onNavigateToVault,
  onNavigateToApplications,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1: Document Vault */}
      <div
        onClick={onNavigateToVault}
        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/80 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
            <DocumentTextIcon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Document Vault
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-black text-blue-950 dark:text-blue-300 tracking-tight">
                {documentsCount}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Uploaded Documents
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Uploaded &amp; OCR Verified Files
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
            <span>View All</span>
            <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {/* Card 2: Applications */}
      <div
        onClick={onNavigateToApplications}
        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardListIcon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Applications
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-300 tracking-tight">
                {applicationsCount}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Submitted Applications
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Track Your Welfare Benefits
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
            <span>View All</span>
            <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
};
