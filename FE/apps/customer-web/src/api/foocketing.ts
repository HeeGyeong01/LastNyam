import { apiClient } from './client';
import { getLocation } from '@/lib/geolocation';
import type {
  FoocketingListData,
  FoocketingDetail,
  FoocketingEntryResponse,
  FoocketingResult,
  FoocketingSortType,
  FoocketingCategory,
  FoocketingSearchData,
  ApiResponseWrapper,
} from '@/types';

/**
 * 1. 푸켓팅 목록 조회
 * GET /api/foocketing?sort={sortType}&lat={latitude}&lng={longitude}
 * 
 * @param params.sort - 정렬 타입 (선택)
 * @param params.lat - 위도 (선택, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (선택, 없으면 자동으로 가져옴)
 */
export const getFoocketingList = async (
  params: {
    category?: FoocketingCategory;
    sort?: FoocketingSortType;
    lat?: number;
    lng?: number;
  } = {}
): Promise<FoocketingListData> => {
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();

  const response = await apiClient.get<ApiResponseWrapper<FoocketingListData>>('/api/foocketing', {
    params: {
      ...(params.category ? { category: params.category } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
      lat: location.lat,
      lng: location.lng,
    },
  });
  // 응답 구조: { data: { content: [], nextCursor, hasNextPage }, status, code, message }
  return response.data.data;
};

/**
 * 2. 푸켓팅 상세 조회
 * GET /api/foocketing/{foocketingId}
 */
export const getFoocketingDetail = async (
  foocketingId: number,
  params: {
    lat?: number;
    lng?: number;
  } = {}
): Promise<FoocketingDetail> => {
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();
    
  const response = await apiClient.get<ApiResponseWrapper<FoocketingDetail>>(`/api/foocketing/${foocketingId}` , {
    params: {
      lat: location.lat,
      lng: location.lng,
      },
    }
  );
  return response.data.data;
};

/**
 * 3. 푸켓팅 참여하기
 * POST /api/entry/foocketing/{foocketingId}
 */
export const entryFoocketing = async (
  foocketingId: number
): Promise<FoocketingEntryResponse> => {
  const response = await apiClient.post(
    `/api/entry/foocketing/${foocketingId}`
  );
  return response.data;
};

/**
 * 4. 푸켓팅 결과 조회
 * GET /api/foocketing/{foocketingId}/result?userId={userId}
 */
export const getFoocketingResult = async (
  foocketingId: number,
  userId: number
): Promise<FoocketingResult> => {
  const response = await apiClient.get(
    `/api/foocketing/${foocketingId}/result`,
    {
      params: { userId },
    }
  );
  return response.data;
};

/**
 * 5. 푸켓팅 검색
 * GET /api/foocketing/search?sort={sortType}&lat={latitude}&lng={longitude}&keyword={keyword}&cursor={cursor}
 * 
 * @param params.sort - 정렬 타입 (필수): IMMINENT, CLOSEST, PRICE
 * @param params.keyword - 검색어 (필수)
 * @param params.cursor - 커서 값 (무한 스크롤용, 선택)
 * @param params.lat - 위도 (필수, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (필수, 없으면 자동으로 가져옴)
 */
export const searchFoocketing = async (
  params: {
    sort: FoocketingSortType;
    keyword: string;
    cursor?: string | null;
    lat?: number;
    lng?: number;
  }
): Promise<FoocketingSearchData> => {
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();

  const response = await apiClient.get<ApiResponseWrapper<FoocketingSearchData>>(
    '/api/foocketing/search',
    {
      params: {
        sort: params.sort,
        keyword: params.keyword,
        lat: location.lat,
        lng: location.lng,
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }
  );
  return response.data.data;
};

