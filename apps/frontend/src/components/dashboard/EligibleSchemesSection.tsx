import React from 'react';
import {
  LandmarkIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  AcademicCapIcon,
} from '../ui/Icons';
import { SchemeRecommendationItem } from '../../services/recommendation.service';

interface EligibleSchemesSectionProps {
  recommendations?: SchemeRecommendationItem[];
  onNavigateToSchemes: () => void;
  onSelectScheme: (schemeId: string) => void;
}

export const EligibleSchemesSection: React.FC<EligibleSchemesSectionProps> = ({
  recommendations = [],
  onNavigateToSchemes,
  onSelectScheme,
}) => {
  // Static Reference Fallback Items (PM-KISAN and Post Matric Scholarship)
  const defaultSchemes = [
    {
      id: 'pm-kisan',
      title: 'PM-KISAN',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      description: 'Income support to all landholding farmer families across India.',
      image: '/images/farmer_pm_kisan.jpg',
      categoryIcon: (
        <svg className="w-5 h-5 fill-current text-mint-400" viewBox="0 0 24 24">
          <path d="M17.72 4.28a1.5 1.5 0 0 0-1.5 0C13.2 6.04 10.4 8.7 8.5 12.1A17.9 17.9 0 0 0 6 20a1 1 0 0 0 1 1c7.28 0 13-5.72 13-13 0-1.3-.4-2.5-1.28-3.72ZM8.12 18.88c.6-2.5 1.76-4.8 3.38-6.76a16.8 16.8 0 0 1 4.5-3.62c.28 2.5-.4 5.2-1.9 7.38-1.5 2.18-3.7 3-5.98 3Z" />
        </svg>
      ),
      categoryBg: 'bg-emerald-950/90 border-emerald-500/40 text-mint-400',
      benefitText: 'Annual financial support',
      benefitSub: 'Benefit details available',
      docsText: 'Documents required',
      docsSub: 'Aadhaar, land records, bank details',
    },
    {
      id: 'post-matric-scholarship',
      title: 'Post Matric Scholarship',
      ministry: 'Ministry of Education',
      description: 'Financial assistance for eligible students from disadvantaged categories.',
      image: '/images/students_scholarship.jpg',
      categoryIcon: <AcademicCapIcon className="w-5 h-5 text-sky-400" />,
      categoryBg: 'bg-sky-950/90 border-sky-500/40 text-sky-400',
      benefitText: 'Financial assistance for education',
      benefitSub: 'Benefit details available',
      docsText: 'Documents required',
      docsSub: 'Aadhaar, caste certificate, income certificate',
    },
  ];

  // If we have dynamic API recommendations, map them into rich presentation format
  const displaySchemes =
    recommendations.length >= 2
      ? recommendations.slice(0, 2).map((rec, idx) => ({
          id: rec.schemeId || rec.id || defaultSchemes[idx].id,
          title: rec.title || rec.scheme?.title || defaultSchemes[idx].title,
          ministry: rec.department || rec.scheme?.department || defaultSchemes[idx].ministry,
          description:
            rec.scheme?.description ||
            (rec as any).description ||
            defaultSchemes[idx].description,
          image: defaultSchemes[idx].image,
          categoryIcon: defaultSchemes[idx].categoryIcon,
          categoryBg: defaultSchemes[idx].categoryBg,
          benefitText: rec.estimatedBenefit
            ? `₹${rec.estimatedBenefit.toLocaleString('en-IN')} / Year`
            : defaultSchemes[idx].benefitText,
          benefitSub: 'Direct bank transfer benefit',
          docsText: 'Documents required',
          docsSub: 'Aadhaar, income certificate, bank details',
        }))
      : defaultSchemes;

  return (
    <section className="space-y-4" aria-labelledby="eligible-schemes-heading">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="eligible-schemes-heading"
            className="text-base sm:text-lg font-bold text-white font-heading tracking-tight"
          >
            Schemes You Are Eligible For
          </h2>
          <p className="text-xs text-slate-400 leading-tight mt-0.5">
            These are government schemes you qualify for based on your profile.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToSchemes}
          className="inline-flex items-center gap-1 text-xs font-bold text-mint-400 hover:text-mint-300 transition-colors"
        >
          <span>View all</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards Grid (2 Columns on Tablet / Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {displaySchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="group rounded-2xl bg-[#0E1712] border border-[#1C3127]/80 overflow-hidden shadow-xl hover:border-mint-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Photo Header with Category Badge and Info */}
            <div className="relative h-44 sm:h-48 overflow-hidden">
              <img
                src={scheme.image}
                alt={scheme.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Dark Gradient Vignette for readable content blend */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1712] via-[#0E1712]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0E1712]/90 via-[#0E1712]/40 to-transparent" />

              {/* Overlay Content: Category Icon & Title info */}
              <div className="absolute top-4 left-4 z-10">
                <div
                  className={`w-10 h-10 rounded-xl ${scheme.categoryBg} border flex items-center justify-center shadow-md`}
                >
                  {scheme.categoryIcon}
                </div>
              </div>

              {/* Title & Ministry Placed on Image with strong contrast */}
              <div className="absolute bottom-3 left-4 right-4 z-10">
                <h3 className="text-lg font-black text-white font-heading leading-tight tracking-tight drop-shadow-md">
                  {scheme.title}
                </h3>
                <p className="text-[11px] font-medium text-emerald-300/90 leading-tight drop-shadow-sm mt-0.5">
                  {scheme.ministry}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-5 pt-1 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs text-slate-300/90 leading-relaxed">
                  {scheme.description}
                </p>

                {/* You are eligible Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-mint-300 text-xs font-semibold shadow-xs">
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-mint-400" />
                  <span>You are eligible</span>
                </div>

                {/* Key Benefits and Documents Required Details */}
                <div className="space-y-2.5 pt-2 border-t border-[#1C3127]/60">
                  {/* Benefit Row */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-forest-900/80 border border-[#1C3127] flex items-center justify-center text-mint-400 shrink-0 mt-0.5">
                      <LandmarkIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 leading-tight">
                        {scheme.benefitText}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {scheme.benefitSub}
                      </p>
                    </div>
                  </div>

                  {/* Documents Required Row */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-forest-900/80 border border-[#1C3127] flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                      <DocumentTextIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 leading-tight">
                        {scheme.docsText}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {scheme.docsSub}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* View Details CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSelectScheme(scheme.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>View Details</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
