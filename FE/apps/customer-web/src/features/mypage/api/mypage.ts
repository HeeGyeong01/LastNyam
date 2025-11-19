import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserInfo } from '../type/mypage';
import type { ApiResponseWrapper } from '@/shared/types/common';

/**
 * 사용자 정보 조회
 * GET /api/user/{userId}/info
 * 
 * @param userId - 사용자 ID (선택, 없으면 store에서 가져옴)
 */
export const getUserInfo = async (userId?: number): Promise<UserInfo> => {
  const finalUserId = userId ?? useAuthStore.getState().userId;
  if (!finalUserId) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await apiClient.get<ApiResponseWrapper<UserInfo>>(
    `/api/user/${finalUserId}/info`
  );

  return response.data.data;
};

