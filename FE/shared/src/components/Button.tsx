import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      btnStyle: {
        // Filled 버튼
        'filled-default': 'bg-bg-2 p2-b text-secondary',
        'filled-red': 'bg-brand p2-b text-inverse',
        'filled-yellow': 'bg-brand-bg-3 p2-b text-primary',
        'filled-gray': 'bg-bg-2 p2-b text-primary',
        
        // Outlined 버튼
        'outlined-default': 'border border-stroke-3 p2-b text-secondary',
        'outlined-red': 'border border-brand p2-b text-brand',
        
        // Ghost 버튼
        ghost: 'p2-b text-secondary px-0 py-0',

        // underline 버튼
        'underline-default': 'p2-b text-secondary border-b border-stroke-3 px-3.5 py-2.5 rounded-none',
        'underline-red': 'p2-b text-brand border-b-2 border-brand px-3.5 py-2.5 rounded-none',
      }, 

      // 버튼 크기
      size: {
        'lg': 'px-5 py-2.5',
      },

      // 버튼 모양
      btnShape: {
        'rounded': 'rounded-full',
      },
    },

    defaultVariants: {
      btnStyle: 'filled-default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, btnStyle, size, btnShape, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ btnStyle, size, btnShape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

