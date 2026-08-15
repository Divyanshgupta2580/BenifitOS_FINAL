import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useSchemes } from '../../hooks/useSchemes';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-12 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-xs font-semibold text-blue-900 dark:text-blue-400 hover:underline">
                ← Back
              </button>
            )}
            <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400">Welfare Scheme Catalog</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">{schemes.length} Schemes Available</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <Input
            placeholder="Search by scheme name or code (e.g. PM-KISAN, PMAY)"
            value={search}
            onChangeText={setSearch}
            className="mb-0"
          />

          {/* Category Chips Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isSelected
                      ? 'bg-blue-900 dark:bg-blue-700 border-blue-900 dark:border-blue-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scheme List Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height={140} className="rounded-xl" />
            <Skeleton height={140} className="rounded-xl" />
            <Skeleton height={140} className="rounded-xl" />
            <Skeleton height={140} className="rounded-xl" />
          </div>
        ) : isError ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold mb-4">Unable to load scheme catalog from server.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-900 dark:bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              Retry Connection
            </button>
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 italic text-sm">
            No welfare schemes found matching your search or category filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((scheme) => (
              <Card
                key={scheme.id}
                onClick={() => onSelectScheme(scheme.id)}
                className="cursor-pointer hover:border-blue-700 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">{scheme.code}</span>
                    <Badge label={scheme.category} variant="primary" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{scheme.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">{scheme.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium truncate max-w-[180px]">{scheme.department}</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    ₹{scheme.financialBenefit.toLocaleString('en-IN')} / Yr
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
