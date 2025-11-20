import { useQuery } from '@tanstack/react-query';
import { getShopDetail } from '../api/shop';
import { useAuthStore } from '@/store/useAuthStore';

interface UseShopDetailOptions {
  shopId: number;
  lat?: number;
  lng?: number;
  userId?: number;
}

/**
 * 가게 상세 정보를 가져오는 React Query 훅
 * 
 * @param shopId - 가게 ID
 * @param lat - 위도 (선택, 없으면 API 함수에서 자동으로 가져옴)
 * @param lng - 경도 (선택, 없으면 API 함수에서 자동으로 가져옴)
 * @param userId - 사용자 ID (선택, 없으면 store에서 가져옴, 찜 상태를 위해 필요, 없으면 body에 포함하지 않음)
 */
export function useShopDetail({ shopId, lat, lng, userId }: UseShopDetailOptions) {
  const storeUserId = useAuthStore((state) => state.userId);
  const finalUserId = userId ?? storeUserId ?? undefined;
  
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shop', 'detail', shopId, lat, lng, finalUserId],
    queryFn: () => getShopDetail(shopId, {
      ...(lat && lng ? { lat, lng } : {}),
      ...(finalUserId ? { userId: finalUserId } : {}),
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

