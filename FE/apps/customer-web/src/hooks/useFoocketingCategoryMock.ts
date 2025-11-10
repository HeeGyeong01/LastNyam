import { useState, useEffect, useCallback, useRef } from 'react';
import type { FoocketingCategory, FoocketingItem, FoocketingSortType } from '@/types';
import { getFoocketingList } from '@/api';

interface UseFoocketingCategoryMockOptions {
  initialCategory?: FoocketingCategory;
  sort?: FoocketingSortType;
  lat?: number;
  lng?: number;
}

// 임시 Mock 데이터 (API 응답이 비어있을 때 사용)
const MOCK_DATA: FoocketingItem[] = [
  {
    foocketingId: 1,
    openTime: '2025-11-10T11:00:00',
    menu: {
      name: '초밥',
      price: 12500,
      photoUrl: 'test',
    },
    shop: {
      name: '미스터 초밥왕',
      lat: 37.0,
      lng: 127.0,
      distance: 1.8,
      rating: 3.4,
      ratingCount: 33,
    },
  },
  {
    foocketingId: 2,
    openTime: '2025-11-10T12:00:00',
    menu: {
      name: '연어 초밥',
      price: 15000,
      photoUrl: 'test',
    },
    shop: {
      name: '스시마스터',
      lat: 37.1,
      lng: 127.1,
      distance: 2.5,
      rating: 4.2,
      ratingCount: 45,
    },
  },
  {
    foocketingId: 3,
    openTime: '2025-11-10T13:00:00',
    menu: {
      name: '특선 초밥',
      price: 20000,
      photoUrl: 'test',
    },
    shop: {
      name: '초밥의 달인',
      lat: 37.2,
      lng: 127.2,
      distance: 3.2,
      rating: 4.8,
      ratingCount: 120,
    },
  },
];

/**
 * API 호출을 시도하되, 응답이 비어있거나 실패하면 Mock 데이터를 사용하는 훅
 * 백엔드 API가 완성되면 useFoocketingCategory로 교체
 */
export function useFoocketingCategoryMock(options: UseFoocketingCategoryMockOptions = {}) {
  const {
    initialCategory = 1,
    sort = 'IMMINENT',
    lat,
    lng,
  } = options;

  // 현재 선택된 카테고리
  const [category, setCategory] = useState<FoocketingCategory>(initialCategory);
  
  // 푸켓팅 목록 데이터
  const [foocketings, setFoocketings] = useState<FoocketingItem[]>([]);
  
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  
  // 에러 정보
  const [error, setError] = useState<Error | null>(null);

  // 초기 마운트 시 API 호출 방지 (React Strict Mode 대응)
  const hasInitialFetch = useRef(false);

  // API 호출을 시도하고, 실패하거나 비어있으면 Mock 데이터 사용
  const fetchFoocketings = useCallback(async (selectedCategory: FoocketingCategory) => {
    setLoading(true);
    setError(null);
    
    try {
      // 실제 API 호출 시도
      const data = await getFoocketingList({
        cat: selectedCategory,
        sort,
        // lat, lng가 있으면 전달하고, 없으면 API 함수에서 자동으로 가져옴
        ...(lat && lng ? { lat, lng } : {}),
      });
      
      // API 응답이 비어있으면 Mock 데이터 사용
      if (data.content && data.content.length > 0) {
        setFoocketings(data.content);
      } else {
        console.log('API 응답이 비어있어 Mock 데이터를 사용합니다.');
        setFoocketings(MOCK_DATA);
      }
    } catch (err) {
      // API 호출 실패 시 Mock 데이터 사용
      console.warn('API 호출 실패, Mock 데이터를 사용합니다:', err);
      setFoocketings(MOCK_DATA);
      const error = err instanceof Error ? err : new Error('Failed to fetch foocketings');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [sort, lat, lng]);

  // 카테고리 변경 핸들러
  const changeCategory = useCallback((newCategory: FoocketingCategory) => {
    setCategory(newCategory);
    fetchFoocketings(newCategory);
  }, [fetchFoocketings]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // React Strict Mode로 인한 이중 호출 방지
    if (hasInitialFetch.current) {
      return;
    }
    hasInitialFetch.current = true;
    
    fetchFoocketings(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시에만 실행

  return {
    category,        // 현재 선택된 카테고리
    foocketings,     // 푸켓팅 목록 데이터 (Mock)
    loading,         // 로딩 상태
    error,           // 에러 정보
    changeCategory,  // 카테고리 변경 함수
    refetch: () => fetchFoocketings(category), // 데이터 다시 가져오기
  };
}

