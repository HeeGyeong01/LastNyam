import { apiClient } from '@/shared/api/client';
import type { FoocketingTransactionList } from '../type/foocketingTransaction';
import type { ApiResponseWrapper } from '@/shared/types/common';

/**
 * 푸켓팅 주문 내역 조회
 * GET /api/user/{userId}/transaction/foocketing
 * 
 * @param userId - 사용자 ID
 */
export const getFoocketingTransactions = async (
  userId: number
): Promise<FoocketingTransactionList> => {
  const response = await apiClient.get<ApiResponseWrapper<FoocketingTransactionList>>(
    `/api/user/${userId}/transaction/foocketing`
  );
  return response.data.data;
};

