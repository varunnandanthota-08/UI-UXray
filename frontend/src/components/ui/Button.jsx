import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    // Primary Barabari Yellow CTA
    primary: 'bg-brand-yellow text-brand-text-primary hover:bg-brand-yellow-hover active:bg-[#E6B324] shadow-sm hover:shadow focus-visible:ring-brand-blue rounded-xl font-semibold',
    // Secondary Barabari Blue Anchor
    secondary: 'bg-brand-blue text-white hover:bg-brand-blue-dark active:bg-[#1E2960] shadow-sm hover:shadow focus-visible:ring-brand-yellow rounded-xl font-medium',
    // Neutral Outline
    outline: 'border border-brand-border bg-white text-brand-text-primary hover:bg-[#F7F7F4] hover:border-[#D5D5CE] focus-visible:ring-brand-blue rounded-xl',
    // Soft Blue
    soft: 'bg-brand-blue-light text-brand-blue hover:bg-[#DFE5F7] focus-visible:ring-brand-blue rounded-xl',
    // Ghost
    ghost: 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-[#F7F7F4] rounded-xl focus-visible:ring-brand-blue',
    // Destructive
    danger: 'border border-brand-error/20 bg-brand-error-bg text-brand-error hover:bg-red-100 focus-visible:ring-brand-error rounded-xl font-medium',
    // Link
    link: 'text-brand-blue hover:underline p-0 bg-transparent rounded-none font-semibold focus-visible:ring-0',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
