import { apiClient } from './client';
import type { Cart, CartOrderResponse } from '@/types';

// 요청 타입
export interface AddToCartRequest {
  discountId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: number;
  quantity: number;
}

/**
 * 7. 장바구니 조회
 * GET /api/cart/{userId}
 */
export const getCart = async (userId: number): Promise<Cart> => {
  const response = await apiClient.get(`/api/cart/${userId}`);
  return response.data;
};

/**
 * 8. 장바구니 물품 추가
 * PUT /api/cart/{userId}
 */
export const addToCart = async (
  userId: number,
  data: AddToCartRequest
): Promise<Cart> => {
  const response = await apiClient.put(`/api/cart/${userId}`, data);
  return response.data;
};

/**
 * 9. 장바구니 물품 개수 수정
 * PATCH /api/cart/{userId}
 */
export const updateCartItem = async (
  userId: number,
  data: UpdateCartItemRequest
): Promise<Cart> => {
  const response = await apiClient.patch(`/api/cart/${userId}`, data);
  return response.data;
};

/**
 * 10. 장바구니 물품 제거
 * DELETE /api/cart/{userId}
 */
export const removeFromCart = async (
  userId: number,
  cartItemId: number
): Promise<Cart> => {
  const response = await apiClient.delete(`/api/cart/${userId}`, {
    data: { cartItemId },
  });
  return response.data;
};

/**
 * 11. 장바구니 결제
 * POST /api/cart/{userId}/order
 */
export const orderCart = async (
  userId: number
): Promise<CartOrderResponse> => {
  const response = await apiClient.post(`/api/cart/${userId}/order`);
  return response.data;
};

