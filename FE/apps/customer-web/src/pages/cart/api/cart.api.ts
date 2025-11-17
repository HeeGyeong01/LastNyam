import { apiClient } from '@/shared/api/client';
import type { ApiResponseWrapper } from '@/shared/types/common';

// API 응답 타입
export interface CartItem {
  cartItemId: number;
  discountId: number;
  cartItemAmount: number;
  menuName: string;
  discountPrice: number;
  discountRate: number;
  menuImage: string;
  discountMenuAmount: number; // 메뉴의 남은 수량
}

export interface Shop {
  shopId: number;
  shopName: string;
  shopBanner: string;
  shopCloses: string; // 예: "21:00:00"
}

export interface CartData {
  cartId: number;
  userId: number;
  cartItems: CartItem[];
  shop: Shop;
}

/**
 * 장바구니 조회
 * GET /api/cart/{userId}
 * 
 * @param userId - 사용자 ID
 */
export const getCart = async (userId: number): Promise<CartData> => {
  const response = await apiClient.get<ApiResponseWrapper<CartData>>(`/api/cart/${userId}`);
  return response.data.data;
};

/**
 * 장바구니에 상품 추가
 * POST /api/cart/{userId}
 * 
 * @param userId - 사용자 ID
 * @param discountId - 할인 상품 ID
 * @param cartItemAmount - 장바구니에 담을 수량
 */
export const addToCart = async (
  userId: number,
  discountId: number,
  cartItemAmount: number
): Promise<CartData> => {
  const response = await apiClient.post<ApiResponseWrapper<CartData>>(
    `/api/cart/${userId}`,
    { discountId, cartItemAmount }
  );
  return response.data.data;
};

