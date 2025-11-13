import { apiClient } from './client';
import { getLocation } from '@/lib/geolocation';
import type {
  DiscountListData,
  DiscountCategory,
  DiscountSortType,
  ApiResponseWrapper,
} from '@/types';

/**
 * 5. 마감세일 목록 조회
 * GET /api/discount?category={category}&sort={sortType}&lat={latitude}&lng={longitude}
 * 
 * @param params.lat - 위도 (선택, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (선택, 없으면 자동으로 가져옴)
 */
export const getDiscountList = async (
  params: {
    category?: DiscountCategory;
    sort?: DiscountSortType;
    lat?: number;
    lng?: number;
  } = {}
): Promise<DiscountListData> => {
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();

  const response = await apiClient.get<ApiResponseWrapper<DiscountListData>>('/api/discount', {
    params: {
      ...params,
      lat: location.lat,
      lng: location.lng,
    },
  });
  // 응답 구조: { data: { content: [], nextCursor, hasNextPage }, status, code, message }
  return response.data.data;
};

