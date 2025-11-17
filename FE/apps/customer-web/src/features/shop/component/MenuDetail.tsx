import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@shared/components/Badge';
import type { ShopDetailDiscount } from '@/features/shop/type';
import { Stepper } from '@/shared/components';
import { Button } from '@shared/components/Button';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { addToCart } from '@/pages/cart/api/cart.api';
import LoadingModal from '@/shared/components/LoadingModal';

interface MenuDetailProps {
  detail: ShopDetailDiscount;
}

export default function MenuDetail({ detail }: MenuDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const requireAuth = useRequireAuth();
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.userId);
  
  const formattedPrice = detail.price.toLocaleString('ko-KR');
  const formattedOriginalPrice = detail.originalPrice.toLocaleString('ko-KR');
  const totalPrice = (detail.price * quantity).toLocaleString('ko-KR');

  const handleAddToCart = async () => {
    requireAuth(async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        await addToCart(userId, detail.discountId, quantity);
        navigate('/cart');
      } catch (error) {
        console.error('장바구니 추가 실패:', error);
      } finally {
        setIsLoading(false);
      }
    });
  };

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
        <Button 
          className="w-full" 
          btnStyle="filled-yellow" 
          size="lg"
          onClick={handleAddToCart}
        >
          {totalPrice}원 담기
        </Button>
      </div>

      <LoadingModal isOpen={isLoading} />
    </div>
  );
}