import { useState, useEffect, useCallback } from 'react';
import type { DiscountCategory, DiscountItem, DiscountSortType } from '@/types';
import { getDiscountList } from '@/api';

interface UseDiscountCategoryOptions {
  initialCategory?: DiscountCategory;
  sort?: DiscountSortType;
  lat?: number;
  lng?: number;
}

export function useDiscountCategory(options: UseDiscountCategoryOptions = {}) {
  const {
    initialCategory = '베이커리',
    sort = 'FAVORITES',
    lat,
    lng,
  } = options;

  // 현재 선택된 마감세일 카테고리 (베이커리, 회/초밥, 김밥/분식, 샐러드/포케, 기타)
  const [category, setCategory] = useState<DiscountCategory>(initialCategory);
  
  // API로부터 받아온 마감세일 목록 데이터
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  
  // API 요청 중인지 여부 (로딩 상태)
  const [loading, setLoading] = useState(false);
  
  // API 요청 실패 시 에러 정보
  const [error, setError] = useState<Error | null>(null);

  // 마감세일 목록을 API로부터 가져오는 함수
  const fetchDiscounts = useCallback(async (selectedCategory: DiscountCategory) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getDiscountList({
        category: selectedCategory,
        sort,
        // lat, lng가 있으면 전달하고, 없으면 API 함수에서 자동으로 가져옴
        ...(lat && lng ? { lat, lng } : {}),
      });
      setDiscounts(data.items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch discounts');
      setError(error);
      console.error('Failed to fetch discount list:', error);
    } finally {
      setLoading(false);
    }
  }, [sort, lat, lng]);

  // 카테고리 변경 핸들러 (카테고리 변경 시 자동으로 API 요청)
  // 📍 API 요청 트리거 위치 1: changeCategory 호출 시
  const changeCategory = useCallback((newCategory: DiscountCategory) => {
    setCategory(newCategory);
    fetchDiscounts(newCategory); // ← API 요청 발생
  }, [fetchDiscounts]);

  // 컴포넌트 마운트 시 초기 카테고리의 마감세일 목록 로드
  // 📍 API 요청 트리거 위치 2: 컴포넌트 마운트 시
  useEffect(() => {
    fetchDiscounts(category); // ← API 요청 발생
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시에만 실행

  return {
    category,        // 현재 선택된 카테고리
    discounts,       // 마감세일 목록 데이터
    loading,         // 로딩 상태
    error,           // 에러 정보
    changeCategory,  // 카테고리 변경 함수
    // 📍 API 요청 트리거 위치 3: refetch 호출 시
    refetch: () => fetchDiscounts(category), // ← API 요청 발생 (현재 카테고리 데이터 다시 가져오기)
  };
}

