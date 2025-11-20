import { useEffect, useRef } from 'react';
import { getLocationSync } from '@/shared/lib/geolocation';
import defaultProfileImage from '@/shared/assets/default-profile.png';

interface MarkerData {
  lat: number;
  lng: number;
  title?: string;
  imageUrl?: string; // 음식 사진 URL
  id?: string | number; // 마커 식별자 (클릭 이벤트에서 사용)
}

interface NaverMapProps {
  className?: string;
  style?: React.CSSProperties;
  markers?: MarkerData[];
  onCenterChange?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string | number) => void; // 마커 클릭 핸들러
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  zoomControl?: boolean;
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
  addListener(event: string, listener: () => void): void;
  removeListener(event: string, listener: () => void): void;
}

interface LatLngBounds {
  extend(latlng: LatLng): void;
  getSW(): LatLng;
  getNE(): LatLng;
}

export default function NaverMap({ className = '', style, markers = [], onCenterChange, onMarkerClick, padding, center, zoom = 16, zoomControl = false }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const markerClickListenersRef = useRef<Array<() => void>>([]); // 마커 클릭 리스너 저장
  const centerChangeListenerRef = useRef<(() => void) | null>(null);
  const isUserInteractingRef = useRef(false); // 사용자가 지도를 직접 조작 중인지 여부
  const markersRefProp = useRef(markers); // markers prop의 최신 값을 저장
  const onCenterChangeRef = useRef(onCenterChange); // onCenterChange prop의 최신 값을 저장
  const onMarkerClickRef = useRef(onMarkerClick); // onMarkerClick prop의 최신 값을 저장
  const paddingRef = useRef(padding); // padding prop의 최신 값을 저장
  const centerRef = useRef(center); // center prop의 최신 값을 저장
  const zoomRef = useRef(zoom); // zoom prop의 최신 값을 저장
  const zoomControlRef = useRef(zoomControl); // zoomControl prop의 최신 값을 저장

  // markers, onCenterChange, onMarkerClick, padding, center, zoom, zoomControl의 최신 값을 ref에 저장
  useEffect(() => {
    markersRefProp.current = markers;
    onCenterChangeRef.current = onCenterChange;
    onMarkerClickRef.current = onMarkerClick;
    paddingRef.current = padding;
    centerRef.current = center;
    zoomRef.current = zoom;
    zoomControlRef.current = zoomControl;
  }, [markers, onCenterChange, onMarkerClick, padding, center, zoom, zoomControl]);

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
        // center prop이 있으면 사용, 없으면 현재 위치 가져오기
        const location = centerRef.current || getLocationSync();

        const mapOptions: MapOptions = {
          center: new window.naver.maps.LatLng(location.lat, location.lng),
          zoom: zoomRef.current,
          zoomControl: zoomControlRef.current,
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
      if (!mapInstanceRef.current || !window.naver?.maps) return;

      // 기존 마커 제거 (markers가 비어있어도 제거해야 함)
      markersRef.current.forEach((marker, index) => {
        if (marker) {
          // 리스너를 명시적으로 제거 (메모리 누수 방지)
          const listener = markerClickListenersRef.current[index];
          if (listener && 'removeListener' in marker && typeof (marker as Marker).removeListener === 'function') {
            try {
              (marker as Marker).removeListener('click', listener);
            } catch (error) {
              // 마커가 이미 제거되었거나 유효하지 않은 경우 무시
              // 네이버 지도 API가 자동으로 정리했을 수 있음
            }
          }
          // 마커 제거
          if ('setMap' in marker && typeof (marker as { setMap: (map: Map | null) => void }).setMap === 'function') {
            try {
              (marker as { setMap: (map: Map | null) => void }).setMap(null);
            } catch (error) {
              // 마커가 이미 제거된 경우 무시
            }
          }
        }
      });
      markersRef.current = [];
      markerClickListenersRef.current = [];

      // markers가 비어있으면 여기서 종료
      if (currentMarkers.length === 0) return;

      // 새 마커 추가
      currentMarkers.forEach((markerData) => {
        const markerOptions: MarkerOptions = {
          position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
          map: mapInstanceRef.current!,
          title: markerData.title || '',
        };

        // 이미지 URL이 있으면 커스텀 아이콘으로 설정, 없으면 기본 이미지 사용
        const imageUrl = markerData.imageUrl || defaultProfileImage;
        const iconSize = { width: 50, height: 50 };
        const iconAnchor = { x: 25, y: 50 }; // 이미지 하단 중앙을 기준점으로 설정
        
        // 원형 이미지와 아래 화살표를 포함한 HTML 마커
        const markerHtml = `
          <div style="
            position: relative;
            width: ${iconSize.width}px;
            height: ${iconSize.height + 10}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <img 
              src="${imageUrl}" 
              alt="${markerData.title || ''}"
              style="
                width: ${iconSize.width}px;
                height: ${iconSize.height}px;
                border-radius: 8px;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                object-fit: cover;
              "
              onerror="this.src='${defaultProfileImage}'"
            />
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 10px solid white;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              margin-top: -3px;
            "></div>
          </div>
        `;

        markerOptions.icon = {
          content: markerHtml,
          size: { width: iconSize.width, height: iconSize.height + 10 },
          anchor: iconAnchor,
        };

        const marker = new window.naver.maps.Marker(markerOptions);
        
        // 마커 클릭 이벤트 리스너 추가
        if (markerData.id !== undefined && onMarkerClickRef.current) {
          const clickListener = () => {
            onMarkerClickRef.current!(markerData.id!);
          };
          marker.addListener('click', clickListener);
          markerClickListenersRef.current.push(clickListener);
        }
        
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
    if (mapInstanceRef.current && window.naver?.maps) {
      // 기존 마커 제거 (markers가 비어있어도 제거해야 함)
      markersRef.current.forEach((marker, index) => {
        if (marker) {
          // 리스너를 명시적으로 제거 (메모리 누수 방지)
          const listener = markerClickListenersRef.current[index];
          if (listener && 'removeListener' in marker && typeof (marker as Marker).removeListener === 'function') {
            try {
              (marker as Marker).removeListener('click', listener);
            } catch (error) {
              // 마커가 이미 제거되었거나 유효하지 않은 경우 무시
              // 네이버 지도 API가 자동으로 정리했을 수 있음
            }
          }
          // 마커 제거
          if ('setMap' in marker && typeof (marker as { setMap: (map: Map | null) => void }).setMap === 'function') {
            try {
              (marker as { setMap: (map: Map | null) => void }).setMap(null);
            } catch (error) {
              // 마커가 이미 제거된 경우 무시
            }
          }
        }
      });
      markersRef.current = [];
      markerClickListenersRef.current = [];

      // markers가 비어있으면 여기서 종료
      if (markers.length === 0) return;

      // 새 마커 추가
      markers.forEach((markerData) => {
        const markerOptions: MarkerOptions = {
          position: new window.naver.maps.LatLng(markerData.lat, markerData.lng),
          map: mapInstanceRef.current!,
          title: markerData.title || '',
        };

        // 이미지 URL이 있으면 커스텀 아이콘으로 설정, 없으면 기본 이미지 사용
        const imageUrl = markerData.imageUrl || defaultProfileImage;
        const iconSize = { width: 50, height: 50 };
        const iconAnchor = { x: 25, y: 50 }; // 이미지 하단 중앙을 기준점으로 설정
        
        // 음식 이미지와 아래 화살표를 포함한 HTML 마커
        const markerHtml = `
          <div style="
            position: relative;
            width: ${iconSize.width}px;
            height: ${iconSize.height + 10}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <img 
              src="${imageUrl}" 
              alt="${markerData.title || ''}"
              style="
                width: ${iconSize.width}px;
                height: ${iconSize.height}px;
                border-radius: 8px;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                object-fit: cover;
              "
              onerror="this.src='${defaultProfileImage}'"
            />
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 10px solid white;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              margin-top: -3px;
            "></div>
          </div>
        `;

        markerOptions.icon = {
          content: markerHtml,
          size: { width: iconSize.width, height: iconSize.height + 10 },
          anchor: iconAnchor,
        };

        const marker = new window.naver.maps.Marker(markerOptions);
        
        // 마커 클릭 이벤트 리스너 추가
        if (markerData.id !== undefined && onMarkerClickRef.current) {
          const clickListener = () => {
            onMarkerClickRef.current!(markerData.id!);
          };
          marker.addListener('click', clickListener);
          markerClickListenersRef.current.push(clickListener);
        }
        
        markersRef.current.push(marker);
      });
    }
  }, [markers]);

  return <div ref={mapRef} className={className} style={style} />;
}

