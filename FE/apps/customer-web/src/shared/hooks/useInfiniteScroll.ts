import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  /**
   * 다음 페이지가 있는지 여부
   */
  hasNextPage: boolean;
  /**
   * 현재 로딩 중인지 여부
   */
  isLoading: boolean;
  /**
   * 다음 페이지를 로드하는 함수
   */
  onLoadMore: () => void | Promise<void>;
  /**
   * 무한 스크롤을 활성화할지 여부 (기본값: true)
   */
  enabled?: boolean;
  /**
   * IntersectionObserver의 threshold 옵션 (기본값: 0.1)
   */
  threshold?: number;
}

/**
 * 무한 스크롤을 구현하는 커스텀 훅
 * 
 * @param options - 무한 스크롤 옵션
 * @returns observerTarget - IntersectionObserver가 관찰할 DOM 요소의 ref
 * 
 * @example
 * ```tsx
 * const observerTarget = useInfiniteScroll({
 *   hasNextPage,
 *   isLoading: isLoadingMore,
 *   onLoadMore: loadMore,
 *   enabled: activeTab === 'discount',
 * });
 * 
 * return (
 *   <>
 *     <List items={items} />
 *     <div ref={observerTarget} className="h-4" />
 *   </>
 * );
 * ```
 */
export function useInfiniteScroll({
  hasNextPage,
  isLoading,
  onLoadMore,
  enabled = true,
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // enabled가 false이면 무한 스크롤 비활성화
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading) {
          onLoadMore();
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [enabled, hasNextPage, isLoading, onLoadMore, threshold]);

  return observerTarget;
}

