import { useState, useEffect, useCallback } from 'react';
import { addFavorite, removeFavorite } from '../api/favorite';
import { useAuthStore } from '@/store/useAuthStore';
import { getShopDetail } from '@/features/shop/api/shop';

/**
 * 찜하기/찜취소를 위한 훅
 * 찜 상태와 찜 개수를 항상 최신 상태로 관리
 * 
 * @param shopId - 가게 ID
 */
export function useFavorite(shopId: number) {
  const userId = useAuthStore((state) => state.userId);
  const [favorited, setFavorited] = useState(false);
  const [ratingCount, setRatingCount] = useState(0);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // 찜 상태 가져오기
  const fetchFavoriteStatus = useCallback(async () => {
    if (!shopId) return;
    
    setIsLoadingFavorite(true);
    try {
      const shopDetail = await getShopDetail(shopId);
      setFavorited(shopDetail.favorited ?? false);
      setRatingCount(shopDetail.ratingCount ?? 0);
    } catch (error) {
      console.error('찜 상태 조회 실패:', error);
    } finally {
      setIsLoadingFavorite(false);
    }
  }, [shopId]);

  // 컴포넌트 마운트 시 찜 상태 가져오기
  useEffect(() => {
    fetchFavoriteStatus();
  }, [fetchFavoriteStatus]);

  // 찜하기 함수
  const handleAddFavorite = useCallback(async () => {
    if (!userId) {
      console.error('로그인이 필요합니다.');
      return;
    }

    setIsAdding(true);
    try {
      await addFavorite(shopId, userId);
      // Optimistic Update
      setFavorited(true);
      setRatingCount((prev) => prev + 1);
      // 최신 상태 다시 가져오기
      await fetchFavoriteStatus();
    } catch (error) {
      console.error('찜하기 실패:', error);
      // 에러 발생 시 이전 상태로 롤백
      await fetchFavoriteStatus();
    } finally {
      setIsAdding(false);
    }
  }, [shopId, userId, fetchFavoriteStatus]);

  // 찜취소 함수
  const handleRemoveFavorite = useCallback(async () => {
    if (!userId) {
      console.error('로그인이 필요합니다.');
      return;
    }

    setIsRemoving(true);
    try {
      await removeFavorite(shopId, userId);
      // Optimistic Update
      setFavorited(false);
      setRatingCount((prev) => Math.max(0, prev - 1));
      // 최신 상태 다시 가져오기
      await fetchFavoriteStatus();
    } catch (error) {
      console.error('찜취소 실패:', error);
      // 에러 발생 시 이전 상태로 롤백
      await fetchFavoriteStatus();
    } finally {
      setIsRemoving(false);
    }
  }, [shopId, userId, fetchFavoriteStatus]);

  // 찜하기 토글 함수
  const toggleFavorite = useCallback(() => {
    if (favorited) {
      handleRemoveFavorite();
    } else {
      handleAddFavorite();
    }
  }, [favorited, handleAddFavorite, handleRemoveFavorite]);

  return {
    addFavorite: handleAddFavorite,
    removeFavorite: handleRemoveFavorite,
    toggleFavorite,
    favorited,
    ratingCount,
    isLoadingFavorite,
    isAdding,
    isRemoving,
    isPending: isAdding || isRemoving,
  };
}

