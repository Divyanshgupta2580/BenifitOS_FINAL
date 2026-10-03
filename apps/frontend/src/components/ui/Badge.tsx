import React from 'react';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-mint-300 border-emerald-200 dark:border-emerald-500/40';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40';
      case 'danger':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      case 'info':
        return 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/40';
      case 'neutral':
        return 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-emerald-50 dark:bg-forest-900 text-emerald-900 dark:text-mint-300 border-emerald-200 dark:border-[#1C3127]';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[10px] font-bold';
      default:
        return 'px-2.5 py-1 text-xs font-semibold';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border tracking-wide uppercase ${getBadgeStyle()} ${getSizeStyle()} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
