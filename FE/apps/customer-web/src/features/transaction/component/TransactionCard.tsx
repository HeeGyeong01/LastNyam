import { cn } from '@/lib/utils';
import { Button } from '@shared/components/Button';
import type { TransactionMenu } from '../type/transaction';

export type TransactionType = 'discount' | 'foocketing';

export interface TransactionCardProps {
  shopImageUrl?: string;
  shopName: string;
  menus: TransactionMenu[];
  totalAmount: number;
  transactionType?: TransactionType;
  onQrClick?: () => void;
  className?: string;
}


export default function TransactionCard({
  shopImageUrl,
  shopName,
  menus,
  totalAmount,
  transactionType = 'discount',
  onQrClick,
  className,
}: TransactionCardProps) {
  const formattedTotalAmount = totalAmount.toLocaleString('ko-KR');
  const isFoocketing = transactionType === 'foocketing';

  return (
    <div
      className={cn(
        'w-full p-4 bg-bg-0 rounded-2xl shadow-[0_0_12px_0_rgba(0,0,0,0.1)] flex flex-col gap-4',
        className
      )}
    >
      {/* 가게 정보 */}
      <div className="w-full py-1 flex justify-start items-start gap-1.5">
        <div className="w-7 h-7 relative bg-bg-2 rounded-lg overflow-hidden flex-shrink-0">
          {shopImageUrl && (
            <img
              className="w-full h-full object-cover"
              src={shopImageUrl}
              alt={shopName}
            />
          )}
        </div>
        <div className="text-primary text-lg font-bold leading-7 line-clamp-1">
          {shopName}
        </div>
      </div>

      {/* 주문 항목들 */}
      <div className="w-full flex flex-col gap-3">
        {menus.map((menu) => {
          const formattedPrice = menu.price.toLocaleString('ko-KR');
          return (
            <div key={menu.menuName} className="w-full flex flex-col gap-0.5">
              <div className="w-full flex justify-start items-center gap-1">
                <div className="text-primary text-sm font-normal leading-5 line-clamp-1">
                  {menu.menuName}
                </div>
                <div className="text-tertiary text-sm font-normal leading-5 line-clamp-1">
                  x{menu.quantity}
                </div>
              </div>
              <div className="w-full text-tertiary text-xs font-normal leading-4">
                가격: {formattedPrice}원
              </div>
            </div>
          );
        })}
      </div>

      {/* 구분선 및 결제/할인 금액 */}
      <div className="w-full pt-4 border-t border-stroke-3 flex justify-start items-start gap-3">
        <div className="flex-1 h-6 text-primary text-base font-bold leading-6">
          {isFoocketing ? '할인 금액' : '결제 금액'}
        </div>
        <div
          className={cn(
            'text-primary text-base font-bold leading-6 line-clamp-1',
            isFoocketing && 'line-through'
          )}
        >
          {formattedTotalAmount}원
        </div>
      </div>

      {/* QR 확인하기 버튼 */}
      <Button
        btnStyle="filled-gray"
        size="lg"
        className="w-full"
        onClick={onQrClick}
      >
        QR 확인하기
      </Button>
    </div>
  );
}

