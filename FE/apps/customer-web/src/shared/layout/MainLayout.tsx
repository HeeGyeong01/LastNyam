import { Outlet } from 'react-router-dom';
import { BottomNavBar } from '../components';
import { useLayout } from '@/contexts/LayoutContext';

export default function MainLayout() {
  const { bottomPadding } = useLayout();

  return (
    <>
      <div 
        className="h-screen max-w-[500px] mx-auto overflow-y-auto"
        style={{ paddingBottom: `${bottomPadding}px` }}
      >
        {/* 메인 컨텐츠 - 각 페이지에서 헤더 관리 */}
        <Outlet />
      </div>
      
      {/* 하단 네비게이션 - 독립적으로 fixed */}
      <BottomNavBar />
    </>
  );
}

