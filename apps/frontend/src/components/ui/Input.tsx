import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  onChangeText?: (text: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  onChangeText,
  onChange,
  value,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onChangeText) onChangeText(e.target.value);
  };

  return (
    <div className="mb-4 flex flex-col">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        value={value}
        onChange={handleChange}
        className={`w-full bg-white dark:bg-slate-900 border ${
          error
            ? 'border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950/50'
            : 'border-slate-300 dark:border-slate-700 focus:border-blue-700 dark:focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-950/50'
        } rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 transition-colors ${className}`}
        {...props}
      />
      {error && <span className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</span>}
    </div>
  );
};
