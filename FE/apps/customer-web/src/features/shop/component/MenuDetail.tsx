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
import AlertModal from '@/shared/components/AlertModal';
import { useLayout } from '@/contexts/LayoutContext';

interface MenuDetailProps {
  detail: ShopDetailDiscount;
}

export default function MenuDetail({ detail }: MenuDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showDifferentShopModal, setShowDifferentShopModal] = useState(false);
  const requireAuth = useRequireAuth();
  const userId = useAuthStore((state) => state.userId);
  const { closeMenuDetail, setCartTotalPrice } = useLayout();
  const navigate = useNavigate();
  
  const formattedPrice = detail.price.toLocaleString('ko-KR');
  const formattedOriginalPrice = detail.originalPrice.toLocaleString('ko-KR');
  const totalPrice = (detail.price * quantity).toLocaleString('ko-KR');

  const handleAddToCart = async () => {
    console.log('🛒 장바구니 담기 버튼 클릭');
    
    requireAuth(async () => {
      console.log('✅ 인증 확인 완료');
      console.log('👤 현재 userId:', userId);
      
      if (!userId) {
        console.error('❌ userId가 없습니다');
        return;
      }

      try {
        setIsLoading(true);
        console.log('📤 장바구니 추가 API 요청 시작');
        console.log('요청 파라미터:', {
          userId,
          discountId: detail.discountId,
          cartItemAmount: quantity
        });
        
        const response = await addToCart(userId, detail.discountId, quantity);
        console.log('✅ 장바구니 추가 API 응답:', response);
        
        // 장바구니 총 가격 업데이트 (API 응답의 cartItems로 계산)
        const newTotalPrice = response.cartItems.reduce(
          (sum, item) => sum + item.discountPrice * item.cartItemAmount,
          0
        );
        setCartTotalPrice(newTotalPrice);
        console.log('💰 장바구니 총 가격 업데이트:', newTotalPrice);
        
        closeMenuDetail();
      } catch (error: any) {
        console.error('❌ 장바구니 추가 실패:', error);
        console.error('에러 상세:', {
          message: error instanceof Error ? error.message : '알 수 없는 에러',
          error
        });

        // DIFFERENT_SHOP_ITEMS 에러 처리
        if (error?.response?.data?.message === 'DIFFERENT_SHOP_ITEMS') {
          setShowDifferentShopModal(true);
        }
      } finally {
        setIsLoading(false);
        console.log('🏁 로딩 종료');
      }
    });
  };

  const handleGoToCart = () => {
    setShowDifferentShopModal(false);
    closeMenuDetail();
    navigate('/cart');
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
      
      {/* DIFFERENT_SHOP_ITEMS 에러 모달 */}
      <AlertModal
        isOpen={showDifferentShopModal}
        mainText="현재 장바구니에 다른 가게의 물품이 있어 추가하지 못했습니다."
        subText="한 번에 하나의 가게 물품만 담을 수 있습니다. 장바구니로 이동하시겠습니까?"
        buttonText="장바구니로 이동"
        onConfirm={handleGoToCart}
        onClose={() => setShowDifferentShopModal(false)}
      />
    </div>
  );
}