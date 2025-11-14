import { useState } from 'react';
import { Badge } from '@shared/components/Badge';
import type { ShopDetailDiscount } from '@/features/shop/type';
import { Stepper } from '@/shared/components';
import { Button } from '@shared/components/Button';

interface MenuDetailProps {
  detail: ShopDetailDiscount;
}

export default function MenuDetail({ detail }: MenuDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const formattedPrice = detail.price.toLocaleString('ko-KR');
  const formattedOriginalPrice = detail.originalPrice.toLocaleString('ko-KR');
  const totalPrice = (detail.price * quantity).toLocaleString('ko-KR');

  return (
    <div className="flex flex-col gap-7 pt-1">
      {/* 메뉴 정보 섹션 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        {/* 배지: "3등 안에 들면 성공이에요" */}
        <Badge badgeStyle="red" size="lg">
          {detail.stock}개 남았어요
        </Badge>

        {/* 메뉴명 */}
        <div className="text-primary h5-b line-clamp-1">
          {detail.menuName}
        </div>

        {/* 가격 */}
        <div className="flex items-center gap-1">
          <div className="text-brand p1-b">
            {detail.discountRate}%
          </div>
          <div className="text-primary p1-b">
            {formattedPrice}원
          </div>
          <div className="text-secondary p2 line-through leading-5 line-clamp-1">
            {formattedOriginalPrice}원
          </div>
        </div>

        {/* 메뉴 설명 */}
        <div className="self-stretch text-secondary p2 whitespace-pre-line">
          {detail.menuDescription}
        </div>
      </div>

      {/* 장바구니 담기 섹션 */}
      <div className="flex items-center gap-3">
        <Stepper
          value={quantity}
          onChange={setQuantity}
          max={detail.stock}
          width="w-52"
        />
        <Button className="w-full" btnStyle="filled-yellow" size="lg">
          {totalPrice}원 담기
        </Button>
      </div>
    </div>
  );
}