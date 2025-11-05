import { MenuIcon, ChevronLeftIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "./IconButton";

// 경로별 제목 매핑
const pageTitles: Record<string, string> = {
  '/owner/orders/qr-scan': 'QR 스캔',
  '/owner/catalog/menu': '메뉴 관리',
  '/owner/catalog/foocketing': '푸켓팅',
  '/owner/catalog/closeout-sale': '마감세일',
  '/owner/insights/report': '주간 레포트',
  '/owner/settings': '가게 설정',
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };
  const handleMenu = () => {
    navigate('/owner/settings');
  };

  // 현재 경로에 해당하는 제목 가져오기, 없으면 기본값 '헤더'
  const title = pageTitles[location.pathname] || '헤더';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-bg-0">
      <div className="w-full flex items-center justify-between px-4 py-3">
        <IconButton
          icon={ChevronLeftIcon}
          onClick={handleBack}
          aria-label="뒤로가기"
        />
        <h4 className="h4-b">{title}</h4>
        <IconButton
          icon={MenuIcon}
          onClick={handleMenu}
          aria-label="설정"
        />
      </div>
    </header>
  );
}
