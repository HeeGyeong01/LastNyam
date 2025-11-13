// 기본 위치 (멀티캠퍼스 좌표)
const DEFAULT_LOCATION = {
  lat: 37.50138084380271,
  lng: 127.03973267428898,
};

// 전역 위치 정보 저장소
let cachedLocation: { lat: number; lng: number } | null = null;
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

  // 이미 캐시된 위치 정보가 있으면 즉시 반환
  if (cachedLocation) {
    return Promise.resolve(cachedLocation);
  }

  // 이미 위치 정보를 가져오는 중이면 기존 Promise 반환
  if (locationPromise) {
    return locationPromise;
  }

  // 위치 정보 가져오기
  locationPromise = new Promise((resolve) => {
    // Geolocation API 지원 여부 확인
    if (!navigator.geolocation) {
      console.warn('Geolocation API를 지원하지 않아 기본 위치(서울)를 사용합니다.');
      cachedLocation = DEFAULT_LOCATION;
      resolve(cachedLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        cachedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        resolve(cachedLocation);
      },
      (error) => {
        // 위치 권한 거부 또는 에러 발생 시 기본 위치(서울) 사용
        console.warn('위치 정보를 가져올 수 없어 기본 위치(서울)를 사용합니다:', error);
        cachedLocation = DEFAULT_LOCATION;
        resolve(cachedLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });

  return locationPromise;
}

/**
 * 위치 정보를 동기적으로 가져옵니다.
 * 캐시된 위치 정보가 있으면 반환하고, 없으면 기본 위치를 반환합니다.
 */
export function getLocationSync(): { lat: number; lng: number } {
  return cachedLocation ?? DEFAULT_LOCATION;
}

/**
 * 위치 정보 캐시를 초기화합니다.
 */
export function clearLocationCache(): void {
  cachedLocation = null;
  locationPromise = null;
}

