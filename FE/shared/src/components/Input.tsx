import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

const containerVariants = cva(
  // 기본 스타일
  'w-full rounded-lg bg-bg-1 inline-flex items-center transition-all duration-200 focus-within:ring-2 focus-within:ring-stroke-3',
  {
    variants: {
      size: {
        default: 'px-4 py-2 gap-2',
        lg: 'px-4 py-2.5 gap-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const iconButtonStyles = 'flex items-center justify-center w-5 h-5 rounded-full transition-colors text-tertiary hover:text-secondary [&>svg]:w-5 [&>svg]:h-5';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof containerVariants> {
  icon?: React.ReactNode;
  onIconClick?: () => void;
  onClearClick?: () => void;
  showClearButton?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size,
      type = 'text',
      value: controlledValue,
      onChange,
      icon,
      onIconClick,
      onClearClick,
      showClearButton = true,
      ...props
    },
    ref
  ) => {
    // Uncontrolled mode를 위한 내부 state
    const [internalValue, setInternalValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Controlled vs Uncontrolled 판단
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const hasValue = value && String(value).length > 0;

    // ref 병합
    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
        // input의 value를 직접 업데이트
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
      onClearClick?.();
    };

    return (
      <div className={cn(containerVariants({ size, className }))}>
        <input
          type={type}
          className="flex-1 bg-transparent text-primary placeholder:text-tertiary p2-r focus:outline-none"
          ref={inputRef}
          value={isControlled ? value : undefined}
          defaultValue={!isControlled ? value : undefined}
          onChange={handleChange}
          {...props}
        />

        {/* X 버튼 (입력값이 있을 때만 표시) */}
        {hasValue && showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(iconButtonStyles, 'hover:bg-bg-2')}
            aria-label="지우기"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        {/* 커스텀 아이콘 */}
        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className={iconButtonStyles}
            aria-label="아이콘"
          >
            {icon}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, containerVariants };
