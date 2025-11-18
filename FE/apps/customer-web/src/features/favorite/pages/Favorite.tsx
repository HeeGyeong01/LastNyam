import { useEffect, useState, useCallback } from 'react';
import { PageHeader, EmptyState } from '@/shared/components';
import { ShopList } from '@/features/shop/component';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { getFavoriteShops } from '@/features/favorite/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { FavoriteShop } from '@/features/favorite/type';
import catImage from '@/shared/assets/lastnyam-cat-sad.png';

export default function Favorite() {
  const userId = useAuthStore((state) => state.userId);
  const [shops, setShops] = useState<FavoriteShop[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 첫 페이지 데이터 가져오기
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setError(null);
      getFavoriteShops()
        .then((data) => {
          setShops(data.content);
          setNextCursor(data.nextCursor);
          setHasNextPage(data.hasNextPage);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error('알 수 없는 에러'));
          setIsLoading(false);
        });
    }
  }, [userId]);

  // 다음 페이지 데이터 가져오기
  const loadMore = useCallback(async () => {
    if (!nextCursor || !hasNextPage || isLoadingMore || !userId) return;

    setIsLoadingMore(true);
    try {
      const data = await getFavoriteShops(undefined, { cursor: nextCursor });
      setShops((prev) => [...prev, ...data.content]);
      setNextCursor(data.nextCursor);
      setHasNextPage(data.hasNextPage);
    } catch (error) {
      console.error('Failed to load more shops:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, hasNextPage, isLoadingMore, userId]);

  // 무한 스크롤
  const observerTarget = useInfiniteScroll({
    hasNextPage,
    isLoading: isLoadingMore,
    onLoadMore: loadMore,
  });

  return (
    <>
      <PageHeader title="찜" variant="light" />
      <div className="px-4 pb-4">
        {isLoading && <p className="py-4 text-center">로딩 중...</p>}
        {error && (
          <p className="py-4 text-center text-red-500">
            에러: {error instanceof Error ? error.message : '알 수 없는 에러'}
          </p>
        )}
        {!isLoading && !error && shops.length === 0 && (
          <EmptyState 
            message="찜한 가게가 아직 없다냥…🐾"
            imageUrl={catImage}
          />
        )}
        {!isLoading && !error && shops.length > 0 && (
          <>
            <ShopList shops={shops} className="pt-6" />
            {/* 무한 스크롤 감지용 요소 */}
            <div ref={observerTarget} className="h-4" />
            {isLoadingMore && (
              <p className="py-4 text-center text-gray-500">더 불러오는 중...</p>
            )}
          </>
        )}
      </div>
    </>
  );
}
