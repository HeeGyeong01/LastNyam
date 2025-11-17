import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../api/favorite';
import { useAuthStore } from '@/store/useAuthStore';
import { getShopDetail } from '@/features/shop/api/shop';
import type { ShopDetail } from '@/features/shop/type';

/**
 * 찜하기/찜취소를 위한 React Query mutation 훅
 * 찜 상태와 찜 개수를 항상 최신 상태로 관리
 * 
 * @param shopId - 가게 ID
 */
export function useFavorite(shopId: number) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  
  // 찜 상태와 찜 개수를 항상 최신으로 가져오기 위한 별도 쿼리
  // ShopDetail은 캐싱되지만, 찜 관련 정보는 항상 최신 상태 유지
  const {
    data: favoriteData,
    isLoading: isLoadingFavorite,
  } = useQuery({
    queryKey: ['shop', 'favorite', shopId],
    queryFn: () => getShopDetail(shopId),
    enabled: !!shopId,
    staleTime: 0, // 항상 최신 상태 유지
    refetchOnMount: 'always', // 마운트 시 항상 최신 데이터 가져오기
    select: (data: ShopDetail) => ({
      favorited: data.favorited ?? false,
      ratingCount: data.ratingCount ?? 0,
    }),
  });
  
  // favoriteData가 없으면 undefined를 반환하여 로딩 상태를 명확히 함
  const favorited = favoriteData?.favorited ?? false;
  const ratingCount = favoriteData?.ratingCount ?? 0;
  
  // 디버깅용 (개발 환경에서만)
  if (import.meta.env.DEV) {
    console.log('[useFavorite]', { shopId, favoriteData, favorited, ratingCount, isLoadingFavorite });
  }

  // 찜하기 mutation
  const addFavoriteMutation = useMutation({
    mutationFn: () => addFavorite(shopId, userId ?? undefined),
    onMutate: async () => {
      // Optimistic Update: 즉시 UI 업데이트
      await queryClient.cancelQueries({ queryKey: ['shop', 'favorite', shopId] });
      
      // 찜 상태 쿼리 데이터 가져오기
      const previousFavoriteData = queryClient.getQueryData<{ favorited: boolean; ratingCount: number }>(['shop', 'favorite', shopId]);
      
      console.log('[addFavorite onMutate] Optimistic Update:', {
        shopId,
        previousFavoriteData,
        '업데이트 후': { favorited: true, ratingCount: (previousFavoriteData?.ratingCount ?? 0) + 1 },
      });
      
      // 찜 상태 쿼리 업데이트 (찜하기: favorited = true, ratingCount + 1)
      if (previousFavoriteData) {
        queryClient.setQueryData(['shop', 'favorite', shopId], {
          favorited: true,
          ratingCount: previousFavoriteData.ratingCount + 1,
        });
      }
      
      return { previousFavoriteData };
    },
    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousFavoriteData) {
        queryClient.setQueryData(['shop', 'favorite', shopId], context.previousFavoriteData);
      }
    },
    onSuccess: (data) => {
      console.log('[addFavorite onSuccess] 찜하기 성공:', {
        shopId,
        response: data,
      });
      
      // 찜 상태 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ['shop', 'favorite', shopId] });
      // ShopDetail 쿼리도 무효화 (찜 개수 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['shop', 'detail', shopId] });
      // 찜한 가게 목록도 무효화
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['favorite', 'shops', userId] });
      }
    },
  });

  // 찜취소 mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: () => removeFavorite(shopId, userId ?? undefined),
    onMutate: async () => {
      // Optimistic Update: 즉시 UI 업데이트
      await queryClient.cancelQueries({ queryKey: ['shop', 'favorite', shopId] });
      
      // 찜 상태 쿼리 데이터 가져오기
      const previousFavoriteData = queryClient.getQueryData<{ favorited: boolean; ratingCount: number }>(['shop', 'favorite', shopId]);
      
      console.log('[removeFavorite onMutate] Optimistic Update:', {
        shopId,
        previousFavoriteData,
        '업데이트 후': { favorited: false, ratingCount: Math.max(0, (previousFavoriteData?.ratingCount ?? 0) - 1) },
      });
      
      // 찜 상태 쿼리 업데이트 (찜취소: favorited = false, ratingCount - 1)
      if (previousFavoriteData) {
        queryClient.setQueryData(['shop', 'favorite', shopId], {
          favorited: false,
          ratingCount: Math.max(0, previousFavoriteData.ratingCount - 1),
        });
      }
      
      return { previousFavoriteData };
    },
    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousFavoriteData) {
        queryClient.setQueryData(['shop', 'favorite', shopId], context.previousFavoriteData);
      }
    },
    onSuccess: (data) => {
      console.log('[removeFavorite onSuccess] 찜취소 성공:', {
        shopId,
        response: data,
      });
      
      // 찜 상태 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ['shop', 'favorite', shopId] });
      // ShopDetail 쿼리도 무효화 (찜 개수 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['shop', 'detail', shopId] });
      // 찜한 가게 목록도 무효화
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['favorite', 'shops', userId] });
      }
    },
  });

  // 찜하기 토글 함수 (현재 찜 상태를 자동으로 확인)
  const toggleFavorite = () => {
    // 최신 상태를 다시 읽어옴 (캐시에서 직접)
    const currentFavoriteData = queryClient.getQueryData<{ favorited: boolean; ratingCount: number }>(['shop', 'favorite', shopId]);
    const currentFavorited = currentFavoriteData?.favorited ?? favorited;
    
    console.log('[toggleFavorite] 찜 상태 확인:', {
      shopId,
      'currentFavoriteData': currentFavoriteData,
      'currentFavorited': currentFavorited,
      'favorited (hook state)': favorited,
      'action': currentFavorited ? '찜취소 (DELETE)' : '찜하기 (POST)',
    });
    
    if (currentFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  return {
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    toggleFavorite, // 토글 함수
    favorited, // 현재 찜하기 상태 (항상 최신)
    ratingCount, // 찜 개수 (항상 최신)
    isLoadingFavorite, // 찜 상태 로딩 중
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
    isPending: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
  };
}

