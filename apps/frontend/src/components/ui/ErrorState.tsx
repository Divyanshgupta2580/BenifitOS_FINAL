import React from 'react';
import { AlertTriangleIcon } from './Icons';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  onBack?: () => void;
  backLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Temporarily Unavailable',
  message = 'We could not complete your request at this time. Please verify your connection or retry.',
  onRetry,
  retryLabel = 'Retry Request',
  isRetrying = false,
  onBack,
  backLabel = 'Go Back',
  onSecondaryAction,
  secondaryActionLabel,
  className = '',
}) => {
  const secondaryHandler = onSecondaryAction || onBack;
  const secondaryText = secondaryActionLabel || backLabel;

  return (
    <div
      role="alert"
      className={`rounded-2xl bg-rose-50 dark:bg-[#160D10] border border-rose-200 dark:border-rose-900/60 p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900/80 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
        <AlertTriangleIcon className="w-6 h-6" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h2 className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-100 font-heading">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
          {message}
        </p>
      </div>

      {(onRetry || secondaryHandler) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onRetry && (
            <Button
              variant="destructive"
              size="md"
              onClick={onRetry}
              isLoading={isRetrying}
            >
              {isRetrying ? 'Retrying...' : retryLabel}
            </Button>
          )}
          {secondaryHandler && (
            <Button variant="secondary" size="md" onClick={secondaryHandler}>
              {secondaryText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
