import { apiClient } from './client';
import type { CartResponse, ApiResponseWrapper } from '@/types';

// 요청 타입
export interface AddToCartRequest {
  discountId: number;
  cartItemAmount: number;
}

export interface UpdateCartItemRequest {
  cartItemId: number;
  cartItemAmount: number;
}

export interface RemoveFromCartRequest {
  cartItemId: number;
}

/**
 * 1. 장바구니 조회
 * GET /api/cart/{userId}
 */
export const getCart = async (userId: number): Promise<CartResponse> => {
  const response = await apiClient.get<ApiResponseWrapper<CartResponse>>(`/api/cart/${userId}`);
  return response.data.data;
};

/**
 * 2. 장바구니 물품 추가
 * POST /api/cart/{userId}
 */
export const addToCart = async (
  userId: number,
  data: AddToCartRequest
): Promise<CartResponse> => {
  const response = await apiClient.post<ApiResponseWrapper<CartResponse>>(`/api/cart/${userId}`, data);
  return response.data.data;
};

/**
 * 3. 장바구니 물품 개수 수정
 * PATCH /api/cart/{userId}
 */
export const updateCartItem = async (
  userId: number,
  data: UpdateCartItemRequest
): Promise<CartResponse> => {
  const response = await apiClient.patch<ApiResponseWrapper<CartResponse>>(`/api/cart/${userId}`, data);
  return response.data.data;
};

/**
 * 4. 장바구니 물품 제거
 * DELETE /api/cart/{userId}
 */
export const removeFromCart = async (
  userId: number,
  data: RemoveFromCartRequest
): Promise<CartResponse> => {
  const response = await apiClient.delete<ApiResponseWrapper<CartResponse>>(`/api/cart/${userId}`, {
    data,
  });
  return response.data.data;
};

/**
 * 11. 장바구니 결제
 * POST /api/cart/{userId}/order
 */
export const orderCart = async (
  userId: number
): Promise<unknown> => {
  const response = await apiClient.post(`/api/cart/${userId}/order`);
  return response.data;
};

