import React, { useEffect, useState } from 'react';
import { aiApiService } from '../../services/ai.service';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  schemeTitle: string;
  schemeId?: string;
  defaultApplyUrl?: string;
}

export const SchemeInstructionsSection: React.FC<Props> = ({ schemeTitle, schemeId, defaultApplyUrl }) => {
  const [instructions, setInstructions] = useState<string>('');
  const [applicationUrl, setApplicationUrl] = useState<string>(defaultApplyUrl || 'https://www.india.gov.in/my-government/schemes');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    aiApiService
      .getSchemeInstructions({ schemeTitle, schemeId })
      .then((res) => {
        if (isMounted) {
          setInstructions(res.instructions);
          if (res.applicationUrl) setApplicationUrl(res.applicationUrl);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [schemeTitle, schemeId]);

  return (
    <div className="space-y-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      {/* AI Generated Instructions Card */}
      <Card className="border-blue-200 dark:border-blue-800/80 bg-blue-50/30 dark:bg-blue-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-extrabold text-blue-900 dark:text-blue-400">
              AI Step-by-Step Application Instructions
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
            Dedicated Guidance Engine (Key #2)
          </span>
        </div>

        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner message="Generating start-to-finish application instructions for this scheme..." />
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <p className="font-bold mb-1">Standard Portal Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-700 dark:text-slate-300">
              <li>Prepare your Aadhaar Card, Income Certificate, and Domicile proof.</li>
              <li>Click the official application button below to access the government portal.</li>
              <li>Register as a new user with your mobile number.</li>
              <li>Fill in personal details and upload required scanned certificates.</li>
              <li>Submit the form and save the Application Reference Number for status tracking.</li>
            </ol>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-3 whitespace-pre-wrap">
            {instructions}
          </div>
        )}
      </Card>

      {/* Official Government Portal Apply Redirect Button */}
      <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl border border-emerald-700 shadow-lg text-center space-y-3">
        <div>
          <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-wider">Ready to Submit Your Application?</h3>
          <p className="text-xs text-emerald-100 mt-0.5">Click below to proceed directly to the verified official government portal for {schemeTitle}.</p>
        </div>

        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 text-white bg-emerald-600 hover:bg-emerald-500 font-black text-base rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] border border-emerald-400/40"
        >
          <span>Apply Now on Official Portal</span>
          <span className="text-xs font-mono font-normal opacity-90">({applicationUrl})</span>
          <span className="text-lg">↗</span>
        </a>
      </div>
    </div>
  );
};
