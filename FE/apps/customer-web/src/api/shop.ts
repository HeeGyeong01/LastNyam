import { apiClient } from './client';
import type { ShopDetail } from '@/types';

/**
 * 6. 특정 가게 조회
 * GET /api/shop/{shopId}
 */
export const getShopDetail = async (shopId: number): Promise<ShopDetail> => {
  const response = await apiClient.get(`/api/shop/${shopId}`);
  return response.data;
};

