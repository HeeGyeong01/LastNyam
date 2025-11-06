import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center rounded px-1.5 py-[3px] caption2-b whitespace-nowrap transition-colors',
  {
    variants: {
      badgeStyle: {
        'red': 'bg-brand-bg-2 text-brand',
        'yellow': 'bg-brand-bg-1 text-brand-subtle',
        'gray': 'bg-bg-1 text-tertiary',
        'white': 'bg-bg-0 text-primary',
      },
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, 
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, badgeStyle, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ badgeStyle, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
