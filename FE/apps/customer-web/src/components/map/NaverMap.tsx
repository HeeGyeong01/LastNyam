import { useEffect, useRef } from 'react';
import { getLocationSync } from '@/lib/geolocation';

interface MarkerData {
  lat: number;
  lng: number;
  title?: string;
}

interface NaverMapProps {
  className?: string;
  style?: React.CSSProperties;
  markers?: MarkerData[];
  onCenterChange?: (lat: number, lng: number) => void;
}

// 네이버 지도 타입 정의
declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: MapOptions) => Map;
        LatLng: new (lat: number, lng: number) => LatLng;
        Marker: new (options: MarkerOptions) => Marker;
        LatLngBounds: new (sw: LatLng, ne: LatLng) => LatLngBounds;
        Position: {
          TOP_RIGHT: string;
        };
      };
    };
  }
}

interface MapOptions {
  center: LatLng;
  zoom: number;
  zoomControl?: boolean;
  zoomControlOptions?: {
    position: string;
  };
}

interface Map {
  // 네이버 지도 인스턴스 메서드들
  fitBounds(bounds: LatLngBounds): void;
  getCenter(): LatLng;
  addListener(event: string, listener: () => void): void;
  removeListener(event: string, listener: () => void): void;
}

interface LatLng {
  lat(): number;
  lng(): number;
}

interface MarkerOptions {
  position: LatLng;
  map: Map;
  title?: string;
  icon?: {
    content: string;
    size?: { width: number; height: number };
    anchor?: { x: number; y: number };
  };
}

interface Marker {
  // 네이버 지도 마커 인스턴스 메서드들
}

interface LatLngBounds {
  extend(latlng: LatLng): void;
  getSW(): LatLng;
  getNE(): LatLng;
}

