import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../api/favorite';
import { useAuthStore } from '@/store/useAuthStore';

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

