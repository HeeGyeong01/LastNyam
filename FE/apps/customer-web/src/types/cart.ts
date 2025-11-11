// 장바구니 관련 타입 (응답)
export interface CartItem {
  cartItemId: number;
  discountId: number;
  shopId: number;
  shopName: string;
  menuName: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  imageUrl: string;
  quantity: number;
  deadline: string;
}

export interface Cart {
  userId: number;
  items: CartItem[];
  totalOriginalPrice: number;
  totalDiscountPrice: number;
  totalSavings: number;
}

export interface CartOrderResponse {
  success: boolean;
  orderId: number;
  message: string;
  totalAmount: number;
}

