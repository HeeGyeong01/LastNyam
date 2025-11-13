import { apiClient } from '@/shared/api/client';
import { getLocation } from '@/shared/lib/geolocation';
import type {
  DiscountListData,
  DiscountCategory,
  DiscountSortType,
  DiscountSearchData,
} from '../type/discount';
import type { ApiResponseWrapper } from '@/shared/types/common';

/**
 * 마감세일 목록 조회
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

/**
 * 마감세일 검색
 * GET /api/discounts/search?keyword={keyword}&sort={sortType}&lat={latitude}&lng={longitude}&cursor={cursor}
 * 
 * @param params.keyword - 검색어 (필수)
 * @param params.sort - 정렬 방식 (필수): FAVORITES, RATING, CLOSEST, DISCOUNT, PRICE
 * @param params.cursor - 커서 값 (무한 스크롤용, 선택)
 * @param params.lat - 위도 (필수, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (필수, 없으면 자동으로 가져옴)
 */
export const searchDiscount = async (
  params: {
    keyword: string;
    sort: DiscountSortType;
    cursor?: string | null;
    lat?: number;
    lng?: number;
  }
): Promise<DiscountSearchData> => {
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();

  const response = await apiClient.get<ApiResponseWrapper<DiscountSearchData>>(
    '/api/discount/search',
    {
      params: {
        keyword: params.keyword,
        sort: params.sort,
        lat: location.lat,
        lng: location.lng,
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }
  );
  return response.data.data;
};

