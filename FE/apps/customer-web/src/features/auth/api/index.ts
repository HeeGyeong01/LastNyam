import { apiClient } from '@/shared/api/client';
import type { ApiResponseWrapper } from '@/shared/types/common';

/**
 * 온보딩 프로필 업데이트 응답 타입
 */
export interface UserOnboardingResponseDto {
  userId: number;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * 온보딩 프로필 업데이트 요청 타입
 */
export interface UserOnboardingRequestDto {
  categoryIds: number[]; // 선택한 카테고리 ID 리스트 (1~5개)
}

/**
 * 온보딩 프로필 업데이트
 * POST /api/{userId}/profile/onboarding
 *
 * @param userId - 사용자 ID
 * @param categoryIds - 선택한 카테고리 ID 리스트 (1~5개)
 */
export const updateOnboardingProfile = async (
  userId: number,
  categoryIds: number[]
): Promise<UserOnboardingResponseDto> => {
  const request: UserOnboardingRequestDto = {
    categoryIds,
  };

  const response = await apiClient.post<ApiResponseWrapper<UserOnboardingResponseDto>>(
    `/api/user/${userId}/profile/onboarding`,
    request
  );

  // 응답 구조: { data: { userId, ... }, status, code, message }
  return response.data.data;
};

/**
 * 로그아웃
 * GET /api/auth/logout
 *
 * 헤더에 Authorization 토큰이 자동으로 포함됩니다 (apiClient interceptor)
 */
export const logout = async (): Promise<void> => {
  await apiClient.get('/api/auth/logout');
};
