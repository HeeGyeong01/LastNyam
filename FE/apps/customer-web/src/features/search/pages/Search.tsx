import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useLocation } from 'react-router-dom';
import { PageHeader } from '@/shared/components';
import { Tab } from '@shared/components/Tab';
import { Input } from '@shared/components/Input';
import { DiscountList } from '@/features/discount/component';
import { FoocketingList } from '@/features/foocketing/component';
import { searchDiscount } from '@/features/discount/api';
import { searchFoocketing } from '@/features/foocketing/api';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import type { DiscountSearchItem, DiscountSortType } from '@/features/discount/type';
import type { FoocketingSearchItem, FoocketingSortType } from '@/features/foocketing/type';
// Note: SearchTab type is defined locally in this file
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type SearchTab = 'discount' | 'foocketing';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const keywordFromUrl = searchParams.get('q') || '';
  const tabFromUrl = (searchParams.get('tab') || 'discount') as SearchTab;
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [activeTab, setActiveTab] = useState<SearchTab>(tabFromUrl);
  const [discountSort] = useState<DiscountSortType>('RATING');
  const [foocketingSort] = useState<FoocketingSortType>('IMMINENT');

  // 마감세일 검색 결과 상태
  const [discounts, setDiscounts] = useState<DiscountSearchItem[]>([]);
  const [discountNextCursor, setDiscountNextCursor] = useState<string | null>(null);
  const [discountHasNextPage, setDiscountHasNextPage] = useState(false);
  const [isLoadingMoreDiscount, setIsLoadingMoreDiscount] = useState(false);

  // 푸켓팅 검색 결과 상태
  const [foocketings, setFoocketings] = useState<FoocketingSearchItem[]>([]);
  const [foocketingNextCursor, setFoocketingNextCursor] = useState<string | null>(null);
  const [foocketingHasNextPage, setFoocketingHasNextPage] = useState(false);
  const [isLoadingMoreFoocketing, setIsLoadingMoreFoocketing] = useState(false);

  // 마감세일 검색 API 호출
  // refetchOnMount: false로 설정하여 뒤로가기 시 캐시된 데이터 사용
  // 새로고침 시에만 API를 다시 호출 (staleTime이 지나지 않았으면 캐시 사용)
  const {
    data: discountData,
    isLoading: isLoadingDiscount,
    error: discountError,
  } = useQuery({
    queryKey: ['search', 'discount', keyword, discountSort],
    queryFn: () => searchDiscount({
      keyword,
      sort: discountSort,
    }),
    enabled: keyword.length > 0,
    refetchOnMount: false, // 뒤로가기 시 캐시된 데이터 사용
    staleTime: Infinity, // 새로고침 시에만 API 호출
  });

  // 푸켓팅 검색 API 호출
  // refetchOnMount: false로 설정하여 뒤로가기 시 캐시된 데이터 사용
  // 새로고침 시에만 API를 다시 호출 (staleTime이 지나지 않았으면 캐시 사용)
  const {
    data: foocketingData,
    isLoading: isLoadingFoocketing,
    error: foocketingError,
  } = useQuery({
    queryKey: ['search', 'foocketing', keyword, foocketingSort],
    queryFn: () => searchFoocketing({
      keyword,
      sort: foocketingSort,
    }),
    enabled: keyword.length > 0,
    refetchOnMount: false, // 뒤로가기 시 캐시된 데이터 사용
    staleTime: Infinity, // 새로고침 시에만 API 호출
  });

  // 마감세일 검색 결과 설정
  useEffect(() => {
    if (discountData) {
      setDiscounts(discountData.content);
      setDiscountNextCursor(discountData.nextCursor);
      setDiscountHasNextPage(discountData.hasNextPage);
    }
  }, [discountData]);

  // 푸켓팅 검색 결과 설정
  useEffect(() => {
    if (foocketingData) {
      setFoocketings(foocketingData.content);
      setFoocketingNextCursor(foocketingData.nextCursor);
      setFoocketingHasNextPage(foocketingData.hasNextPage);
    }
  }, [foocketingData]);

  // 마감세일 다음 페이지 로드
  const loadMoreDiscount = useCallback(async () => {
    if (!discountNextCursor || !discountHasNextPage || isLoadingMoreDiscount || !keyword) return;

    setIsLoadingMoreDiscount(true);
    try {
      const data = await searchDiscount({
        keyword,
        sort: discountSort,
        cursor: discountNextCursor,
      });
      setDiscounts((prev) => [...prev, ...data.content]);
      setDiscountNextCursor(data.nextCursor);
      setDiscountHasNextPage(data.hasNextPage);
    } catch (error) {
      console.error('Failed to load more discounts:', error);
    } finally {
      setIsLoadingMoreDiscount(false);
    }
  }, [discountNextCursor, discountHasNextPage, isLoadingMoreDiscount, keyword, discountSort]);

  // 푸켓팅 다음 페이지 로드
  const loadMoreFoocketing = useCallback(async () => {
    if (!foocketingNextCursor || !foocketingHasNextPage || isLoadingMoreFoocketing || !keyword) return;

    setIsLoadingMoreFoocketing(true);
    try {
      const data = await searchFoocketing({
        keyword,
        sort: foocketingSort,
        cursor: foocketingNextCursor,
      });
      setFoocketings((prev) => [...prev, ...data.content]);
      setFoocketingNextCursor(data.nextCursor);
      setFoocketingHasNextPage(data.hasNextPage);
    } catch (error) {
      console.error('Failed to load more foocketings:', error);
    } finally {
      setIsLoadingMoreFoocketing(false);
    }
  }, [foocketingNextCursor, foocketingHasNextPage, isLoadingMoreFoocketing, keyword, foocketingSort]);

  // 마감세일 무한 스크롤
  const discountObserverTarget = useInfiniteScroll({
    hasNextPage: discountHasNextPage,
    isLoading: isLoadingMoreDiscount,
    onLoadMore: loadMoreDiscount,
    enabled: activeTab === 'discount',
  });

  // 푸켓팅 무한 스크롤
  const foocketingObserverTarget = useInfiniteScroll({
    hasNextPage: foocketingHasNextPage,
    isLoading: isLoadingMoreFoocketing,
    onLoadMore: loadMoreFoocketing,
    enabled: activeTab === 'foocketing',
  });

  // URL 쿼리 파라미터에서 초기값 읽어오기
  useEffect(() => {
    if (keywordFromUrl !== keyword) {
      setKeyword(keywordFromUrl);
    }
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordFromUrl, tabFromUrl]);

  // Home에서 이동한 경우 Input에 자동 focus
  useEffect(() => {
    const state = location.state as { shouldFocus?: boolean } | null;
    if (state?.shouldFocus && inputRef.current) {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 focus
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [location.state]);

  // 검색어가 변경되면 결과 초기화 및 URL 업데이트
  useEffect(() => {
    if (keyword.length === 0) {
      setDiscounts([]);
      setFoocketings([]);
      setDiscountNextCursor(null);
      setFoocketingNextCursor(null);
      // URL에서 검색어 제거
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('q');
        newParams.delete('tab');
        return newParams;
      });
    } else {
      // URL에 검색어와 탭 저장
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('q', keyword);
        newParams.set('tab', activeTab);
        return newParams;
      });
    }
  }, [keyword, activeTab, setSearchParams]);

  const handleTabChange = (index: number) => {
    const newTab = index === 0 ? 'discount' : 'foocketing';
    setActiveTab(newTab);
    // URL 업데이트
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (keyword.length > 0) {
        newParams.set('q', keyword);
      }
      newParams.set('tab', newTab);
      return newParams;
    });
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
  };

  return (
    <>
      <PageHeader title="검색" variant="light" />
      <div className="px-4 space-y-2">
        {/* 검색 입력 */}
          <Input
            ref={inputRef}
            placeholder="먹고 싶은 음식을 검색해보세요"
            value={keyword}
            onChange={(e) => handleSearch(e.target.value)}
            onClearClick={() => handleSearch('')}
            icon={<MagnifyingGlassIcon />}
          />

        {/* 탭 */}
        {keyword.length > 0 && (
          <Tab
            tabLabels={['마감세일', '푸켓팅']}
            defaultSelectedIndex={activeTab === 'discount' ? 0 : 1}
            onTabChange={handleTabChange}
            className="px-0"
          />
        )}

        {/* 검색 결과 */}
        {keyword.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            검색어를 입력해주세요
          </div>
        )}

        {keyword.length > 0 && activeTab === 'discount' && (
          <>
            {isLoadingDiscount && <p className="py-4 text-center">로딩 중...</p>}
            {discountError && (
              <p className="py-4 text-center text-red-500">
                에러: {discountError instanceof Error ? discountError.message : '알 수 없는 에러'}
              </p>
            )}
            {!isLoadingDiscount && !discountError && discounts.length === 0 && (
              <p className="py-4 text-center text-gray-500">검색 결과가 없습니다.</p>
            )}
            {!isLoadingDiscount && !discountError && discounts.length > 0 && (
              <>
                <DiscountList discounts={discounts} />
                <div ref={discountObserverTarget} className="h-4" />
                {isLoadingMoreDiscount && (
                  <p className="py-4 text-center text-gray-500">더 불러오는 중...</p>
                )}
              </>
            )}
          </>
        )}

        {keyword.length > 0 && activeTab === 'foocketing' && (
          <>
            {isLoadingFoocketing && <p className="py-4 text-center">로딩 중...</p>}
            {foocketingError && (
              <p className="py-4 text-center text-red-500">
                에러: {foocketingError instanceof Error ? foocketingError.message : '알 수 없는 에러'}
              </p>
            )}
            {!isLoadingFoocketing && !foocketingError && foocketings.length === 0 && (
              <p className="py-4 text-center text-gray-500">검색 결과가 없습니다.</p>
            )}
            {!isLoadingFoocketing && !foocketingError && foocketings.length > 0 && (
              <>
                <FoocketingList foocketings={foocketings} />
                <div ref={foocketingObserverTarget} className="h-4" />
                {isLoadingMoreFoocketing && (
                  <p className="py-4 text-center text-gray-500">더 불러오는 중...</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
