// 장바구니 관련 타입 (응답)

export interface CartItemResponse {
  cartItemId: number;
  discountId: number;
  cartItemAmount: number;
  menuName: string;
  discountPrice: number;
  discountRate: number;
  shopId: number;
  shopName: string;
}

export interface CartResponse {
  cartId: number | null;
  userId: number;
  cartItems: CartItemResponse[];
}

