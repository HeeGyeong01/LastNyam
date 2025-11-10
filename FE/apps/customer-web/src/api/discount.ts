import { apiClient } from './client';
import type {
  DiscountListResponse,
  DiscountCategory,
  DiscountSortType,
} from '@/types';

/**
 * 5. 마감세일 목록 조회
 * GET /api/discount?category={category}&sort={sortType}&lat={latitude}&lng={longitude}
 */
export const getDiscountList = async (
  params: {
    category?: DiscountCategory;
    sort?: DiscountSortType;
    lat?: number;
    lng?: number;
  } = {}
): Promise<DiscountListResponse> => {
  const response = await apiClient.get('/api/discount', { params });
  return response.data;
};

