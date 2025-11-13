import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Settings, Presentation, Calculator, ChevronRight, Store, TestTube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@shared/src/components/Button";
import { authApi } from "../../auth/apis/auth.api";
import { useOwnerStore } from "@/store/useOwnerStore";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export default function OwnerSettingPage() {
  const navigate = useNavigate();
  const accessToken = useOwnerStore((state) => state.accessToken);
  const ownerId = useOwnerStore((state) => state.ownerId);
  const shops = useOwnerStore((state) => state.shops);
  const setShops = useOwnerStore((state) => state.setShops);
  const clearAuth = useOwnerStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  // 가게 정보 불러오기
  useEffect(() => {
    const fetchShops = async () => {
      if (!ownerId || !accessToken) return;
      
      setIsLoadingShops(true);
      try {
        const response = await authApi.getShops(ownerId, accessToken);
        if (response.status === "SUCCESS" && response.data?.shops) {
          setShops(response.data.shops);
        }
      } catch (error) {
        console.error("가게 정보를 불러오는데 실패했습니다:", error);
      } finally {
        setIsLoadingShops(false);
      }
    };

    fetchShops();
  }, [ownerId, accessToken, setShops]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      navigate("/owner/login", { replace: true });
    }
  };

  // 첫 번째 가게 정보 사용 (여러 가게가 있을 수 있지만 일단 첫 번째 가게를 표시)
  const currentShop = shops.length > 0 ? shops[0] : null;
  const storeImageUrl = currentShop?.shopBanner || null;
  const storeName = currentShop?.shopName || "가게 이름";

  const menuItems: MenuItem[] = [
    {
      icon: ClipboardList,
      label: "메뉴 관리",
      onClick: () => navigate("/owner/catalog/menu"),
    },
    {
      icon: Settings,
      label: "가게 관리",
      onClick: () => navigate("/owner/settings/shop"),
    },
    {
      icon: Presentation,
      label: "가게 통계",
    },
    {
      icon: Calculator,
      label: "거래 기록",
    },
    {
      icon: TestTube,
      label: "오너 테스트",
      onClick: () => navigate("/owner/test"),
    },
  ];

  return (
    <div className="bg-bg-2 flex flex-col gap-2.5 items-start justify-center flex-1 overflow-hidden">
      {/* 상단 가게 정보 섹션 */}
      <div className="bg-bg-0 px-4 py-3 flex flex-row items-center justify-between w-full overflow-hidden">
        {storeImageUrl ? (
          <img 
            src={storeImageUrl} 
            alt="가게 이미지" 
            className="w-[90px] h-[90px] rounded-lg flex-shrink-0 object-cover"
          />
        ) : (
          <div className="w-[90px] h-[90px] bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
            <Store className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <div className="pl-5 flex flex-col gap-2 items-start justify-center flex-1 overflow-hidden">
          <button
            onClick={() => navigate("/owner/settings/shop")}
            className="flex flex-row gap-2.5 items-center justify-start w-full h-9 hover:opacity-80 transition-opacity"
          >
            <div className="text-brand h2-b leading-9 flex items-center justify-start">
              {isLoadingShops ? "로딩 중..." : storeName}
            </div>
            <ChevronRight className="w-6 h-6 flex-shrink-0" />
          </button>
          <Button
            btnStyle="outlined-red"
            btnShape="rounded"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </div>
      </div>

      {/* 서비스 설정 섹션 */}
      <div className="bg-bg-1 flex flex-col gap-2.5 items-start justify-start flex-1 w-full overflow-hidden">
        <div className="bg-bg-0 py-5 flex flex-col gap-3 items-start justify-center w-full overflow-hidden">
          <div className="px-3 py-1.5 flex flex-col gap-2.5 items-start justify-center w-full">
            <div className="text-tertiary text-center h5-b leading-7 flex items-center justify-center">
              서비스 설정
            </div>
          </div>

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="px-5 py-1.5 flex flex-row items-center justify-between w-full overflow-hidden hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-row gap-3 items-center justify-start">
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <div className="text-primary text-center h4-b text-xl leading-7 flex items-center justify-center">
                    {item.label}
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}