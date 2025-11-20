import { apiClient } from '@/shared/api/client';
import type { FoocketingTransactionList } from '../type/foocketingTransaction';
import type { ApiResponseWrapper } from '@/shared/types/common';
import type { TransactionQrImageResponse } from './discountTransaction';

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

/**
 * 푸켓팅 거래 QR 이미지 조회
 * GET /api/user/{userId}/transaction/foocketing/{transactionId}
 *
 * @param userId - 사용자 ID
 * @param transactionId - 거래 ID
 */
export const getFoocketingTransactionQrImage = async (
  userId: number,
  transactionId: number
): Promise<string> => {
  const response = await apiClient.get<ApiResponseWrapper<TransactionQrImageResponse>>(
    `/api/user/${userId}/transaction/foocketing/${transactionId}`
  );
  return response.data.data.transactionQrImage;
};
