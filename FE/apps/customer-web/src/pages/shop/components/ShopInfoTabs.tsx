import { useState } from 'react';
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

  const handleCopyAddress = () => {
    if (shopAddress) {
      navigator.clipboard.writeText(shopAddress);
      // TODO: 복사 완료 토스트 메시지 표시
    }
  };

  return (
    <div className="self-stretch flex flex-col mt-2">
      {/* 탭 헤더 */}
      <div className="flex border-b border-stroke-subtle">
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
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-primary p2">{shopAddress}</span>
                    {distanceMeters !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-secondary p2">
                          현재 위치로부터 {(distanceMeters / 1000).toFixed(1)}km
                        </span>
                        {shopAddress && (
                          <>
                            <div className="w-px h-4 bg-stroke-subtle" />
                            <button
                              onClick={handleCopyAddress}
                              className="flex items-center gap-1 text-primary p2"
                            >
                              <span>주소복사</span>
                              <svg
                                className="w-4 h-4 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
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
    </div>
  );
}

