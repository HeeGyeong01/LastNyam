import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  width?: string; // width 클래스 (예: 'w-32', 'w-24', 'w-40' 등)
}

export default function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className = '',
  width = 'w-32',
}: StepperProps) {
  const handleDecrease = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const isDecreaseDisabled = disabled || value <= min;
  const isIncreaseDisabled = disabled || value >= max;

  return (
    <div
      className={cn(
        'p-1.5 bg-bg-1 rounded-lg inline-flex justify-center items-center gap-3',
        width, // width prop
        className // className이 마지막에 와서 width를 오버라이드할 수 있음
      )}
    >
      {/* 마이너스 버튼 */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={isDecreaseDisabled}
        className={cn(
          'w-7 h-7 p-1 bg-bg-2 rounded justify-center items-center transition-opacity',
          isDecreaseDisabled && 'opacity-20 cursor-not-allowed',
        )}
        aria-label="수량 감소"
      >
        <MinusIcon className="w-5 h-5 text-secondary" strokeWidth={2.5} />
      </button>

      {/* 수량 표시 */}
      <div className="flex-1 text-center text-primary p1-b">
        {value}
      </div>

      {/* 플러스 버튼 */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={isIncreaseDisabled}
        className={cn(
          'w-7 h-7 p-1 bg-bg-2 rounded justify-center items-center transition-opacity',
          isIncreaseDisabled && 'opacity-20 cursor-not-allowed',
        )}
        aria-label="수량 증가"
      >
        <PlusIcon className="w-5 h-5 text-secondary" strokeWidth={2.5} />
      </button>
    </div>
  );
}

