import React from 'react';

const statusToVariant = {
  ACTIVE: 'yellow',
  PUBLISHED: 'success',
  'UNDER EVALUATION': 'warning',
  UNDER_EVALUATION: 'warning',
  'IN PROGRESS': 'yellow',
  IN_PROGRESS: 'yellow',
  COMPLETED: 'success',
  'NOT STARTED': 'neutral',
  NOT_STARTED: 'neutral',
  'DUE SOON': 'warning',
  DUE_SOON: 'warning',
  UPCOMING: 'blue',
  STUDENT: 'blue',
  EVALUATED: 'success',
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) => {
  // Resolve variant from direct prop or status mapping
  const normalizedKey = typeof variant === 'string' ? variant.toUpperCase() : '';
  const resolvedVariant = statusToVariant[normalizedKey] || variant;

  const variants = {
    neutral: 'bg-[#F4F4F0] text-brand-text-secondary border-brand-border',
    success: 'bg-brand-success-bg text-brand-success border-emerald-200',
    warning: 'bg-brand-warning-bg text-brand-warning border-amber-200',
    error: 'bg-brand-error-bg text-brand-error border-red-200',
    blue: 'bg-brand-blue-light text-brand-blue border-indigo-100',
    yellow: 'bg-brand-yellow-light text-[#946F00] border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dotColors = {
    neutral: 'bg-gray-400',
    success: 'bg-brand-success',
    warning: 'bg-brand-warning',
    error: 'bg-brand-error',
    blue: 'bg-brand-blue',
    yellow: 'bg-brand-yellow',
    purple: 'bg-purple-600',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider',
    md: 'text-[11px] px-2.5 py-0.5 font-bold uppercase tracking-wider',
    lg: 'text-xs px-3 py-1 font-bold uppercase tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${variants[resolvedVariant] || variants.neutral} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[resolvedVariant] || 'bg-current'}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
