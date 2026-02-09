import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'high' | 'medium' | 'low' | 'action';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          {
            'bg-gray-100 text-gray-800': variant === 'default',
            'bg-red-100 text-red-800': variant === 'high',
            'bg-yellow-100 text-yellow-800': variant === 'medium',
            'bg-green-100 text-green-800': variant === 'low',
            'bg-blue-100 text-blue-800': variant === 'action',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
