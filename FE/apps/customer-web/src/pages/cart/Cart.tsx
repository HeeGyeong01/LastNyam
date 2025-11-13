import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, BottomSheet } from '@/components/common';
import { Button } from '@shared/components/Button';
import CartMenuCard from './component/cartMenuCard';

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
  
  // 테스트용 샘플 데이터 (API 응답 구조에 맞춤)
  const [cartData, setCartData] = useState<CartData>({
    cartId: 2,
    userId: 1,
    shop: {
      shopId: 1,
      shopName: '생연어전문점 청라수산',
      shopBanner: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=150&h=100&fit=crop',
      shopCloses: '21:00:00',
    },
    cartItems: [
      {
        cartItemId: 1,
        discountId: 1,
        cartItemAmount: 2,
        menuName: '초팝 한판 세트',
        discountPrice: 800000,
        discountRate: 10,
        menuImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&h=100&fit=crop',
        discountMenuAmount: 5,
      },
      {
        cartItemId: 2,
        discountId: 1,
        cartItemAmount: 1,
        menuName: '냉모밀세트',
        discountPrice: 800000,
        discountRate: 10,
        menuImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&h=100&fit=crop',
        discountMenuAmount: 3,
      },
    ],
  });

  const handleQuantityChange = (cartItemId: number, newQuantity: number) => {
    setCartData(prev => ({
      ...prev,
      cartItems: prev.cartItems.map(item =>
        item.cartItemId === cartItemId 
          ? { ...item, cartItemAmount: newQuantity } 
          : item
      ),
    }));
  };

  const handleRemove = (cartItemId: number) => {
    setCartData(prev => ({
      ...prev,
      cartItems: prev.cartItems.filter(item => item.cartItemId !== cartItemId),
    }));
  };

  const handleAddMore = () => {
    navigate(`/shop/${cartData.shop.shopId}`);
  };

  const handleOrder = () => {
    // TODO: 주문하기 로직
    console.log('주문하기');
  };

  const totalPrice = cartData.cartItems.reduce(
    (sum, item) => sum + item.discountPrice * item.cartItemAmount,
    0
  );

  return (
    <>
      <div className="bg-bg-1 min-h-screen">
        <PageHeader title="장바구니" variant="light" />
        <div className="px-4 py-5 pb-44 flex flex-col gap-3">
          {/* 가게 정보 */}
          {cartData.cartItems.length > 0 && (
            <div className="py-1 flex gap-1.5 items-center">
              <div className="bg-bg-3 rounded-lg w-7 h-7 flex-shrink-0 overflow-hidden relative">
                <img
                  src={cartData.shop.shopBanner || 'https://via.placeholder.com/150x100/e6e6e6/666666?text=Shop'}
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
              {cartData.cartItems.map(item => (
                <CartMenuCard
                  key={item.cartItemId}
                  menuName={item.menuName}
                  discountPrice={item.discountPrice}
                  discountRate={item.discountRate}
                  quantity={item.cartItemAmount}
                  maxQuantity={item.discountMenuAmount}
                  onQuantityChange={newQuantity => handleQuantityChange(item.cartItemId, newQuantity)}
                  onRemove={() => handleRemove(item.cartItemId)}
                  imageUrl={item.menuImage}
                />
              ))}
            </div>
          )}

          {/* 메뉴 더 담기 버튼 */}
          {cartData.cartItems.length > 0 && (
            <Button
              btnStyle="filled-gray"
              size="lg"
              className="w-full"
              onClick={handleAddMore}
            >
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
      </div>

      {/* 하단 주문 정보 */}
      {cartData.cartItems.length > 0 && (
        <BottomSheet showBackdrop={false}>
          <div className="flex flex-col items-center gap-3">
            {/* 픽업 마감시간 */}
            {cartData.shop.shopCloses && (
              <p className="p1-b text-primary">픽업 마감시간 : {formatCloseTime(cartData.shop.shopCloses)}</p>
            )}

            {/* 주의사항 */}
            <p className="p3-b text-brand">픽업 마감시간 이후에는 주문이 취소되며, 환불이 불가하니 유의해주세요</p>

            {/* 결제제하기 버튼 */}
            <Button
              btnStyle="filled-yellow"
              size="lg"
              className="w-full"
              onClick={handleOrder}
            >
              {totalPrice.toLocaleString('ko-KR')}원 결제하기
            </Button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
