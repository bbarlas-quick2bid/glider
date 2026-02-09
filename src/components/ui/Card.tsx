import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-lg border border-gray-200 bg-white p-4 shadow-sm',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
