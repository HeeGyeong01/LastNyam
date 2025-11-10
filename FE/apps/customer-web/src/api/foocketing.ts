import { apiClient } from './client';
import type {
  FoocketingListResponse,
  FoocketingDetail,
  FoocketingEntryResponse,
  FoocketingResult,
  FoocketingSortType,
} from '@/types';

/**
 * 1. 푸켓팅 목록 조회
 * GET /api/foocketing?sort={sortType}&lat={latitude}&lng={longitude}
 */
export const getFoocketingList = async (
  params: {
    sort?: FoocketingSortType;
    lat?: number;
    lng?: number;
  } = {}
): Promise<FoocketingListResponse> => {
  const response = await apiClient.get('/api/foocketing', { params });
  return response.data;
};

/**
 * 2. 푸켓팅 상세 조회
 * GET /api/foocketing/{foocketingId}
 */
export const getFoocketingDetail = async (
  foocketingId: number
): Promise<FoocketingDetail> => {
  const response = await apiClient.get(`/api/foocketing/${foocketingId}`);
  return response.data;
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

