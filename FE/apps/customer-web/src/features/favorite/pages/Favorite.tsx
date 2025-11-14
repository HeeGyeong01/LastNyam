import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components';
import { ShopList } from '@/features/shop/component';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { getFavoriteShops } from '@/features/favorite/api';
import type { FavoriteShop, FavoriteShopListData } from '@/features/favorite/type';

// TODO: 백엔드 완성 후 제거 - 가라 데이터 생성 함수
const generateMockFavoriteShops = (page: number = 0): FavoriteShopListData => {
  const shopsPerPage = 5;
  const totalPages = 4; // 총 4페이지 (20개 가게)
  
  const shopNames = [
    '서울 한식당',
    '남대문 분식집',
    '강남 일식집',
    '명동 중국집',
    '이태원 양식당',
    '홍대 파스타',
    '신촌 치킨집',
    '건대 떡볶이',
    '대학로 피자',
    '압구정 카페',
    '청담 스시',
    '한남동 브런치',
    '성수동 베이커리',
    '연남동 파인다이닝',
    '상수동 맛집',
    '망원동 카페',
    '합정동 이탈리안',
    '상암동 중식당',
    '여의도 한정식',
    '잠실 뷔페',
  ];

  const saleMenus = [
    ['후라이드 치킨', '양념 치킨'],
    ['김치찌개', '된장찌개'],
    ['연어초밥', '참치초밥'],
    ['짜장면', '짬뽕'],
    ['스테이크', '파스타'],
    ['크림파스타', '토마토파스타'],
    ['후라이드', '양념치킨'],
    ['떡볶이', '순대'],
    ['페퍼로니', '하와이안'],
    ['아메리카노', '라떼'],
    ['연어', '참치'],
    ['에그베네딕트', '팬케이크'],
    ['크로와상', '마들렌'],
    ['스테이크', '파스타'],
    ['비빔밥', '불고기'],
    ['에스프레소', '카푸치노'],
    ['리조또', '라자냐'],
    ['짜장면', '볶음밥'],
    ['비빔밥', '불고기'],
    ['스시', '사시미'],
  ];

  const startIndex = page * shopsPerPage;
  const endIndex = Math.min(startIndex + shopsPerPage, shopNames.length);
  
  const content: FavoriteShop[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    content.push({
      shopId: i + 1,
      name: shopNames[i],
      lat: 37.5 + (i * 0.01),
      lng: 127.0 + (i * 0.01),
      distance: parseFloat((i * 0.1).toFixed(2)),
      rating: 3.5 + (i % 3) * 0.5,
      ratingCount: 10 + (i * 5),
      onSaleMenus: saleMenus[i] || [],
      bannerUrl: `https://picsum.photos/seed/shop${i + 1}/400/300`,
    });
  }

  const hasNextPage = page < totalPages - 1;
  const nextCursor = hasNextPage ? `cursor_${page + 1}` : null;

  return {
    content,
    nextCursor,
    hasNextPage,
  };
};

// TODO: 백엔드 완성 후 제거 - 가라 데이터 API 함수
const getMockFavoriteShops = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userId: number = 2,
  params: { cursor?: string | null } = {}
): Promise<FavoriteShopListData> => {
  // 로딩 시뮬레이션 (0.5초 딜레이)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const page = params.cursor 
    ? parseInt(params.cursor.replace('cursor_', ''), 10)
    : 0;

  return generateMockFavoriteShops(page);
};

// true: 가라 데이터 사용 (테스트용)
// false: 실제 API 사용 (백엔드 완성 후)
const USE_MOCK_DATA = true;

export default function Favorite() {
  const [shops, setShops] = useState<FavoriteShop[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 첫 페이지 데이터 가져오기
  const {
    data: initialData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['favorite', 'shops', 'initial'],
    queryFn: () => USE_MOCK_DATA 
      ? getMockFavoriteShops(2)
      : getFavoriteShops(2),
    enabled: true,
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setShops(initialData.content);
      setNextCursor(initialData.nextCursor);
      setHasNextPage(initialData.hasNextPage);
    }
  }, [initialData]);

  // 다음 페이지 데이터 가져오기
  const loadMore = useCallback(async () => {
    if (!nextCursor || !hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const data = USE_MOCK_DATA
        ? await getMockFavoriteShops(2, { cursor: nextCursor })
        : await getFavoriteShops(2, { cursor: nextCursor });
      setShops((prev) => [...prev, ...data.content]);
      setNextCursor(data.nextCursor);
      setHasNextPage(data.hasNextPage);
    } catch (error) {
      console.error('Failed to load more shops:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, hasNextPage, isLoadingMore]);

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
          <p className="py-4 text-center text-gray-500">찜한 가게가 없습니다.</p>
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
