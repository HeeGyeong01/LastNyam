import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { FoocketingCategory, FoocketingSortType } from '@/types';
import { getFoocketingList } from '@/api';

interface UseFoocketingListOptions {
  initialCategory?: FoocketingCategory;
  sort?: FoocketingSortType;
  lat?: number;
  lng?: number;
}

export function useFoocketingList(options: UseFoocketingListOptions = {}) {
  const {
    initialCategory = 1,
    sort = 'IMMINENT',
    lat,
    lng,
  } = options;

  // 현재 선택된 푸켓팅 카테고리 (베이커리, 회/초밥, 김밥/분식, 샐러드/포케, 기타)
  const [category, setCategory] = useState<FoocketingCategory>(initialCategory);
  
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

  // 푸켓팅 카테고리 변경 핸들러
  // category가 변경되면 queryKey가 변경되어 자동으로 새로운 데이터를 가져옴
  const changeCategory = useCallback((newCategory: FoocketingCategory) => {
    setCategory(newCategory);
  }, []);

  return {
    category,        // 현재 선택된 푸켓팅 카테고리
    foocketings: data?.content ?? [], // 푸켓팅 목록 데이터
    loading,         // 로딩 상태
    error: error as Error | null, // 에러 정보
    changeCategory,  // 푸켓팅 카테고리 변경 함수
    refetch,         // 수동 리페칭 함수
  };
}

