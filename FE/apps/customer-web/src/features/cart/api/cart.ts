import { apiClient } from '@/shared/api/client';
import type { ApiResponseWrapper } from '@/shared/types/common';

export interface CartOrderResponse {
  orderId: number | null;
  userId: number;
  totalPrice: number;
  paymentStatus: 'PENDING_APPROVAL' | 'APPROVED' | string;
  tid: string;
  aid?: string;
  approvedAt?: string;
  partnerOrderId?: string;
  nextRedirectAppUrl?: string;
  nextRedirectMobileUrl?: string;
  nextRedirectPcUrl?: string;
}

export const orderCart = async (userId: number): Promise<CartOrderResponse> => {
  const res = await apiClient.post<ApiResponseWrapper<CartOrderResponse>>(
    `/api/cart/${userId}/order`
  );
  return res.data.data;
};


