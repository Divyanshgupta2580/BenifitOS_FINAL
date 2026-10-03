import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#0E1712] border border-slate-200 dark:border-[#1C3127]/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-forest-950 border border-slate-200 dark:border-[#1C3127] flex items-center justify-center text-slate-500 dark:text-mint-400 shadow-sm">
          {icon}
        </div>
      )}

      <div className="max-w-md space-y-1.5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionLabel && onAction && (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
