import { useState, useEffect, useCallback, useRef } from 'react';
import type { FoocketingCategory, FoocketingItem, FoocketingSortType } from '@/types';
import { getFoocketingList } from '@/api';

interface UseFoocketingCategoryOptions {
  initialCategory?: FoocketingCategory;
  sort?: FoocketingSortType;
  lat?: number;
  lng?: number;
}

export function useFoocketingCategory(options: UseFoocketingCategoryOptions = {}) {
  const {
    initialCategory = 1,
    sort = 'IMMINENT',
    lat,
    lng,
  } = options;

  // 현재 선택된 마감세일 카테고리 (베이커리, 회/초밥, 김밥/분식, 샐러드/포케, 기타)
  const [category, setCategory] = useState<FoocketingCategory>(initialCategory);
  
  // API로부터 받아온 마감세일 목록 데이터
  const [foocketings, setFoocketings] = useState<FoocketingItem[]>([]);
  
  // API 요청 중인지 여부 (로딩 상태)
  const [loading, setLoading] = useState(false);
  
  // API 요청 실패 시 에러 정보
  const [error, setError] = useState<Error | null>(null);

  // 초기 마운트 시 API 호출 방지 (React Strict Mode 대응)
  const hasInitialFetch = useRef(false);

  // 마감세일 목록을 API로부터 가져오는 함수
  const fetchFoocketings = useCallback(async (selectedCategory: FoocketingCategory) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getFoocketingList({
        category: selectedCategory,
        sort,
        // lat, lng가 있으면 전달하고, 없으면 API 함수에서 자동으로 가져옴
        ...(lat && lng ? { lat, lng } : {}),
      });
      setFoocketings(data.content);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch foocketings');
      setError(error);
      console.error('Failed to fetch foocketing list:', error);
    } finally {
      setLoading(false);
    }
  }, [sort, lat, lng]);

  // 카테고리 변경 핸들러 (카테고리 변경 시 자동으로 API 요청)
  // 📍 API 요청 트리거 위치 1: changeCategory 호출 시
  const changeCategory = useCallback((newCategory: FoocketingCategory) => {
    setCategory(newCategory);
  }, []);

  // 컴포넌트 마운트 시 또는 lat/lng 변경 시 초기 카테고리의 마감세일 목록 로드
  // 📍 API 요청 트리거 위치 2: 컴포넌트 마운트 시 또는 lat/lng 변경 시
  useEffect(() => {
    // React Strict Mode로 인한 이중 호출 방지 (초기 마운트 시에만)
    if (!hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchFoocketings(category);
      return;
    }

    // lat/lng가 변경되면 API 재호출
    if (lat && lng) {
      fetchFoocketings(category);
    }
  }, [lat, lng, fetchFoocketings, category]); // lat, lng 변경 시 실행

  return {
    category,        // 현재 선택된 카테고리
    foocketings,     // 푸켓팅 목록 데이터
    loading,         // 로딩 상태
    error,           // 에러 정보
    changeCategory,  // 카테고리 변경 함수
    // 📍 API 요청 트리거 위치 3: refetch 호출 시
    refetch: () => fetchFoocketings(category), // ← API 요청 발생 (현재 카테고리 데이터 다시 가져오기)
  };
}

