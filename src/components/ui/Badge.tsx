import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'neutral'
    | 'eligible'
    | 'notEligible'
    | 'unknown'
    | 'info'
    | 'central'
    | 'state';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium rounded-full shrink-0 select-none';

  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    eligible: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    notEligible: 'bg-red-50 text-red-700 border border-red-200',
    unknown: 'bg-amber-50 text-amber-700 border border-amber-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    central: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    state: 'bg-teal-50 text-teal-700 border border-teal-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
