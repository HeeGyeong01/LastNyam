import { apiClient } from '@/shared/api/client';
import { getLocation } from '@/shared/lib/geolocation';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  FoocketingListData,
  FoocketingDetail,
  FoocketingEntryResponse,
  FoocketingResult,
  FoocketingSortType,
  FoocketingCategory,
  FoocketingSearchData,
  RecommendedFoocketingListData,
} from '../type/foocketing';
import type { ApiResponseWrapper } from '@/shared/types/common';

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
    userId?: number
  } = {}
): Promise<FoocketingDetail> => {
  const finalUserId = params?.userId ?? useAuthStore.getState().userId ?? 0; // null이면 0로 고정

  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();
    
  const response = await apiClient.get<ApiResponseWrapper<FoocketingDetail>>(`/api/foocketing/${foocketingId}` , {
    params: {
      lat: location.lat,
      lng: location.lng,
      userId: finalUserId,
      },
    }
  );
  return response.data.data;
};

/**
 * 3. 푸켓팅 참여하기
 * POST /api/entry/foocketing/{foocketingId}
 */
export const enterFoocketing = async (
  foocketingId: number
): Promise<FoocketingEntryResponse> => {
  // const userId = 3; // userId를 3으로 고정 (주석처리)
  const userId = useAuthStore.getState().userId;
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }
  const response = await apiClient.post<ApiResponseWrapper<FoocketingEntryResponse>>(
    `/api/entry/foocketing/${foocketingId}`,
    { userId }
  );
  return response.data.data;
};

/**
 * 4. 푸켓팅 결과 조회
 * GET /api/foocketing/{foocketingId}/result?userId={userId}&lat={lat}&lng={lng}
 */
export const getFoocketingResult = async (
  foocketingId: number,
  params?: {
    userId?: number;
    lat?: number;
    lng?: number;
  }
): Promise<FoocketingResult> => {
  // const finalUserId = 3; // userId를 3으로 고정 (주석처리)
  const finalUserId = params?.userId ?? useAuthStore.getState().userId;
  if (!finalUserId) {
    throw new Error('로그인이 필요합니다.');
  }
  
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params?.lat && params?.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();
  
  const response = await apiClient.get<ApiResponseWrapper<FoocketingResult>>(
    `/api/foocketing/${foocketingId}/result`,
    {
      params: {
        userId: finalUserId,
        lat: location.lat,
        lng: location.lng,
      },
    }
  );
  return response.data.data;
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

/**
 * 6. 푸켓팅 추천 목록 조회
 * GET /api/foocketing/recommendation/{userId}?lat={latitude}&lng={longitude}
 * 
 * @param params.userId - 사용자 ID (선택, 없으면 store에서 가져오거나 기본값 사용)
 * @param params.lat - 위도 (선택, 없으면 자동으로 가져옴)
 * @param params.lng - 경도 (선택, 없으면 자동으로 가져옴)
 */
export const getRecommendedFoocketingList = async (
  params: {
    userId?: number;
    lat?: number;
    lng?: number;
  } = {}
): Promise<RecommendedFoocketingListData> => {
  // 로그인하지 않아도 조회 가능하므로, userId가 없으면 0으로 설정
  const userId = params.userId ?? useAuthStore.getState().userId ?? 0;
  
  // 위치 정보가 없으면 자동으로 가져오기
  const location = params.lat && params.lng 
    ? { lat: params.lat, lng: params.lng }
    : await getLocation();

  const response = await apiClient.get<ApiResponseWrapper<RecommendedFoocketingListData>>(
    `/api/foocketing/recommendation/${userId}`,
    {
      params: {
        lat: location.lat,
        lng: location.lng,
      },
    }
  );
  return response.data.data;
};

/**
 * 서버 시간 조회
 * GET /api/time
 * 
 * 네트워크 지연을 고려하여 정확한 서버 시간을 반환합니다.
 * 
 * @returns 서버의 현재 시간 (ISO 8601 형식)
 */
export const getServerTime = async (): Promise<string> => {
  const requestStartTime = Date.now();
  
  const response = await apiClient.get<ApiResponseWrapper<{ currentTime: string }>>('/api/time');
  
  const requestEndTime = Date.now();
  const networkLatency = (requestEndTime - requestStartTime) / 2; // 왕복 지연의 절반
  const estimatedServerTimeAtRequest = new Date(response.data.data.currentTime).getTime() - networkLatency;
  
  // 네트워크 지연을 고려한 서버 시간 반환
  return new Date(estimatedServerTimeAtRequest).toISOString();
};

