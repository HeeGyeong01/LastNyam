import { apiClient } from './client';
import { getLocation } from '@/lib/geolocation';
import type { FavoriteShopListData, ApiResponseWrapper } from '@/types';

/**
 * 찜한 가게 목록 조회
 * GET /api/user/{userId}/favorite?lat={latitude}&lng={longitude}&cursor={cursor}
 * 
 * @param userId - 사용자 ID (현재는 2로 하드코딩)
 * @param params.cursor - 커서 값 (무한 스크롤용, 선택)
 * @param params.lat - 위도 (선택, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (선택, 없으면 자동으로 가져옴)
 */
export const getFavoriteShops = async (
  userId: number = 2,
  params: {
    cursor?: string | null;
    lat?: number;
    lng?: number;
  } = {}
): Promise<FavoriteShopListData> => {
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();

  const response = await apiClient.get<ApiResponseWrapper<FavoriteShopListData>>(
    `/api/user/${userId}/favorite`,
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

