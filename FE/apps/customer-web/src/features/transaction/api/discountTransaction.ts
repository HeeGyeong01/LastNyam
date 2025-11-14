import { apiClient } from '@/shared/api/client';
import type { DiscountTransactionList } from '../type/discountTransaction';
import type { ApiResponseWrapper } from '@/shared/types/common';

/**
 * 마감세일 주문 내역 조회
 * GET /api/user/{userId}/transaction/discount
 * 
 * @param userId - 사용자 ID
 */
export const getDiscountTransactions = async (
  userId: number
): Promise<DiscountTransactionList> => {
  const response = await apiClient.get<ApiResponseWrapper<DiscountTransactionList>>(
    `/api/user/${userId}/transaction/discount`
  );
  return response.data.data;
};

