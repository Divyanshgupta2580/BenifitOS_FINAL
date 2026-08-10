import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSchemes } from '../../hooks/useSchemes';

const CATEGORIES = [
  { id: 'ALL', label: 'All Schemes' },
  { id: 'AGRICULTURE', label: '🌾 Agriculture' },
  { id: 'HOUSING', label: '🏠 Housing' },
  { id: 'HEALTHCARE', label: '🏥 Healthcare' },
  { id: 'EDUCATION', label: '🎓 Education' },
  { id: 'FINANCIAL_INCLUSION', label: '💳 Financial' },
  { id: 'WOMEN_CHILD_DEVELOPMENT', label: '👩 Women & Child' },
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-xs font-semibold text-blue-900 hover:underline">
                ← Back
              </button>
            )}
            <h1 className="text-lg font-bold text-blue-900">Welfare Scheme Catalog</h1>
          </div>
          <span className="text-xs font-medium text-slate-500">{schemes.length} Schemes Available</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
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
                      ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-sm text-rose-600 font-semibold mb-4">Unable to load scheme catalog from server.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
            >
              Retry Connection
            </button>
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 italic text-sm">
            No welfare schemes found matching your search or category filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((scheme) => (
              <Card
                key={scheme.id}
                onClick={() => onSelectScheme(scheme.id)}
                className="cursor-pointer hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-700 font-mono">{scheme.code}</span>
                    <Badge label={scheme.category} variant="primary" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{scheme.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{scheme.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium truncate max-w-[180px]">{scheme.department}</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
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
