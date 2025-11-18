import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import type { FoocketingCategory, FoocketingSortType, FoocketingItem } from '../type/foocketing';
import { getFoocketingList } from '../api/foocketing';

interface UseFoocketingListOptions {
  initialCategory?: FoocketingCategory;
  sort?: FoocketingSortType;
  lat?: number;
  lng?: number;
}

export function useFoocketingList(options: UseFoocketingListOptions = {}) {
  const {
    initialCategory,
    sort = 'IMMINENT',
    lat,
    lng,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL 쿼리 파라미터에서 카테고리 읽기, 없으면 initialCategory 또는 기본값 1
  const categoryFromUrl = searchParams.get('category');
  const defaultCategory = initialCategory ?? 1;
  const initialCategoryValue = categoryFromUrl 
    ? (Number(categoryFromUrl) as FoocketingCategory)
    : defaultCategory;

  // 현재 선택된 푸켓팅 카테고리 (베이커리, 회/초밥, 김밥/분식, 샐러드/포케, 기타)
  const [category, setCategory] = useState<FoocketingCategory>(initialCategoryValue);
  
  // 무한스크롤을 위한 누적 데이터
  const [allFoocketings, setAllFoocketings] = useState<FoocketingItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // URL 쿼리 파라미터 변경 시 category 동기화 (브라우저 뒤로가기/앞으로가기 대응)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      const urlCategory = Number(categoryFromUrl) as FoocketingCategory;
      if (urlCategory !== category) {
        setCategory(urlCategory);
      }
    }
  }, [searchParams, category]);
  
  // 디바운싱된 좌표 (지도 이동 시 디바운싱 후 업데이트)
  const [debouncedLat, setDebouncedLat] = useState<number | undefined>(lat);
  const [debouncedLng, setDebouncedLng] = useState<number | undefined>(lng);
  const debounceTimeoutRef = useRef<number | null>(null);

  // lat, lng 변경 시 디바운싱 적용
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedLat(lat);
      setDebouncedLng(lng);
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [lat, lng]);

  // React Query를 사용한 푸켓팅 목록 조회
  // queryKey에는 디바운싱된 좌표만 포함하여 불필요한 API 호출 방지
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['foocketing', 'list', category, sort, debouncedLat, debouncedLng],
    queryFn: () => getFoocketingList({
      category,
      sort,
      // 디바운싱된 lat, lng가 있으면 전달하고, 없으면 API 함수에서 자동으로 가져옴
      ...(debouncedLat && debouncedLng ? { lat: debouncedLat, lng: debouncedLng } : {}),
    }),
    enabled: true,
  });

  // 초기 데이터 로드 시 누적 데이터 초기화 및 업데이트
  useEffect(() => {
    if (data) {
      setAllFoocketings(data.content);
      setNextCursor(data.nextCursor);
      setHasNextPage(data.hasNextPage);
    }
  }, [data]);

  // category, sort, debouncedLat, debouncedLng 변경 시 누적 데이터 초기화
  useEffect(() => {
    setAllFoocketings([]);
    setNextCursor(null);
    setHasNextPage(false);
  }, [category, sort, debouncedLat, debouncedLng]);

  // 다음 페이지 로드 함수
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || !nextCursor) return;

    setIsLoadingMore(true);
    try {
      const moreData = await getFoocketingList({
        category,
        sort,
        ...(debouncedLat && debouncedLng ? { lat: debouncedLat, lng: debouncedLng } : {}),
        cursor: nextCursor,
      });
      
      setAllFoocketings((prev) => [...prev, ...moreData.content]);
      setNextCursor(moreData.nextCursor);
      setHasNextPage(moreData.hasNextPage);
    } catch (error) {
      console.error('Failed to load more foocketings:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isLoadingMore, nextCursor, category, sort, debouncedLat, debouncedLng]);

  // 푸켓팅 카테고리 변경 핸들러
  // category가 변경되면 queryKey가 변경되어 자동으로 새로운 데이터를 가져옴
  // URL 쿼리 파라미터도 함께 업데이트하여 뒤로가기 시 카테고리 유지
  const changeCategory = useCallback((newCategory: FoocketingCategory) => {
    setCategory(newCategory);
    // URL 쿼리 파라미터 업데이트
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('category', String(newCategory));
      return newParams;
    });
  }, [setSearchParams]);

  return {
    category,        // 현재 선택된 푸켓팅 카테고리
    foocketings: allFoocketings, // 누적된 푸켓팅 목록 데이터
    loading,         // 초기 로딩 상태
    isLoadingMore,   // 추가 데이터 로딩 상태
    error: error as Error | null, // 에러 정보
    changeCategory,  // 푸켓팅 카테고리 변경 함수
    refetch,         // 수동 리페칭 함수
    hasNextPage,     // 다음 페이지 존재 여부
    loadMore,        // 다음 페이지 로드 함수
  };
}

