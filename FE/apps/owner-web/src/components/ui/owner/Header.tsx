import { MenuIcon, ChevronLeftIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "./IconButton";
import { cn } from "@/lib/utils";

// 경로별 제목 매핑
const pageTitles: Record<string, string> = {
  '/orders/qr-scan': 'QR 스캔',
  '/catalog/menu': '메뉴 관리',
  '/catalog/foocketing': '푸켓팅',
  '/catalog/closeout-sale': '마감세일',
  '/insights/report': '주간 레포트',
  '/settings': '가게 설정',
  '/settings/shop': '가게 관리',
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };
  const handleMenu = () => {
    navigate('/settings');
  };

  // 현재 경로에 해당하는 제목 가져오기, 없으면 기본값 '헤더'
  const title = pageTitles[location.pathname] || '헤더';
  const isQRScanPage = location.pathname === '/orders/qr-scan';
  const shouldHideSettingsButton = ['/orders/qr-scan', '/catalog/menu', '/settings', '/settings/shop'].includes(location.pathname);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 w-full", isQRScanPage ? "bg-brand text-inverse" : "bg-bg-0")}>
      <div className="w-full grid grid-cols-3 items-center px-4 py-3">
        <div className="flex justify-start">
          <IconButton
            icon={ChevronLeftIcon}
            onClick={handleBack}
            iconClassName={isQRScanPage ? "text-inverse" : ""}
            aria-label="뒤로가기"
          />
        </div>
        <div className="flex justify-center">
          <h4 className="h4-b">{title}</h4>
        </div>
        <div className="flex justify-end">
          {!shouldHideSettingsButton && (
            <IconButton
              icon={MenuIcon}
              onClick={handleMenu}
              aria-label="설정"
            />
          )}
        </div>
      </div>
    </header>
  );
}
