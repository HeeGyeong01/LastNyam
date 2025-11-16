import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Stepper from '@/shared/components/Stepper';
import { getMenuImageUrl } from '@/shared/lib/image';

interface CartMenuCardProps {
  menuName: string;
  discountPrice: number; // 할인된 가격
  discountRate?: number; // 할인율 (%)
  quantity: number;
  maxQuantity?: number; // 메뉴의 남은 수량 (discountMenuAmount)
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  imageUrl?: string;
  className?: string;
}

export default function CartMenuCard({
  menuName,
  discountPrice,
  discountRate: _discountRate, // 향후 할인율 표시에 사용 예정
  quantity,
  maxQuantity = 99,
  onQuantityChange,
  onRemove,
  imageUrl,
  className = '',
}: CartMenuCardProps) {
  const formattedPrice = discountPrice.toLocaleString('ko-KR');
  const totalPrice = (discountPrice * quantity).toLocaleString('ko-KR');

  return (
    <div
      className={cn(
        'bg-bg-0 rounded-2xl p-4 flex gap-3 items-start relative shadow-[0_0_12px_0_rgba(0,0,0,0.1)]',
        className
      )}
    >
      {/* 이미지 영역 */}
      <div className="bg-bg-3 rounded-lg w-14 h-14 flex-shrink-0 overflow-hidden relative">
        <img
          src={getMenuImageUrl(imageUrl)}
          alt={menuName}
          className="w-[150px] h-[100px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-cover aspect-[3/2]"
        />
      </div>

      {/* 메뉴 정보 영역 */}
      <div className="flex flex-col gap-2 flex-1">
        {/* 메뉴명과 가격 */}
        <div className="flex flex-col gap-0.5">
          <div className="p1-b text-primary overflow-hidden text-ellipsis whitespace-nowrap">
            {menuName}
          </div>
          <div className="p2 text-secondary">
            가격: {formattedPrice}원
          </div>
        </div>

        {/* 총 가격과 Stepper */}
        <div className="flex items-center gap-2">
          <div className="p1-b text-primary flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {totalPrice}원
          </div>
          <Stepper
            value={quantity}
            onChange={onQuantityChange}
            min={1}
            max={maxQuantity}
            width="w-[124px]"
          />
        </div>
      </div>

      {/* X 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-4 top-3 w-5 h-5 flex-shrink-0 transition-opacity hover:opacity-70"
        aria-label="장바구니에서 제거"
      >
        <XMarkIcon className="w-5 h-5 text-secondary" strokeWidth={2} />
      </button>
    </div>
  );
}

