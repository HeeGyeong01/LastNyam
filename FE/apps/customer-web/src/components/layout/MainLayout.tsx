import { Outlet } from 'react-router-dom';
import { BottomNavBar } from '../common';

export default function MainLayout() {
  return (
    <div className="min-h-screen max-w-[500px] mx-auto pb-20">
      {/* 메인 컨텐츠 - 각 페이지에서 헤더 관리 */}
      <Outlet />
      
      {/* 하단 네비게이션 */}
      <BottomNavBar />
    </div>
  );
}

