import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../api/favorite';
import { useAuthStore } from '@/store/useAuthStore';
import type { ShopDetail } from '@/features/shop/type';

/**
 * 찜하기/찜취소를 위한 React Query mutation 훅
 * 
 * @param shopId - 가게 ID
 */
export function useFavorite(shopId: number) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  // 찜하기 mutation
  const addFavoriteMutation = useMutation({
    mutationFn: () => addFavorite(shopId, userId ?? undefined),
    onMutate: async () => {
      // Optimistic Update: 즉시 UI 업데이트
      await queryClient.cancelQueries({ queryKey: ['shop', 'detail', shopId] });
      
      const previousData = queryClient.getQueryData<ShopDetail>(['shop', 'detail', shopId]);
      
      if (previousData) {
        queryClient.setQueryData<ShopDetail>(['shop', 'detail', shopId], {
          ...previousData,
          favorited: true,
        });
      }
      
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['shop', 'detail', shopId], context.previousData);
      }
    },
    onSuccess: () => {
      // ShopDetail 쿼리 캐시 무효화하여 최신 데이터 가져오기
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
      await queryClient.cancelQueries({ queryKey: ['shop', 'detail', shopId] });
      
      const previousData = queryClient.getQueryData<ShopDetail>(['shop', 'detail', shopId]);
      
      if (previousData) {
        queryClient.setQueryData<ShopDetail>(['shop', 'detail', shopId], {
          ...previousData,
          favorited: false,
        });
      }
      
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['shop', 'detail', shopId], context.previousData);
      }
    },
    onSuccess: () => {
      // ShopDetail 쿼리 캐시 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ['shop', 'detail', shopId] });
      // 찜한 가게 목록도 무효화
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['favorite', 'shops', userId] });
      }
    },
  });

  return {
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    isAdding: addFavoriteMutation.isPending,
    isRemoving: removeFavoriteMutation.isPending,
    isPending: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
  };
}

