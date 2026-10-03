import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onPress?: (e?: any) => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  onClick,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  style,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    if (onClick) onClick(e);
    if (onPress) onPress(e);
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-mint-400 hover:bg-mint-300 active:bg-mint-500 text-forest-950 font-bold shadow-md shadow-mint-500/20 border border-transparent';
      case 'secondary':
        return 'bg-slate-100 hover:bg-slate-200 dark:bg-forest-900 dark:hover:bg-forest-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#1C3127] font-semibold';
      case 'outline':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-forest-900/60 text-slate-700 dark:text-mint-300 border border-slate-300 dark:border-[#1C3127] hover:border-mint-500/50 font-semibold';
      case 'destructive':
        return 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm border border-transparent font-semibold';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 dark:hover:bg-forest-900/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent font-semibold';
      default:
        return 'bg-mint-400 hover:bg-mint-300 text-forest-950 font-bold';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-6 py-3.5 text-base font-bold';
      default:
        return 'px-4 py-2.5 text-xs sm:text-sm';
    }
  };

  return (
    <button
      type={props.type || 'button'}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#080C0A] disabled:opacity-50 disabled:cursor-not-allowed select-none ${getVariantStyle()} ${getSizeStyle()} ${className}`}
      style={style as React.CSSProperties}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children || title
      )}
    </button>
  );
};
