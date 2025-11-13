import { Outlet } from 'react-router-dom';
import { useLayout } from '@/contexts/LayoutContext';

const BOTTOM_NAVBAR_HEIGHT = 80; // BottomNavBar 높이 (pb-20 = 80px)

/**
 * DetailLayout - BottomNavBar가 없는 상세 페이지용 레이아웃
 * 
 * MainLayout과의 차이점:
 * - BottomNavBar가 없음
 * - 기본 padding이 0px (BottomNavBar 높이 80px 제외)
 * - BottomSheet 같은 요소가 등록되면 그 높이만큼만 padding 추가
 */
export default function DetailLayout() {
  const { bottomPadding } = useLayout();
  
  // DetailLayout은 BottomNavBar가 없으므로, Context의 padding에서 BottomNavBar 높이를 뺌
  // 등록된 요소가 없으면 0px, 있으면 그 높이만큼만 padding
  const detailPadding = Math.max(0, bottomPadding - BOTTOM_NAVBAR_HEIGHT);

  return (
    <div 
      className="h-screen max-w-[500px] mx-auto overflow-y-auto"
      style={{ paddingBottom: `${detailPadding}px` }}
    >
      {/* 메인 컨텐츠 - 각 페이지에서 헤더 관리 */}
      <Outlet />
    </div>
  );
}

