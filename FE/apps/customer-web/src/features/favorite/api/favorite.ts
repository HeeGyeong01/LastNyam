import { apiClient } from '@/shared/api/client';
import { getLocation } from '@/shared/lib/geolocation';
import { useAuthStore } from '@/store/useAuthStore';
import type { FavoriteShopListData } from '../type/favorite';
import type { ApiResponseWrapper } from '@/shared/types/common';

/**
 * 찜한 가게 목록 조회
 * GET /api/user/{userId}/favorite?lat={latitude}&lng={longitude}&cursor={cursor}
 * 
 * @param userId - 사용자 ID (선택, 없으면 store에서 가져옴)
 * @param params.cursor - 커서 값 (무한 스크롤용, 선택)
 * @param params.lat - 위도 (선택, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (선택, 없으면 자동으로 가져옴)
 */
export const getFavoriteShops = async (
  userId?: number,
  params: {
    cursor?: string | null;
    lat?: number;
    lng?: number;
  } = {}
): Promise<FavoriteShopListData> => {
  // const finalUserId = userId ?? useAuthStore.getState().userId ?? 2; // null이면 2로 고정;
  const finalUserId = userId ?? useAuthStore.getState().userId;
  if (!finalUserId) {
    throw new Error('로그인이 필요합니다.');
  }
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();

  const response = await apiClient.get<ApiResponseWrapper<FavoriteShopListData>>(
    `/api/user/${finalUserId}/favorite`,
    {
      params: {
        lat: location.lat,
        lng: location.lng,
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }
  );
  return response.data.data;
};

