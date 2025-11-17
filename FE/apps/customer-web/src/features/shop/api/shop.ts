import { apiClient } from '@/shared/api/client';
import { getLocation } from '@/shared/lib/geolocation';
import type { ShopDetail } from '../type/shop';
import type { ApiResponseWrapper } from '@/shared/types/common';

/**
 * 특정 가게 조회
 * GET /api/shop/{shopId}?lat={latitude}&lng={longitude}&userId={userId}
 * 
 * @param shopId - 가게 ID
 * @param params.lat - 위도 (선택, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (선택, 없으면 자동으로 가져옴)
 * @param params.userId - 사용자 ID (선택, 찜 상태를 위해 필요, 없으면 쿼리 파라미터에 포함하지 않음)
 */
export const getShopDetail = async (
  shopId: number,
  params: {
    lat?: number;
    lng?: number;
    userId?: number;
  } = {}
): Promise<ShopDetail> => {
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();
    
  const response = await apiClient.get<ApiResponseWrapper<ShopDetail>>(`/api/shop/${shopId}`, {
    params: {
      lat: location.lat,
      lng: location.lng,
      ...(params.userId ? { userId: params.userId } : {}), // userId가 있으면 쿼리 파라미터에 포함
    },
  });
  return response.data.data;
};