export default function NaverMap({ className = '', style, markers = [], onCenterChange }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const centerChangeListenerRef = useRef<(() => void) | null>(null);
  const isUserInteractingRef = useRef(false); // 사용자가 지도를 직접 조작 중인지 여부
  const shouldFitBoundsRef = useRef(true); // fitBounds를 호출해야 하는지 여부

  useEffect(() => {
    const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

    if (!CLIENT_ID) {
      console.error('네이버 지도 API 키가 설정되지 않았습니다. VITE_NAVER_MAP_CLIENT_ID 환경변수를 확인해주세요.');
      return;
    }

    let existingScript: HTMLScriptElement | null = null;

    function initializeMap() {
      if (!mapRef.current || !window.naver?.maps) {
        console.error('네이버 지도 API를 초기화할 수 없습니다.');
        return;
      }

      try {
        // 현재 위치 가져오기
        const location = getLocationSync();

        const mapOptions: MapOptions = {
          center: new window.naver.maps.LatLng(location.lat, location.lng),
          zoom: 15,
          zoomControl: false,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        };

        mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
        
        // 마커 추가
        addMarkers();
        
        // 지도 중심 변경 이벤트 리스너 추가
        if (onCenterChange) {
          const handleCenterChange = () => {
            if (mapInstanceRef.current && !isUserInteractingRef.current) {
              const center = mapInstanceRef.current.getCenter();
              onCenterChange(center.lat(), center.lng());
            }
          };
          
          // 사용자가 지도를 직접 조작하는 이벤트 감지
          const handleDragStart = () => {
            isUserInteractingRef.current = true;
            shouldFitBoundsRef.current = false; // 사용자가 조작 중이면 fitBounds 비활성화
          };
          
          const handleDragEnd = () => {
            isUserInteractingRef.current = false;
            // 드래그 종료 후 약간의 지연을 두고 중심 좌표 전달
            setTimeout(() => {
              if (mapInstanceRef.current) {
                const center = mapInstanceRef.current.getCenter();
                onCenterChange(center.lat(), center.lng());
              }
            }, 100);
          };

          const handleZoomChanged = () => {
            // 줌 변경 시에도 사용자 조작으로 간주 (fitBounds로 인한 줌 변경은 제외)
            if (!isUserInteractingRef.current) {
              shouldFitBoundsRef.current = false;
            }
          };
          
          // bounds_changed 이벤트: 지도 이동, 줌 변경 시 발생 (fitBounds로 인한 이동은 제외)
          mapInstanceRef.current.addListener('bounds_changed', handleCenterChange);
          mapInstanceRef.current.addListener('dragstart', handleDragStart);
          mapInstanceRef.current.addListener('dragend', handleDragEnd);
          mapInstanceRef.current.addListener('zoom_changed', handleZoomChanged);
          centerChangeListenerRef.current = handleCenterChange;
          
          // 초기 중심 좌표 전달
          const initialCenter = mapInstanceRef.current.getCenter();
          onCenterChange(initialCenter.lat(), initialCenter.lng());
        }
      } catch (error) {
        console.error('네이버 지도 초기화 중 오류가 발생했습니다:', error);
      }
    }

    function addMarkers() {
      if (!mapInstanceRef.current || !window.naver?.maps || markers.length === 0) return;

      // 기존 마커 제거
      markersRef.current.forEach(marker => {
        if (marker && 'setMap' in marker && typeof (marker as { setMap: (map: Map | null) => void }).setMap === 'function') {
          (marker as { setMap: (map: Map | null) => void }).setMap(null);
        }
      });
      markersRef.current = [];

      // 모든 마커의 좌표를 포함하는 bounds 계산
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;

      // 새 마커 추가 및 bounds 계산
      markers.forEach((markerData) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
          map: mapInstanceRef.current!,
          title: markerData.title || '',
        });
        markersRef.current.push(marker);

        // bounds 계산을 위한 최소/최대 좌표 업데이트
        minLat = Math.min(minLat, markerData.lat);
        maxLat = Math.max(maxLat, markerData.lat);
        minLng = Math.min(minLng, markerData.lng);
        maxLng = Math.max(maxLng, markerData.lng);
      });

      // 모든 마커가 보이도록 지도 범위 조정 (사용자가 직접 조작 중이 아닐 때만)
      if (markers.length > 0 && minLat !== Infinity && shouldFitBoundsRef.current) {
        isUserInteractingRef.current = true; // fitBounds 실행 중에는 사용자 조작으로 간주하지 않음
        const bounds = new window.naver.maps.LatLngBounds(
          new window.naver.maps.LatLng(minLat, minLng), // 남서쪽 모서리
          new window.naver.maps.LatLng(maxLat, maxLng)  // 북동쪽 모서리
        );
        mapInstanceRef.current.fitBounds(bounds);
        // fitBounds 완료 후 플래그 리셋
        setTimeout(() => {
          isUserInteractingRef.current = false;
        }, 500);
      }
    }

    // 네이버 지도 스크립트가 이미 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      initializeMap();
      return;
    }

    // 스크립트가 로드 중인지 확인
    existingScript = document.querySelector(`script[src*="naver.com/openapi"]`) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', initializeMap);
      return () => {
        if (existingScript) {
          existingScript.removeEventListener('load', initializeMap);
        }
      };
    }

    // 네이버 지도 스크립트 동적 로드
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`;
    script.async = true;
    script.onload = initializeMap;
    script.onerror = () => {
      console.error('네이버 지도 스크립트를 로드하는데 실패했습니다.');
      console.error('네이버 클라우드 플랫폼 콘솔에서 현재 도메인(localhost:5173)이 등록되어 있는지 확인해주세요.');
    };
    document.head.appendChild(script);

    return () => {
      // cleanup
      if (existingScript) {
        existingScript.removeEventListener('load', initializeMap);
      }
    };
  }, []);

  // markers가 변경되면 마커 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && window.naver?.maps && markers.length > 0) {
      // 기존 마커 제거
      markersRef.current.forEach(marker => {
        if (marker && 'setMap' in marker && typeof (marker as { setMap: (map: Map | null) => void }).setMap === 'function') {
          (marker as { setMap: (map: Map | null) => void }).setMap(null);
        }
      });
      markersRef.current = [];

      // 모든 마커의 좌표를 포함하는 bounds 계산
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;

      // 새 마커 추가 및 bounds 계산
      markers.forEach((markerData) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
          map: mapInstanceRef.current!,
          title: markerData.title || '',
        });
        markersRef.current.push(marker);

        // bounds 계산을 위한 최소/최대 좌표 업데이트
        minLat = Math.min(minLat, markerData.lat);
        maxLat = Math.max(maxLat, markerData.lat);
        minLng = Math.min(minLng, markerData.lng);
        maxLng = Math.max(maxLng, markerData.lng);
      });

      // 모든 마커가 보이도록 지도 범위 조정 (사용자가 직접 조작 중이 아닐 때만)
      if (minLat !== Infinity && shouldFitBoundsRef.current) {
        isUserInteractingRef.current = true; // fitBounds 실행 중에는 사용자 조작으로 간주하지 않음
        const bounds = new window.naver.maps.LatLngBounds(
          new window.naver.maps.LatLng(minLat, minLng), // 남서쪽 모서리
          new window.naver.maps.LatLng(maxLat, maxLng)  // 북동쪽 모서리
        );
        mapInstanceRef.current.fitBounds(bounds);
        // fitBounds 완료 후 플래그 리셋
        setTimeout(() => {
          isUserInteractingRef.current = false;
        }, 500);
      }
    }
  }, [markers]);

  return <div ref={mapRef} className={className} style={style} />;
}

