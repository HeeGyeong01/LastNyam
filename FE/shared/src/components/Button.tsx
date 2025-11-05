import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Filled 버튼
        default: 'bg-primary text-inverse hover:bg-primary/90',
        brand: 'bg-brand text-inverse hover:bg-brand-strong',
        error: 'bg-error text-inverse hover:bg-error/90',
        success: 'bg-success text-inverse hover:bg-success/90',
        
        // Outlined 버튼
        outline: 'border border-stroke-2 text-primary hover:bg-bg-1',
        'outline-brand': 'border border-brand text-brand hover:bg-brand-bg-1',
        
        // Ghost 버튼
        ghost: 'text-primary hover:bg-bg-1',
        'ghost-brand': 'text-brand hover:bg-brand-bg-1',
      },
      size: {
        sm: 'h-8 px-3 text-p3',
        md: 'h-10 px-4 text-p2',
        lg: 'h-12 px-6 text-p1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

