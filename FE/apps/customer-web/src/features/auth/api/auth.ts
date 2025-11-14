import { apiClient } from '@/shared/api/client'
import type { ApiResponseWrapper } from '@/shared/types/common'
import type { KakaoLoginResponse } from '../type/auth'

/**
 * 카카오 소셜 로그인
 * GET /api/auth/social/kakao
 *
 * @param code - 카카오 인증 코드
 */
export const kakaoLogin = async (code: string): Promise<KakaoLoginResponse> => {
	const response = await apiClient.get<ApiResponseWrapper<KakaoLoginResponse>>(
		`/api/auth/social/kakao`
	)
	return response.data.data
}
