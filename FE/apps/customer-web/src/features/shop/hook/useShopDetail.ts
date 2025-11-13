import { useQuery } from '@tanstack/react-query';
import { getShopDetail } from '../api/shop';

interface UseShopDetailOptions {
  shopId: number;
  lat?: number;
  lng?: number;
}

/**
 * 가게 상세 정보를 가져오는 React Query 훅
 * 
 * @param shopId - 가게 ID
 * @param lat - 위도 (선택, 없으면 API 함수에서 자동으로 가져옴)
 * @param lng - 경도 (선택, 없으면 API 함수에서 자동으로 가져옴)
 */
export function useShopDetail({ shopId, lat, lng }: UseShopDetailOptions) {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shop', 'detail', shopId, lat, lng],
    queryFn: () => getShopDetail(shopId, {
      ...(lat && lng ? { lat, lng } : {}),
    }),
    enabled: !!shopId, // shopId가 있을 때만 쿼리 실행
  });

  return {
    shopDetail: data,
    loading,
    error: error as Error | null,
    refetch,
  };
}

