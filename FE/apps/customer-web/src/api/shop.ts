import { apiClient } from './client';
import { getLocation } from '@/lib/geolocation';
import type { ShopDetail, ApiResponseWrapper } from '@/types';

/**
 * 특정 가게 조회
 * GET /api/shop/{shopId}?lat={latitude}&lng={longitude}
 * 
 * @param shopId - 가게 ID
 * @param params.lat - 위도 (선택, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (선택, 없으면 자동으로 가져옴)
 */
export const getShopDetail = async (
  shopId: number,
  params: {
    lat?: number;
    lng?: number;
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
    },
  });
  return response.data.data;
};

