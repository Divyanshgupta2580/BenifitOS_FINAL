import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
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
        return 'bg-blue-900 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-600 text-white shadow-sm border border-transparent';
      case 'secondary':
        return 'bg-amber-600 dark:bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-500 text-white shadow-sm border border-transparent';
      case 'outline':
        return 'bg-transparent hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-900 dark:text-blue-400 border border-blue-900 dark:border-blue-700';
      case 'destructive':
        return 'bg-rose-600 dark:bg-rose-700 hover:bg-rose-700 dark:hover:bg-rose-600 text-white shadow-sm border border-transparent';
      default:
        return 'bg-blue-900 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-600 text-white';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-6 py-3.5 text-base font-bold';
      default:
        return 'px-4 py-2.5 text-sm font-semibold';
    }
  };

  return (
    <button
      type={props.type || 'button'}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyle()} ${getSizeStyle()} ${className}`}
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
