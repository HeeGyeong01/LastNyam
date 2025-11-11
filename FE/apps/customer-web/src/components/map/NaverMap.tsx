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
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
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
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
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

export default function NaverMap({ className = '', style, markers = [], onCenterChange, padding }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const centerChangeListenerRef = useRef<(() => void) | null>(null);
  const isUserInteractingRef = useRef(false); // 사용자가 지도를 직접 조작 중인지 여부
  const markersRefProp = useRef(markers); // markers prop의 최신 값을 저장
  const onCenterChangeRef = useRef(onCenterChange); // onCenterChange prop의 최신 값을 저장
  const paddingRef = useRef(padding); // padding prop의 최신 값을 저장

  // markers, onCenterChange, padding의 최신 값을 ref에 저장
  useEffect(() => {
    markersRefProp.current = markers;
    onCenterChangeRef.current = onCenterChange;
    paddingRef.current = padding;
  }, [markers, onCenterChange, padding]);

  useEffect(() => {
    const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

    if (!CLIENT_ID) {
      console.error('네이버 지도 API 키가 설정되지 않았습니다. VITE_NAVER_MAP_CLIENT_ID 환경변수를 확인해주세요.');
      return;
    }

    let scriptElement: HTMLScriptElement | null = null;
    let loadHandler: (() => void) | null = null;
    let isNewScript = false;

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
          zoom: 16,
          zoomControl: false,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
          ...(paddingRef.current && { padding: paddingRef.current }),
        };

        mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
        
        // 마커 추가
        addMarkers();
        
        // 지도 중심 변경 이벤트 리스너 추가
        if (onCenterChangeRef.current) {
          const handleCenterChange = () => {
            if (mapInstanceRef.current && !isUserInteractingRef.current && onCenterChangeRef.current) {
              const center = mapInstanceRef.current.getCenter();
              onCenterChangeRef.current(center.lat(), center.lng());
            }
          };
          
          // 사용자가 지도를 직접 조작하는 이벤트 감지
          const handleDragStart = () => {
            isUserInteractingRef.current = true;
          };
          
          const handleDragEnd = () => {
            isUserInteractingRef.current = false;
            // 드래그 종료 후 약간의 지연을 두고 중심 좌표 전달
            setTimeout(() => {
              if (mapInstanceRef.current && onCenterChangeRef.current) {
                const center = mapInstanceRef.current.getCenter();
                onCenterChangeRef.current(center.lat(), center.lng());
              }
            }, 100);
          };
          
          // bounds_changed 이벤트: 지도 이동, 줌 변경 시 발생
          mapInstanceRef.current.addListener('bounds_changed', handleCenterChange);
          mapInstanceRef.current.addListener('dragstart', handleDragStart);
          mapInstanceRef.current.addListener('dragend', handleDragEnd);
          centerChangeListenerRef.current = handleCenterChange;
          
          // 초기 중심 좌표 전달
          if (onCenterChangeRef.current) {
            const initialCenter = mapInstanceRef.current.getCenter();
            onCenterChangeRef.current(initialCenter.lat(), initialCenter.lng());
          }
        }
      } catch (error) {
        console.error('네이버 지도 초기화 중 오류가 발생했습니다:', error);
      }
    }

    function addMarkers() {
      const currentMarkers = markersRefProp.current;
      if (!mapInstanceRef.current || !window.naver?.maps || currentMarkers.length === 0) return;

      // 기존 마커 제거
      markersRef.current.forEach(marker => {
        if (marker && 'setMap' in marker && typeof (marker as { setMap: (map: Map | null) => void }).setMap === 'function') {
          (marker as { setMap: (map: Map | null) => void }).setMap(null);
        }
      });
      markersRef.current = [];

      // 새 마커 추가
      currentMarkers.forEach((markerData) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
          map: mapInstanceRef.current!,
          title: markerData.title || '',
        });
        markersRef.current.push(marker);
      });
    }

    // 네이버 지도 스크립트가 이미 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      initializeMap();
      return;
    }

    // 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector(`script[src*="naver.com/openapi"]`) as HTMLScriptElement | null;
    if (existingScript) {
      loadHandler = initializeMap;
      existingScript.addEventListener('load', loadHandler);
      scriptElement = existingScript;
      isNewScript = false;
    } else {
      // 네이버 지도 스크립트 동적 로드
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`;
      script.async = true;
      loadHandler = initializeMap;
      script.onload = loadHandler;
      script.onerror = () => {
        console.error('네이버 지도 스크립트를 로드하는데 실패했습니다.');
        console.error('네이버 클라우드 플랫폼 콘솔에서 현재 도메인(localhost:5173)이 등록되어 있는지 확인해주세요.');
      };
      document.head.appendChild(script);
      scriptElement = script;
      isNewScript = true;
    }

    return () => {
      // cleanup: 이벤트 리스너 제거
      if (scriptElement && loadHandler) {
        if (isNewScript) {
          // 새로 생성한 스크립트의 경우 onload 속성을 null로 설정
          scriptElement.onload = null;
        } else {
          // 기존 스크립트의 경우 removeEventListener 사용
          scriptElement.removeEventListener('load', loadHandler);
        }
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

      // 새 마커 추가
      markers.forEach((markerData) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
          map: mapInstanceRef.current!,
          title: markerData.title || '',
        });
        markersRef.current.push(marker);
      });
    }
  }, [markers]);

  return <div ref={mapRef} className={className} style={style} />;
}

