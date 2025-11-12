import { useState } from 'react';
import NaverMap from '@/components/map/NaverMap';

interface ShopInfoTabsProps {
  shopDescription?: string;
  shopLat: number;
  shopLng: number;
  shopName: string;
  shopAddress?: string;
  distanceMeters?: number;
}

export default function ShopInfoTabs({
  shopDescription,
  shopLat,
  shopLng,
  shopName,
  shopAddress,
  distanceMeters,
}: ShopInfoTabsProps) {
  const [selectedTab, setSelectedTab] = useState<'noshow' | 'location' | 'introduction'>('location');

  const tabs = [
    { id: 'noshow' as const, label: '노쇼 시간' },
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
    <div className="self-stretch flex flex-col">
      {/* 탭 헤더 */}
      <div className="flex border-b border-stroke-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 py-3 text-center p2-b relative ${
              selectedTab === tab.id
                ? 'text-primary'
                : 'text-secondary'
            }`}
          >
            {tab.label}
            {selectedTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="mt-4">
        {selectedTab === 'noshow' && (
          <div className="self-stretch text-secondary p2">
            {/* TODO: 노쇼 시간 정보 표시 */}
            노쇼 시간 정보가 곧 추가될 예정입니다.
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
    </div>
  );
}

