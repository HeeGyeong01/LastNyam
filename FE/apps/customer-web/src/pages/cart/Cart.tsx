import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, BottomSheet } from '@/shared/components';
import { Button } from '@shared/components/Button';
import CartMenuCard from './component/cartMenuCard';
import { useAuthStore } from '@/store/useAuthStore';
import { orderCart } from '@/features/cart/api/cart';
import { getCart } from './api/cart.api';

// API 응답 타입
interface CartItem {
  cartItemId: number;
  discountId: number;
  cartItemAmount: number;
  menuName: string;
  discountPrice: number;
  discountRate: number;
  menuImage: string;
  discountMenuAmount: number; // 메뉴의 남은 수량
}

interface Shop {
  shopId: number;
  shopName: string;
  shopBanner: string;
  shopCloses: string; // 예: "21:00:00"
}

interface CartData {
  cartId: number;
  userId: number;
  cartItems: CartItem[];
  shop: Shop;
}

// shopCloses 시간을 "HH시 MM분" 형식으로 변환
function formatCloseTime(closeTime: string): string {
  const [hours, minutes] = closeTime.split(':');
  return `${parseInt(hours)}시 ${minutes.padStart(2, '0')}분`;
}

export default function Cart() {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  // 장바구니 데이터 조회
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getCart(userId);
        console.log('Cart API Response:', data);
        setCartData(data);
      } catch (err) {
        console.error('장바구니 조회 실패:', err);
        setError('장바구니를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  const handleQuantityChange = (cartItemId: number, newQuantity: number) => {
    setCartData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cartItems: prev.cartItems.map((item) =>
          item.cartItemId === cartItemId ? { ...item, cartItemAmount: newQuantity } : item
        ),
      };
    });
  };

  const handleRemove = (cartItemId: number) => {
    setCartData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cartItems: prev.cartItems.filter((item) => item.cartItemId !== cartItemId),
      };
    });
  };

  const handleAddMore = () => {
    if (cartData?.shop?.shopId) {
      navigate(`/shop/${cartData.shop.shopId}`, {
        state: { 
          fromCart: true, 
          totalPrice: totalPrice 
        }
      });
    }
  };

  const handleOrder = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    if (!cartData || cartData.cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    try {
      setIsOrdering(true);
      const res = await orderCart(userId);

      // 사용자 환경에 맞춰 Redirect URL 선택
      const isMobile = /Android|iPhone|iPad|iPod|iOS|Windows Phone/i.test(navigator.userAgent);

      const redirectUrl = isMobile
        ? res.nextRedirectMobileUrl || res.nextRedirectAppUrl || res.nextRedirectPcUrl
        : res.nextRedirectPcUrl || res.nextRedirectMobileUrl || res.nextRedirectAppUrl;

      if (!redirectUrl) {
        throw new Error('결제 페이지 URL을 받지 못했습니다.');
      }

      window.location.href = redirectUrl;
    } catch (e: any) {
      console.error(e);
      alert(e?.message || '결제를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsOrdering(false);
    }
  };

  const totalPrice =
    cartData?.cartItems.reduce((sum, item) => sum + item.discountPrice * item.cartItemAmount, 0) ||
    0;

  return (
    <>
      {/* 전체 화면 배경 레이어 (스크롤과 무관하게 항상 전체 화면 채움) */}
      <div className="fixed inset-0 bg-bg-1 -z-10 max-w-[500px] mx-auto" />

      <PageHeader title="장바구니" variant="light" />

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="p1 text-tertiary">장바구니를 불러오는 중...</div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <div className="p1 text-tertiary">{error}</div>
        </div>
      )}

      {/* 장바구니 데이터 */}
      {!isLoading && !error && cartData && (
        <div className="px-4 py-5 flex flex-col gap-3">
          {/* 가게 정보 */}
          {cartData.cartItems.length > 0 && (
            <div className="py-1 flex gap-1.5 items-center">
              <div className="bg-bg-3 rounded-lg w-7 h-7 flex-shrink-0 overflow-hidden relative">
                <img
                  src={
                    cartData.shop.shopBanner ||
                    'https://via.placeholder.com/150x100/e6e6e6/666666?text=Shop'
                  }
                  alt={cartData.shop.shopName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="h5-b text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                {cartData.shop.shopName}
              </h1>
            </div>
          )}

          {/* 장바구니 아이템 목록 */}
          {cartData.cartItems.length > 0 && (
            <div className="flex flex-col gap-3">
              {cartData.cartItems.map((item) => (
                <CartMenuCard
                  key={item.cartItemId}
                  menuName={item.menuName}
                  discountPrice={item.discountPrice}
                  discountRate={item.discountRate}
                  quantity={item.cartItemAmount}
                  maxQuantity={item.discountMenuAmount}
                  onQuantityChange={(newQuantity) =>
                    handleQuantityChange(item.cartItemId, newQuantity)
                  }
                  onRemove={() => handleRemove(item.cartItemId)}
                  imageUrl={item.menuImage}
                />
              ))}
            </div>
          )}

          {/* 메뉴 더 담기 버튼 */}
          {cartData.cartItems.length > 0 && (
            <Button btnStyle="filled-gray" size="lg" className="w-full" onClick={handleAddMore}>
              메뉴 더 담기
            </Button>
          )}

          {/* 빈 장바구니 메시지 */}
          {cartData.cartItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="p1 text-tertiary">장바구니가 비어있습니다</div>
            </div>
          )}
        </div>
      )}

      {/* 하단 주문 정보 */}
      {!isLoading && !error && cartData && cartData.cartItems.length > 0 && (
        <BottomSheet showBackdrop={false}>
          <div className="flex flex-col items-center gap-3">
            {/* 픽업 마감시간 */}
            {cartData.shop.shopCloses && (
              <p className="p1-b text-primary">
                픽업 마감시간 : {formatCloseTime(cartData.shop.shopCloses)}
              </p>
            )}

            {/* 주의사항 */}
            <p className="p3-b text-brand">
              픽업 마감시간 이후에는 주문이 취소되며, 환불이 불가하니 유의해주세요
            </p>

            {/* 결제제하기 버튼 */}
            <Button
              btnStyle="filled-yellow"
              size="lg"
              className="w-full"
              onClick={handleOrder}
              disabled={isOrdering}
            >
              {isOrdering
                ? '결제 페이지로 이동 중…'
                : `${totalPrice.toLocaleString('ko-KR')}원 결제하기`}
            </Button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
