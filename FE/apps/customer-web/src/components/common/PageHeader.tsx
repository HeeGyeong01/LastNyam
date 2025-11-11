import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const headerVariants = cva(
  // 기본 스타일 (sticky로 최상단 고정)
  'w-full h-12 px-4 py-2 flex items-center justify-between relative sticky top-0 z-20',
  {
    variants: {
      variant: {
        light: 'bg-white text-primary',
        dark: 'text-inverse',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
);

interface PageHeaderProps extends VariantProps<typeof headerVariants> {
  title?: string;
  onBack?: () => void;
  showCart?: boolean;
  className?: string;
}

export default function PageHeader({ title, onBack, variant, showCart = true, className }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleCartClick = () => {
    navigate('/shopping-bag');
  };

  return (
    <header className={cn(headerVariants({ variant }), className)}>
      {/* 뒤로가기 버튼 */}
      <button
        onClick={handleBack}
        className="w-8 h-8 flex justify-center items-center z-10"
      >
        <ChevronLeftIcon className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* 타이틀 (절대 중앙 정렬) */}
      {title && (
        <h1 className="absolute left-1/2 -translate-x-1/2 p1-b">
          {title}
        </h1>
      )}

      {/* 장바구니 버튼 */}
      {showCart ? (
        <button
          onClick={handleCartClick}
          className="w-8 h-8 flex justify-center items-center z-10"
        >
          <ShoppingBagIcon className="w-5 h-5" strokeWidth={2} />
        </button>
      ) : (
        <div className="w-8 h-8" />
      )}
    </header>
  );
}

