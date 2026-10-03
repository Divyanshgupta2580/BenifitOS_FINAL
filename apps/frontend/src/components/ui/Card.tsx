import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive' | 'hero' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e?: any) => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  onClick,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white dark:bg-[#121E18] border-slate-200 dark:border-[#264234] shadow-md';
      case 'interactive':
        return 'bg-white dark:bg-[#0E1712] border-slate-200 dark:border-[#1C3127]/80 hover:border-mint-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer';
      case 'hero':
        return 'bg-gradient-to-r from-slate-100 via-emerald-50 to-slate-100 dark:from-forest-950 dark:via-[#0A1D15] dark:to-forest-950 border-slate-200 dark:border-[#1C3127]/80 shadow-xl';
      case 'glass':
        return 'bg-white/80 dark:bg-[#111C16]/90 backdrop-blur-md border-slate-200 dark:border-[#1C3127] shadow-sm';
      default:
        return 'bg-white dark:bg-[#0E1712] border-slate-200 dark:border-[#1C3127]/80 shadow-sm';
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return 'p-3 sm:p-4';
      case 'lg':
        return 'p-6 sm:p-8';
      default:
        return 'p-5 sm:p-6';
    }
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={`rounded-2xl border text-slate-900 dark:text-slate-100 transition-colors ${getVariantStyle()} ${getPaddingStyle()} ${
        onClick && variant !== 'interactive' ? 'cursor-pointer hover:border-mint-500/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
