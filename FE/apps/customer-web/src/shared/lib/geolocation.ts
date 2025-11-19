// 기본 위치 (멀티캠퍼스 좌표)
const DEFAULT_LOCATION = {
  lat: 37.50138084380271,
  lng: 127.03973267428898,
};

// 캐시 유효 시간 (1분) - 위치 정보는 자주 변경될 수 있으므로 짧게 설정
const CACHE_MAX_AGE = 1 * 60 * 1000; // 1분

// 위치 정확도 임계값 (미터 단위) - 이 값보다 정확도가 낮으면 신뢰하지 않음
// IP 기반 위치는 정확도가 매우 낮을 수 있으므로, GPS 수준의 정확도만 허용
const ACCURACY_THRESHOLD = 100; // 100m 이상 오차면 신뢰하지 않음 (GPS 수준)

// 전역 위치 정보 저장소
interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number; // 캐시된 시간
}

let cachedLocation: CachedLocation | null = null;
let locationPromise: Promise<{ lat: number; lng: number }> | null = null;

/**
 * 위치 정보를 가져옵니다.
 * 
 * @param forceRefresh - true면 캐시를 무시하고 새로운 위치 정보를 가져옵니다 (기본값: false)
 */
export function getLocation(forceRefresh: boolean = false): Promise<{ lat: number; lng: number }> {
  // forceRefresh가 true면 캐시 무시
  if (forceRefresh) {
    cachedLocation = null;
    locationPromise = null;
  }

  // 캐시된 위치 정보가 있고 유효하면 즉시 반환
  if (cachedLocation) {
    const age = Date.now() - cachedLocation.timestamp;
    if (age < CACHE_MAX_AGE) {
      // console.log('[Geolocation] 캐시된 위치 정보 사용:', {
      //   lat: cachedLocation.lat,
      //   lng: cachedLocation.lng,
      //   age: Math.round(age / 1000) + '초 전',
      // });
      return Promise.resolve({ lat: cachedLocation.lat, lng: cachedLocation.lng });
    } else {
      // 캐시가 만료되었으면 무효화
      // console.log('[Geolocation] 캐시 만료, 새로 가져옴');
      cachedLocation = null;
    }
  }

  // 이미 위치 정보를 가져오는 중이면 기존 Promise 반환
  if (locationPromise) {
    return locationPromise;
  }

  // 위치 정보 가져오기
  locationPromise = new Promise((resolve) => {
    // Geolocation API 지원 여부 확인
    if (!navigator.geolocation) {
      // console.warn('Geolocation API를 지원하지 않아 기본 위치(서울)를 사용합니다.');
      // 기본 위치는 캐시하지 않고 바로 반환
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 실제 위치 정보를 가져온 경우에만 캐시에 저장
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        const accuracy = position.coords.accuracy; // 정확도 (미터 단위)
        
        // 디버깅: 위치 정보 로그 출력
        // 참고: accuracy가 1000m 이상이면 IP 기반 위치 추정일 가능성이 높음
        // const isLikelyIPBased = accuracy > 1000;
        // console.log('[Geolocation] 위치 정보 가져옴:', {
        //   lat: location.lat,
        //   lng: location.lng,
        //   accuracy: accuracy,
        //   accuracyKm: (accuracy / 1000).toFixed(2) + 'km',
        //   likelyIPBased: isLikelyIPBased ? '⚠️ IP 기반 위치 추정 (부정확할 수 있음)' : '✅ GPS/Wi-Fi 기반 (정확함)',
        //   altitude: position.coords.altitude,
        //   altitudeAccuracy: position.coords.altitudeAccuracy,
        //   heading: position.coords.heading,
        //   speed: position.coords.speed,
        //   timestamp: new Date().toISOString(),
        // });
        
        // 정확도가 너무 낮으면 (1km 이상 오차) 신뢰하지 않고 기본 위치 사용
        if (accuracy > ACCURACY_THRESHOLD) {
          // console.warn('[Geolocation] 위치 정확도가 낮아 기본 위치를 사용합니다:', {
          //   accuracy: accuracy,
          //   accuracyKm: (accuracy / 1000).toFixed(2) + 'km',
          //   threshold: ACCURACY_THRESHOLD / 1000 + 'km',
          //   receivedLocation: location,
          // });
          // 기본 위치는 캐시하지 않고 바로 반환
          resolve(DEFAULT_LOCATION);
          return;
        }
        
        cachedLocation = {
          ...location,
          timestamp: Date.now(),
        };
        resolve(location);
      },
      // (error) => {
      () => {
        // 위치 권한 거부 또는 에러 발생 시 기본 위치(서울) 사용
        // 하지만 기본 위치는 캐시하지 않음 (매번 다시 시도하도록)
        // console.warn('[Geolocation] 위치 정보를 가져올 수 없어 기본 위치(서울)를 사용합니다:', {
        //   error: error.message,
        //   code: error.code,
        //   timestamp: new Date().toISOString(),
        // });
        // 기본 위치는 캐시하지 않고 바로 반환
        resolve(DEFAULT_LOCATION);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // 브라우저 캐시 사용 안 함
      }
    );
  });

  return locationPromise;
}

/**
 * 위치 정보를 동기적으로 가져옵니다.
 * 캐시된 위치 정보가 있고 유효하면 반환하고, 없으면 기본 위치를 반환합니다.
 * 주의: 이 함수는 캐시된 값만 반환하므로, 실제 위치 정보가 필요하면 getLocation()을 사용하세요.
 */
export function getLocationSync(): { lat: number; lng: number } {
  if (cachedLocation) {
    const age = Date.now() - cachedLocation.timestamp;
    if (age < CACHE_MAX_AGE) {
      return { lat: cachedLocation.lat, lng: cachedLocation.lng };
    }
  }
  return DEFAULT_LOCATION;
}

/**
 * 위치 정보 캐시를 초기화합니다.
 */
export function clearLocationCache(): void {
  cachedLocation = null;
  locationPromise = null;
}

