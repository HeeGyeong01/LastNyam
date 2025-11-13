import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components';
import { Tab } from '@shared/components/Tab';
import { Input } from '@shared/components/Input';
import { DiscountList } from '@/features/discount/component';
import { FoocketingList } from '@/features/foocketing/component';
import { searchDiscount } from '@/features/discount/api';
import { searchFoocketing } from '@/features/foocketing/api';
import type { DiscountSearchItem, DiscountSortType } from '@/features/discount/type';
import type { FoocketingSearchItem, FoocketingSortType } from '@/features/foocketing/type';
// Note: SearchTab type is defined locally in this file
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type SearchTab = 'discount' | 'foocketing';

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('discount');
  const [discountSort] = useState<DiscountSortType>('RATING');
  const [foocketingSort] = useState<FoocketingSortType>('IMMINENT');

  // 마감세일 검색 결과 상태
  const [discounts, setDiscounts] = useState<DiscountSearchItem[]>([]);
  const [discountNextCursor, setDiscountNextCursor] = useState<string | null>(null);
  const [discountHasNextPage, setDiscountHasNextPage] = useState(false);
  const [isLoadingMoreDiscount, setIsLoadingMoreDiscount] = useState(false);
  const discountObserverTarget = useRef<HTMLDivElement>(null);

  // 푸켓팅 검색 결과 상태
  const [foocketings, setFoocketings] = useState<FoocketingSearchItem[]>([]);
  const [foocketingNextCursor, setFoocketingNextCursor] = useState<string | null>(null);
  const [foocketingHasNextPage, setFoocketingHasNextPage] = useState(false);
  const [isLoadingMoreFoocketing, setIsLoadingMoreFoocketing] = useState(false);
  const foocketingObserverTarget = useRef<HTMLDivElement>(null);

  // 마감세일 검색 API 호출
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
  });

  // 푸켓팅 검색 API 호출
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
  useEffect(() => {
    if (activeTab !== 'discount') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && discountHasNextPage && !isLoadingMoreDiscount) {
          loadMoreDiscount();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = discountObserverTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [activeTab, discountHasNextPage, isLoadingMoreDiscount, loadMoreDiscount]);

  // 푸켓팅 무한 스크롤
  useEffect(() => {
    if (activeTab !== 'foocketing') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && foocketingHasNextPage && !isLoadingMoreFoocketing) {
          loadMoreFoocketing();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = foocketingObserverTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [activeTab, foocketingHasNextPage, isLoadingMoreFoocketing, loadMoreFoocketing]);

  // 검색어가 변경되면 결과 초기화 (useQuery가 자동으로 다시 호출함)
  useEffect(() => {
    if (keyword.length === 0) {
      setDiscounts([]);
      setFoocketings([]);
      setDiscountNextCursor(null);
      setFoocketingNextCursor(null);
    }
  }, [keyword]);

  const handleTabChange = (index: number) => {
    setActiveTab(index === 0 ? 'discount' : 'foocketing');
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
  };

  return (
    <>
      <PageHeader title="검색" variant="light" />
      <div className="px-4 pb-4">
        {/* 검색 입력 */}
        <div className="pt-4 pb-4">
          <Input
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => handleSearch(e.target.value)}
            icon={<MagnifyingGlassIcon />}
          />
        </div>

        {/* 탭 */}
        {keyword.length > 0 && (
          <Tab
            tabLabels={['마감세일', '푸켓팅']}
            defaultSelectedIndex={activeTab === 'discount' ? 0 : 1}
            onTabChange={handleTabChange}
          />
        )}

        {/* 검색 결과 */}
        {keyword.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            검색어를 입력해주세요
          </div>
        )}

        {keyword.length > 0 && activeTab === 'discount' && (
          <div className="pt-4">
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
          </div>
        )}

        {keyword.length > 0 && activeTab === 'foocketing' && (
          <div className="pt-4">
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
          </div>
        )}
      </div>
    </>
  );
}
