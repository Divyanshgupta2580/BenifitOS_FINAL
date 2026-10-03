import React, { useState } from 'react';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSchemes } from '../../hooks/useSchemes';
import { AppLayout } from '../../components/layout/AppLayout';
import { SearchIcon, ArrowRightIcon, LandmarkIcon, BuildingIcon } from '../../components/ui/Icons';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

const CATEGORIES = [
  { id: 'ALL', label: 'All Schemes' },
  { id: 'AGRICULTURE', label: 'Agriculture' },
  { id: 'HOUSING', label: 'Housing' },
  { id: 'HEALTHCARE', label: 'Healthcare' },
  { id: 'EDUCATION', label: 'Education' },
  { id: 'FINANCIAL_INCLUSION', label: 'Financial Inclusion' },
  { id: 'WOMEN_CHILD_DEVELOPMENT', label: 'Women & Child' },
];

interface Props {
  onSelectScheme: (schemeId: string) => void;
  onBack?: () => void;
}

export const SchemeCatalogScreen: React.FC<Props> = ({ onSelectScheme, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
  const { schemes, isLoading, isError, refetch } = useSchemes({
    category: categoryFilter,
    search: search || undefined,
  });

  return (
    <AppLayout activeTab="schemes">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C3127]/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-xs font-semibold text-mint-400 hover:underline mr-2"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                Welfare Scheme Catalog
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Browse, filter, and discover eligible national &amp; state social welfare benefits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-forest-900 border border-[#1C3127] text-mint-300">
              {schemes.length} Schemes Available
            </span>
          </div>
        </div>

        {/* Search & Category Filter Section */}
        <div className="rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 p-5 shadow-lg space-y-4">
          {/* Search Bar Input */}
          <div className="relative">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by scheme name, department, category or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#080C0A] border border-[#1C3127] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-mint-500 focus:ring-1 focus:ring-mint-500 transition-all"
            />
          </div>

          {/* Category Chips Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#0B3B2B] border-mint-500/50 text-mint-300 shadow-xs'
                      : 'bg-forest-950/60 border-[#1C3127] text-slate-400 hover:text-white hover:border-forest-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schemes Listing Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={160} className="rounded-2xl" />
            <Skeleton height={160} className="rounded-2xl" />
            <Skeleton height={160} className="rounded-2xl" />
            <Skeleton height={160} className="rounded-2xl" />
          </div>
        ) : isError ? (
          <ErrorState
            title="Scheme Catalog Unavailable"
            message="We could not retrieve the welfare scheme catalog from the server. Please check your connection and retry."
            onRetry={() => refetch()}
            retryLabel="Retry Connection"
          />
        ) : schemes.length === 0 ? (
          <EmptyState
            icon={<LandmarkIcon className="w-6 h-6 text-mint-400" />}
            title="No Welfare Schemes Found"
            description="No schemes match your selected category or search keywords. Try selecting another category or clearing your search filter."
            actionLabel={search || selectedCategory !== 'ALL' ? 'Clear Filters' : undefined}
            onAction={() => {
              setSearch('');
              setSelectedCategory('ALL');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => onSelectScheme(scheme.id)}
                className="group rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 hover:border-mint-500/40 p-5 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Code + Category Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-400 font-mono tracking-wider">
                      {scheme.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/30 text-mint-300">
                      {scheme.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-mint-300 transition-colors font-heading leading-snug">
                      {scheme.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {scheme.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-4 mt-4 border-t border-[#1C3127]/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[180px]">
                    <BuildingIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate text-[11px]">{scheme.department}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-mint-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px]">
                      ₹{scheme.financialBenefit.toLocaleString('en-IN')} / Yr
                    </span>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-mint-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
