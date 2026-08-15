import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
