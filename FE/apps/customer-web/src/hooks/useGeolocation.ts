import { useState, useEffect } from 'react';
import { getLocation, getLocationSync } from '@/lib/geolocation';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: GeolocationPositionError | null;
}

/**
 * geolocation.ts의 캐시를 활용하여 위치 정보를 React 상태로 제공하는 훅
 * 
 * - geolocation.ts의 전역 캐시를 활용 (중복 호출 방지)
 * - UI에서 위치 정보를 표시할 때 사용
 * - 이미 캐시된 위치 정보가 있으면 즉시 사용
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(() => {
    // 초기 상태: 캐시된 위치 정보가 있으면 즉시 사용
    const cached = getLocationSync();
    return {
      lat: cached.lat,
      lng: cached.lng,
      loading: cached.lat === 37.5665 && cached.lng === 126.9780 ? false : true, // 기본 위치면 이미 로드된 것으로 간주
      error: null,
    };
  });

  useEffect(() => {
    // geolocation.ts의 getLocation()을 사용하여 위치 정보 가져오기
    // 이미 캐시되어 있으면 즉시 반환, 없으면 가져옴
    getLocation()
      .then((location) => {
        setState({
          lat: location.lat,
          lng: location.lng,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        // getLocation()은 항상 성공하므로 (에러 시 기본 위치 반환) 이 부분은 실행되지 않음
        // 하지만 타입 안정성을 위해 추가
        setState({
          lat: null,
          lng: null,
          loading: false,
          error: error as GeolocationPositionError,
        });
      });
  }, []);

  return state;
}

