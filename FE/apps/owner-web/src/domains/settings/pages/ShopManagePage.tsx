import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Clock, Package } from "lucide-react";
import { Button } from "@shared/src/components/Button";
import { useOwnerStore } from "@/store/useOwnerStore";
import { authApi } from "../../auth/apis/auth.api";

export default function ShopManagePage() {
  const navigate = useNavigate();
  const accessToken = useOwnerStore((state) => state.accessToken);
  const ownerId = useOwnerStore((state) => state.ownerId);
  const shops = useOwnerStore((state) => state.shops);
  const setShops = useOwnerStore((state) => state.setShops);
  const [isLoading, setIsLoading] = useState(false);

  // 가게 정보 불러오기 (캐시된 데이터가 없으면)
  useEffect(() => {
    const fetchShops = async () => {
      if (!ownerId || !accessToken || shops.length > 0) return;
      
      setIsLoading(true);
      try {
        const response = await authApi.getShops(ownerId, accessToken);
        if (response.status === "SUCCESS" && response.data?.shops) {
          setShops(response.data.shops);
        }
      } catch (error) {
        console.error("가게 정보를 불러오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [ownerId, accessToken, shops.length, setShops]);

  const currentShop = shops.length > 0 ? shops[0] : null;

  if (isLoading) {
    return (
      <div className="bg-bg-2 flex flex-col items-center justify-center flex-1">
        <div className="text-primary text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="bg-bg-2 flex flex-col items-center justify-center flex-1 gap-4">
        <Store className="w-16 h-16 text-gray-400" />
        <div className="text-primary text-lg">가게 정보를 찾을 수 없습니다.</div>
        <Button
          btnStyle="filled-red"
          btnShape="rounded"
          onClick={() => navigate("/owner/settings")}
        >
          돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-bg-2 flex flex-col flex-1 overflow-hidden">
      {/* 가게 배너 이미지 */}
      <div className="bg-bg-0 w-full">
        {currentShop.shopBanner ? (
          <img
            src={currentShop.shopBanner}
            alt={currentShop.shopName}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <Store className="w-20 h-20 text-gray-400" />
          </div>
        )}
      </div>

      {/* 가게 정보 섹션 */}
      <div className="bg-bg-0 mt-2.5 p-5 flex flex-col gap-6">
        {/* 가게 이름 */}
        <div className="flex flex-col gap-2">
          <div className="text-tertiary h5-b text-sm">가게 이름</div>
          <div className="text-primary h4-b text-lg">{currentShop.shopName}</div>
        </div>

        {/* 카테고리 */}
        {currentShop.categoryName && (
          <div className="flex flex-col gap-2">
            <div className="text-tertiary h5-b text-sm">카테고리</div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" />
              <div className="text-primary h4-r">{currentShop.categoryName}</div>
            </div>
          </div>
        )}

        {/* 가게 주소 */}
        <div className="flex flex-col gap-2">
          <div className="text-tertiary h5-b text-sm">주소</div>
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
            <div className="text-primary h4-r">{currentShop.shopAddress}</div>
          </div>
          <div className="text-tertiary text-sm ml-7">
            위도: {currentShop.shopLat.toFixed(6)}, 경도: {currentShop.shopLng.toFixed(6)}
          </div>
        </div>

        {/* 가게 설명 */}
        {currentShop.shopDescription && (
          <div className="flex flex-col gap-2">
            <div className="text-tertiary h5-b text-sm">가게 소개</div>
            <div className="text-primary h4-r whitespace-pre-wrap">
              {currentShop.shopDescription}
            </div>
          </div>
        )}

        {/* 운영 시간 정보 */}
        <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
          <div className="text-tertiary h5-b text-sm">운영 정보</div>
          
          {currentShop.shopCloses && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand" />
              <div className="flex flex-col">
                <div className="text-tertiary text-xs">영업 종료 시간</div>
                <div className="text-primary h4-b">{currentShop.shopCloses}</div>
              </div>
            </div>
          )}

          {currentShop.shopPickupEndTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand" />
              <div className="flex flex-col">
                <div className="text-tertiary text-xs">픽업 마감 시간</div>
                <div className="text-primary h4-b">{currentShop.shopPickupEndTime}</div>
              </div>
            </div>
          )}
        </div>

        {/* 가게 ID (디버깅용) */}
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
          <div className="text-tertiary h5-b text-sm">가게 ID</div>
          <div className="text-tertiary text-sm">{currentShop.shopId}</div>
        </div>
      </div>

      {/* 편집 버튼 (향후 구현) */}
      <div className="bg-bg-0 mt-2.5 p-5">
        <Button
          btnStyle="filled-red"
          btnShape="rounded"
          onClick={() => {
            // TODO: 편집 기능 구현
            alert("가게 정보 편집 기능은 준비 중입니다.");
          }}
          className="w-full"
        >
          가게 정보 수정
        </Button>
      </div>
    </div>
  );
}

