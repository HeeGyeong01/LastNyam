import { useState, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import NaverMap from '@/components/map/NaverMap';

interface ShopInfoTabsProps {
  shopDescription?: string;
  shopLat: number;
  shopLng: number;
  shopName: string;
  shopAddress?: string;
  distanceMeters?: number;
  shopPickupEndTime?: string;
}

export default function ShopInfoTabs({
  shopDescription,
  shopLat,
  shopLng,
  shopName,
  shopAddress,
  distanceMeters,
  shopPickupEndTime,
}: ShopInfoTabsProps) {
  const [selectedTab, setSelectedTab] = useState<'noshow' | 'location' | 'introduction'>('noshow');
  const [showToast, setShowToast] = useState(false);

  // 시간 포맷팅: "20:00:00" -> "20:00"
  const formatPickupTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const tabs = [
    { id: 'noshow' as const, label: '픽업 마감시간' },
    { id: 'location' as const, label: '가게 위치' },
    { id: 'introduction' as const, label: '가게 소개' },
  ];

  // 주소 복사 핸들러
  const handleCopyAddress = async () => {
    if (shopAddress) {
      try {
        await navigator.clipboard.writeText(shopAddress);
        setShowToast(true);
      } catch (err) {
        console.error('주소 복사 실패:', err);
      }
    }
  };

  // 토스트 자동 사라지기
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000); // 2초 후 사라짐

      return () => clearTimeout(timer);
    }
  }, [showToast]);


  return (
    <div className="self-stretch flex flex-col mt-2 px-4">
      {/* 탭 헤더 */}
      <div className="flex border-b border-stroke-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 py-2 text-center p2-b relative ${
              selectedTab === tab.id
                ? 'text-brand'
                : 'text-secondary'
            }`}
          >
            {tab.label}
            {selectedTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-4">
        {selectedTab === 'noshow' && (
          <div className="self-stretch flex flex-col gap-4">
            {/* 픽업 시간 안내 */}
            {shopPickupEndTime && (
              <div className="flex flex-col gap-3">
                <div className="text-primary h5-b">
                  {formatPickupTime(shopPickupEndTime)}시 까지 픽업해주세요
                  {/* 경고 메시지 */}
                  <div className="text-brand p2 pt-0.5">
                    이후 방문 시 주문이 취소되며, 환불이 불가하니 유의해주세요
                  </div>
                </div>
                
                
                {/* 안내 사항 */}
                <div className="flex flex-col gap-1 text-secondary p3">
                  <p>• 발급받으신 QR을 음식 수령 시 사장님께 제시해주세요</p>
                  <p>• QR은 주문내역에서 확인할 수 있습니다</p>
                </div>
              </div>
            )}
            {!shopPickupEndTime && (
              <div className="text-secondary p2">
                픽업 시간 정보가 없습니다.
              </div>
            )}
          </div>
        )}

        {selectedTab === 'location' && (
          <div className="self-stretch flex flex-col gap-4">
            {/* 주소 정보 */}
            {shopAddress && (
              <div className="flex items-start gap-1">
                <MapPinIcon className="w-5 h-5 text-tertiary flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-primary p2">{shopAddress}</span>
                  {distanceMeters !== undefined && (
                    <div className="flex gap-2">
                      <p className="text-secondary p3-b">
                        현재 위치로부터 {(distanceMeters / 1000).toFixed(1)}km
                      </p>
                      <p className="text-tertiary p3">|</p>
                      <button 
                        onClick={handleCopyAddress}
                        className="text-brand p3"
                      >
                        {' '}주소복사
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 지도 */}
            <div className="self-stretch h-48 rounded-lg overflow-hidden">
              <NaverMap
                center={{ lat: shopLat, lng: shopLng }}
                markers={[{ lat: shopLat, lng: shopLng, title: shopName }]}
                zoom={16}
                zoomControl={false}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {selectedTab === 'introduction' && (
          <div className="self-stretch text-secondary p2 whitespace-pre-line">
            {shopDescription || '가게 소개가 없습니다.'}
          </div>
        )}
      </div>
      <div className="h-px bg-stroke-subtle"></div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-bg-0 text-secondary p3-b px-6 py-2 rounded-lg shadow-md">
            주소가 복사되었습니다
          </div>
        </div>
      )}
    </div>
  );
}

